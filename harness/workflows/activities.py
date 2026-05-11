"""
harness/workflows/activities.py
================================
Temporal activity definitions for the Geometry Agent Harness.

PRD §8.2: Five workers, each executing a bounded activity set.
PRD §8.1: Workers own bounded execution; Temporal owns durable progression.

All activities are pure functions (no shared mutable state).
Heavy geometry evidence is persisted to the artifact store; only URIs
are returned to the workflow for Temporal history compliance (PRD §9.5).

CADSmith mapping:
  PlanningActivity   ← Planner agent (agents.plan)
  GeometryActivity   ← Coder + Executor + Error Refiner inner loop
  VerifierActivity   ← Judge (agents.evaluate_geometry / validator.py)
  RefinerActivity    ← Refiner agent (agents.refine_geometry)
  HandoffActivity    ← forgecad_emit + trace_capture
"""

from __future__ import annotations

import os
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from temporalio import activity

# ---------------------------------------------------------------------------
# Ensure CADSmith is importable
# ---------------------------------------------------------------------------
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_CADSMITH_DIR = _PROJECT_ROOT / "CADSmith"
if str(_CADSMITH_DIR) not in sys.path:
    sys.path.insert(0, str(_CADSMITH_DIR))

from autofab import agents  # noqa: E402

from harness.artifacts.store import get_store
from harness.runtime.primitives import (
    execute_with_retries,
    forgecad_emit,
    mesh_inspect,
    primitive_plan,
    render_views,
    solid_generate,
    trace_capture,
    visual_verify,
)
from harness.schema.primitives import PrimitivePlan, SchemaValidationError
from harness.schema.trace import (
    FailureCategory,
    GeometryEvidence,
    IterationRecord,
    RepairAction,
    TraceArtifact,
    VerifierScore,
)


# ---------------------------------------------------------------------------
# I/O dataclasses (serialisable to/from JSON by Temporal's codec)
# ---------------------------------------------------------------------------


@dataclass
class PlanningInput:
    workflow_id: str
    prompt: str
    project_context: Optional[str] = None


@dataclass
class PlanningOutput:
    plan_dict: dict                        # PrimitivePlan.model_dump()
    plan_artifact_uri: str
    ambiguous: bool = False
    ambiguity_questions: list = None       # type: ignore[assignment]

    def __post_init__(self):
        if self.ambiguity_questions is None:
            self.ambiguity_questions = []


@dataclass
class GeometryInput:
    workflow_id: str
    prompt: str
    plan_dict: dict
    name: str
    iteration: int
    max_error_retries: int = 3
    refiner_feedback: Optional[str] = None


@dataclass
class GeometryOutput:
    success: bool
    cadquery_code: str
    geometry_evidence_dict: Optional[dict]  # GeometryEvidence.model_dump()
    step_artifact_uri: Optional[str]
    stl_artifact_uri: Optional[str]
    render_artifact_uri: Optional[str]
    repair_actions_dicts: list              # list[RepairAction.model_dump()]
    error: Optional[str] = None
    error_type: Optional[str] = None

    def __post_init__(self):
        if self.repair_actions_dicts is None:
            self.repair_actions_dicts = []


@dataclass
class VerifierInput:
    workflow_id: str
    prompt: str
    cadquery_code: str
    geometry_evidence_dict: dict
    render_artifact_uri: Optional[str]
    prior_feedback: list                   # list[str]


@dataclass
class VerifierOutput:
    passed: bool
    feedback: str
    failure_category: Optional[str] = None


@dataclass
class RefinerInput:
    workflow_id: str
    prompt: str
    plan_dict: dict
    cadquery_code: str
    feedback: str
    iteration: int
    history: list = None                   # list[dict] previous attempts

    def __post_init__(self):
        if self.history is None:
            self.history = []


@dataclass
class RefinerOutput:
    refined_code: str


@dataclass
class HandoffInput:
    workflow_id: str
    trace_id: str
    prompt: str
    plan_dict: dict
    cadquery_code: str
    iteration: int
    step_artifact_uri: Optional[str]
    stl_artifact_uri: Optional[str]
    render_artifact_uri: Optional[str]
    # Full iteration history for trace
    iteration_records_dicts: list          # list[IterationRecord.model_dump()]
    final_verifier_score_dict: Optional[dict]
    total_llm_calls: int
    total_time_ms: float


@dataclass
class HandoffOutput:
    forgecad_artifact_uri: str
    trace_artifact_uri: str
    metadata: dict


# ---------------------------------------------------------------------------
# Activity: W·02 Planning Worker
# ---------------------------------------------------------------------------


@activity.defn(name="planning_activity")
async def planning_activity(inp: PlanningInput) -> PlanningOutput:
    """
    Runs the Planner agent and validates output against the typed schema.

    PRD §8.2 W·02: produces a typed primitive plan plus assumptions.
    Ambiguous intent is surfaced here rather than silently ignored.
    """
    store = get_store()
    activity.logger.info(
        f"[planning] workflow={inp.workflow_id} prompt={inp.prompt[:80]}"
    )

    try:
        plan = primitive_plan(inp.prompt, project_context=inp.project_context)
    except SchemaValidationError as exc:
        activity.logger.error(f"[planning] Schema validation failed: {exc}")
        raise

    # Persist the plan to the artifact store
    plan_uri = store.put_json(
        inp.workflow_id,
        "plan",
        plan.model_dump(),
        filename=f"plan_{uuid.uuid4().hex[:8]}.json",
    )

    activity.logger.info(
        f"[planning] Plan validated. ambiguous={plan.ambiguous} "
        f"features={len(plan.features)} plan_uri={plan_uri}"
    )

    return PlanningOutput(
        plan_dict=plan.model_dump(),
        plan_artifact_uri=plan_uri,
        ambiguous=plan.ambiguous,
        ambiguity_questions=plan.ambiguity_questions,
    )


# ---------------------------------------------------------------------------
# Activity: W·03 Geometry Worker
# ---------------------------------------------------------------------------


@activity.defn(name="geometry_activity")
async def geometry_activity(inp: GeometryInput) -> GeometryOutput:
    """
    Generates CadQuery code, runs it in a sandboxed subprocess, runs the
    inner error-fix loop, extracts OCCT measurements, and renders three views.

    PRD §8.2 W·03: produces canonical CadQuery solids, OCCT measurements,
    and rendered PNG.
    PRD §7.2 Step 3–4: CadQuery generation + OCCT inspection + inner loop.
    """
    store = get_store()
    output_dir = str(store.base_path / inp.workflow_id / "geometry_work")
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    plan = PrimitivePlan.model_validate(inp.plan_dict)

    activity.logger.info(
        f"[geometry] workflow={inp.workflow_id} iter={inp.iteration} "
        f"name={inp.name}"
    )

    # ── Code generation ──────────────────────────────────────────────────
    if inp.refiner_feedback:
        # Outer-loop re-entry: use Refiner to produce new code
        design_plan_dict = plan.to_cadsmith_dict()
        code = agents.refine_geometry(
            inp.refiner_feedback,      # passed as code param intentionally
            inp.refiner_feedback,
            design_plan_dict,
            inp.prompt,
            iteration=inp.iteration,
        )
    else:
        code = solid_generate(plan, inp.prompt)

    # ── Inner error-fix loop ─────────────────────────────────────────────
    exec_result, repair_actions = execute_with_retries(
        code=code,
        plan=plan,
        name=inp.name,
        output_dir=output_dir,
        max_error_retries=inp.max_error_retries,
    )

    if not exec_result.success:
        activity.logger.warning(
            f"[geometry] Execution failed after inner loop: {exec_result.error_type}"
        )
        return GeometryOutput(
            success=False,
            cadquery_code=code,
            geometry_evidence_dict=None,
            step_artifact_uri=None,
            stl_artifact_uri=None,
            render_artifact_uri=None,
            repair_actions_dicts=[r.model_dump() for r in repair_actions],
            error=exec_result.error,
            error_type=exec_result.error_type,
        )

    # ── OCCT measurements + MeshLib stub ────────────────────────────────
    evidence = mesh_inspect(exec_result.geometry_json, stl_path=exec_result.stl_path)

    # ── Persist STEP / STL to artifact store ────────────────────────────
    step_uri = None
    stl_uri = None
    if exec_result.step_path and Path(exec_result.step_path).exists():
        step_uri = store.put_file(inp.workflow_id, "step", exec_result.step_path)
    if exec_result.stl_path and Path(exec_result.stl_path).exists():
        stl_uri = store.put_file(inp.workflow_id, "stl", exec_result.stl_path)

    # ── Three-view render ────────────────────────────────────────────────
    render_uri = None
    use_vision = os.getenv("USE_VISION", "true").lower() != "false"
    if use_vision and exec_result.stl_path:
        render_uri = render_views(
            stl_path=exec_result.stl_path,
            workflow_id=inp.workflow_id,
            name=inp.name,
            iteration=inp.iteration,
            store=store,
        )

    activity.logger.info(
        f"[geometry] Success. volume={evidence.volume_mm3:.1f}mm³ "
        f"faces={evidence.num_faces} step={step_uri} render={render_uri}"
    )

    return GeometryOutput(
        success=True,
        cadquery_code=code,
        geometry_evidence_dict=evidence.model_dump(),
        step_artifact_uri=step_uri,
        stl_artifact_uri=stl_uri,
        render_artifact_uri=render_uri,
        repair_actions_dicts=[r.model_dump() for r in repair_actions],
    )


# ---------------------------------------------------------------------------
# Activity: W·04 Verifier Worker
# ---------------------------------------------------------------------------


@activity.defn(name="verifier_activity")
async def verifier_activity(inp: VerifierInput) -> VerifierOutput:
    """
    Runs the independent Judge (Claude Opus) using geometry evidence and
    rendered views.

    PRD §4.7: Judge must use a model independent from generation agents.
    PRD §8.2 W·04: pass/bounded-repair/escalation decision.
    """
    store = get_store()
    activity.logger.info(
        f"[verifier] workflow={inp.workflow_id} render={inp.render_artifact_uri}"
    )

    score = visual_verify(
        prompt=inp.prompt,
        code=inp.cadquery_code,
        geometry_json=inp.geometry_evidence_dict,
        render_artifact_uri=inp.render_artifact_uri,
        prior_feedback=inp.prior_feedback or [],
        store=store,
        workflow_id=inp.workflow_id,
    )

    activity.logger.info(
        f"[verifier] passed={score.passed} feedback={score.feedback[:120]}"
    )

    return VerifierOutput(
        passed=score.passed,
        feedback=score.feedback,
        failure_category=(
            score.failure_category.value if score.failure_category else None
        ),
    )


# ---------------------------------------------------------------------------
# Activity: Refiner (outer geometric-refinement loop step)
# ---------------------------------------------------------------------------


@activity.defn(name="refiner_activity")
async def refiner_activity(inp: RefinerInput) -> RefinerOutput:
    """
    Runs the Refiner agent to improve code based on geometric feedback.

    PRD §4.5 outer loop: up to 5 iterations via Refiner agent.
    CADSmith: agents.refine_geometry()
    """
    activity.logger.info(
        f"[refiner] workflow={inp.workflow_id} iter={inp.iteration}"
    )
    plan = PrimitivePlan.model_validate(inp.plan_dict)
    design_plan_dict = plan.to_cadsmith_dict()

    refined = agents.refine_geometry(
        code=inp.cadquery_code,
        feedback=inp.feedback,
        design_plan=design_plan_dict,
        prompt=inp.prompt,
        iteration=inp.iteration,
        history=inp.history or None,
    )

    activity.logger.info(
        f"[refiner] Produced {len(refined.splitlines())} lines"
    )
    return RefinerOutput(refined_code=refined)


# ---------------------------------------------------------------------------
# Activity: W·05 ForgeCAD Handoff + Trace Capture
# ---------------------------------------------------------------------------


@activity.defn(name="handoff_activity")
async def handoff_activity(inp: HandoffInput) -> HandoffOutput:
    """
    Emits annotated ForgeCAD code and persists the full TraceArtifact.

    PRD §8.2 W·05: executes only after accepted geometry has passed the
    verifier or approval gate.
    PRD §11.2: 100% trace coverage — every execution produces a trace.
    """
    store = get_store()
    plan = PrimitivePlan.model_validate(inp.plan_dict)

    activity.logger.info(
        f"[handoff] workflow={inp.workflow_id} trace={inp.trace_id}"
    )

    # ── ForgeCAD emit ────────────────────────────────────────────────────
    forgecad_uri, _, metadata = forgecad_emit(
        plan=plan,
        code=inp.cadquery_code,
        workflow_id=inp.workflow_id,
        trace_id=inp.trace_id,
        iteration=inp.iteration,
        step_artifact_uri=inp.step_artifact_uri,
        stl_artifact_uri=inp.stl_artifact_uri,
        render_artifact_uri=inp.render_artifact_uri,
        store=store,
    )

    # ── Assemble and persist TraceArtifact ──────────────────────────────
    iteration_records = [
        IterationRecord.model_validate(d) for d in inp.iteration_records_dicts
    ]
    final_score = (
        VerifierScore.model_validate(inp.final_verifier_score_dict)
        if inp.final_verifier_score_dict
        else None
    )
    final_evidence = (
        GeometryEvidence.model_validate(
            iteration_records[-1].geometry_evidence.model_dump()
        )
        if iteration_records and iteration_records[-1].geometry_evidence
        else None
    )

    trace = TraceArtifact(
        trace_id=inp.trace_id,
        workflow_id=inp.workflow_id,
        design_name=plan.description,
        prompt=inp.prompt,
        primitive_plan_summary=plan.description,
        plan_ambiguous=plan.ambiguous,
        plan_ambiguity_questions=plan.ambiguity_questions,
        iterations=iteration_records,
        converged=(final_score.passed if final_score else False),
        total_iterations=len(iteration_records),
        total_llm_calls=inp.total_llm_calls,
        total_time_ms=inp.total_time_ms,
        final_step_artifact_uri=inp.step_artifact_uri,
        final_stl_artifact_uri=inp.stl_artifact_uri,
        final_render_artifact_uri=inp.render_artifact_uri,
        final_forgecad_artifact_uri=forgecad_uri,
        final_geometry_evidence=final_evidence,
        final_verifier_score=final_score,
        first_pass_success=(len(iteration_records) == 1 and (final_score.passed if final_score else False)),
        export_ready=True,
        human_approval_decision="approved",
    )

    trace_uri = trace_capture(trace, store=store)

    activity.logger.info(
        f"[handoff] forgecad={forgecad_uri} trace={trace_uri}"
    )

    return HandoffOutput(
        forgecad_artifact_uri=forgecad_uri,
        trace_artifact_uri=trace_uri,
        metadata=metadata,
    )
