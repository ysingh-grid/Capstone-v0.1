"""
harness/runtime/primitives.py
==============================
Geometry Agent Runtime primitive functions.

PRD §6.1: The runtime is the execution boundary between model reasoning
and CAD tooling.  These functions are called from Temporal activities.
They wrap CADSmith's pipeline components and add the typed-schema gate,
artifact persistence, and structured trace building.

CADSmith baseline mapping
─────────────────────────
  primitive_plan()          ← agents.plan() + schema validation
  solid_generate()          ← agents.generate_code() + Executor.execute()
  execute_with_retries()    ← pipeline._execute_with_retries()
  mesh_inspect()            ← executor.py OCCT measurements (MeshLib stub)
  mesh_repair()             ← trimesh hole-fill + watertight repair (PRD §6.4)
  measure_geometry()        ← executor.py geometry_json
  render_views()            ← render.render_stl_to_png()
  visual_verify()           ← validator.Validator.validate() → agents.evaluate_geometry()
  forgecad_emit()           ← forgecad_adapter.emit_forgecad_code()
  trace_capture()           ← serialize TraceArtifact → artifact store
  approval_gate_check()     ← structured approval record (PRD §6.2)
  compute_mesh_metrics()    ← metrics.compare_stl() CD/F1/IoU (PRD §11.3)
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=False)

# ---------------------------------------------------------------------------
# CADSmith import — add its parent to sys.path so autofab is importable
# ---------------------------------------------------------------------------

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_CADSMITH_DIR = _PROJECT_ROOT / "CADSmith"

if str(_CADSMITH_DIR) not in sys.path:
    sys.path.insert(0, str(_CADSMITH_DIR))

from autofab import agents  # noqa: E402
from autofab.executor import Executor, ExecutionResult  # noqa: E402
from autofab.validator import Validator  # noqa: E402

from harness.artifacts.store import ArtifactStore, get_store
from harness.runtime.forgecad_adapter import emit_forgecad_code
from harness.schema.primitives import (
    PrimitivePlan,
    SchemaValidationError,
    validate_plan,
)
from harness.schema.trace import (
    FailureCategory,
    GeometryEvidence,
    IterationRecord,
    RepairAction,
    TraceArtifact,
    VerifierScore,
)


# ---------------------------------------------------------------------------
# 1. primitive_plan — Planning primitive (PRD §6.2)
# ---------------------------------------------------------------------------


def primitive_plan(
    prompt: str,
    project_context: Optional[str] = None,
) -> PrimitivePlan:
    """
    Run the Planner agent and validate its output against the typed schema.

    PRD §6.3: Schema failures raise SchemaValidationError; never degrade silently.
    CADSmith: agents.plan() → raw dict → validate_plan() → PrimitivePlan
    """
    raw_plan = agents.plan(prompt)
    try:
        plan = validate_plan(raw_plan)
    except SchemaValidationError:
        raise
    return plan


# ---------------------------------------------------------------------------
# 2. solid_generate — CadQuery code generation (PRD §6.2)
# ---------------------------------------------------------------------------


def solid_generate(
    plan: PrimitivePlan,
    prompt: str,
) -> str:
    """
    Compile a typed primitive plan into a CadQuery Python script.

    CADSmith: agents.generate_code(design_plan, prompt) → code string
    The plan is converted to the CADSmith flat-dict format for compatibility.
    """
    design_plan_dict = plan.to_cadsmith_dict()
    code = agents.generate_code(design_plan_dict, prompt)
    return code


# ---------------------------------------------------------------------------
# 3. execute_with_retries — inner error-fix loop (PRD §4.5, §7.2 Step 3)
# ---------------------------------------------------------------------------


def execute_with_retries(
    code: str,
    plan: PrimitivePlan,
    name: str,
    output_dir: str,
    max_error_retries: int = 3,
) -> tuple[ExecutionResult, list[RepairAction]]:
    """
    Execute CadQuery code with up to ``max_error_retries`` Error Refiner attempts.

    Returns:
        (ExecutionResult, list[RepairAction])

    PRD §4.5 inner loop: up to 3 error-fix retries using rag_kb2 patterns.
    CADSmith: pipeline._execute_with_retries()
    """
    executor = Executor(output_dir=output_dir, timeout_seconds=int(
        os.getenv("EXECUTOR_TIMEOUT_SECONDS", "60")
    ))
    design_plan_dict = plan.to_cadsmith_dict()

    repair_actions: list[RepairAction] = []
    current_code = code
    attempt = 0

    while attempt <= max_error_retries:
        exec_result = executor.execute(current_code, name=f"{name}_attempt{attempt}")

        if exec_result.success:
            # Mark last repair action as successful if it was the fix
            if repair_actions:
                repair_actions[-1] = RepairAction(
                    **{**repair_actions[-1].model_dump(), "success": True}
                )
            return exec_result, repair_actions

        if attempt < max_error_retries:
            fixed_code = agents.fix_error(current_code, exec_result.error, design_plan_dict)
            repair_actions.append(RepairAction(
                loop="inner",
                attempt_number=attempt + 1,
                error_or_feedback=exec_result.error or "",
                error_type=exec_result.error_type,
                fix_applied=f"Error Refiner attempt {attempt + 1} produced {len(fixed_code.splitlines())} lines",
                success=False,
            ))
            current_code = fixed_code

        attempt += 1

    return exec_result, repair_actions


# ---------------------------------------------------------------------------
# 4. mesh_inspect — OCCT + MeshLib stub (PRD §6.2)
# ---------------------------------------------------------------------------


def mesh_inspect(
    geometry_json: dict,
    stl_path: Optional[str] = None,
) -> GeometryEvidence:
    """
    Build structured geometry evidence from OCCT kernel measurements.

    Phase 1: wraps OCCT data already extracted by executor.py.
    Phase 2: MeshLib extended fields (watertightness, self-intersections,
    proximity clearances) will be added here without changing the interface.

    PRD §4.3: deterministic geometry evidence as structured data, not images.
    """
    evidence = GeometryEvidence.from_cadsmith_geometry_json(geometry_json)

    # Phase 1 MeshLib stub: attempt basic watertightness via trimesh
    if stl_path and Path(stl_path).exists():
        try:
            import trimesh  # optional dependency
            mesh = trimesh.load_mesh(stl_path)
            evidence.is_watertight = bool(mesh.is_watertight)
            evidence.has_self_intersections = not bool(mesh.is_volume)
        except Exception:
            pass  # MeshLib/trimesh not available; leave fields None

    return evidence


# ---------------------------------------------------------------------------
# 5. mesh_repair — watertight repair primitive (PRD §6.2, §6.4)
# ---------------------------------------------------------------------------


def mesh_repair(
    stl_path: str,
    output_path: Optional[str] = None,
    *,
    workflow_id: Optional[str] = None,
    store: Optional[ArtifactStore] = None,
) -> tuple[str, bool, str]:
    """
    Attempt to repair a non-watertight mesh using trimesh hole-filling.

    PRD §6.4: Mesh repair must be a named primitive, not inline logic.

    Args:
        stl_path:    Path to the input STL (may be non-watertight).
        output_path: Where to write the repaired STL. Defaults to
                     <stl_path>_repaired.stl.
        workflow_id: If provided, the repaired STL is persisted to the store.
        store:       ArtifactStore instance. Defaults to get_store().

    Returns:
        (repaired_stl_path, is_watertight_after_repair, repair_notes)
    """
    if store is None:
        store = get_store()

    if output_path is None:
        p = Path(stl_path)
        output_path = str(p.parent / f"{p.stem}_repaired{p.suffix}")

    repair_notes = "trimesh unavailable; no repair attempted"
    is_watertight = False

    try:
        import trimesh

        mesh = trimesh.load_mesh(stl_path)
        repair_notes_parts = []

        if not mesh.is_watertight:
            # Fill holes
            trimesh.repair.fill_holes(mesh)
            repair_notes_parts.append("fill_holes applied")

            # Fix winding
            trimesh.repair.fix_winding(mesh)
            repair_notes_parts.append("fix_winding applied")

            # Fix normals
            trimesh.repair.fix_normals(mesh)
            repair_notes_parts.append("fix_normals applied")

        is_watertight = bool(mesh.is_watertight)
        repair_notes = "; ".join(repair_notes_parts) if repair_notes_parts else "mesh already watertight"

        mesh.export(output_path)

        # Persist to artifact store if workflow_id provided
        if workflow_id and Path(output_path).exists():
            store.put_file(workflow_id, "stl", output_path,
                           filename=Path(output_path).name)

    except ImportError:
        # Trimesh not available — return original
        output_path = stl_path
        repair_notes = "trimesh not installed; mesh returned unmodified"
    except Exception as exc:
        output_path = stl_path
        repair_notes = f"Repair failed: {exc}"

    return output_path, is_watertight, repair_notes


# ---------------------------------------------------------------------------
# 6. measure_geometry — convenience wrapper (PRD §6.2)
# ---------------------------------------------------------------------------


def measure_geometry(geometry_json: dict) -> GeometryEvidence:
    """
    Wrap the raw OCCT dict into a typed GeometryEvidence model.
    """
    return GeometryEvidence.from_cadsmith_geometry_json(geometry_json)


# ---------------------------------------------------------------------------
# 7. render_views — three-view VTK render (PRD §4.4, §6.2)
# ---------------------------------------------------------------------------


def render_views(
    stl_path: str,
    workflow_id: str,
    name: str,
    iteration: int,
    store: Optional[ArtifactStore] = None,
) -> Optional[str]:
    """
    Render a three-view image and persist it to the artifact store.

    Returns the artifact URI or None if rendering is not available.

    CADSmith: render.render_stl_to_png() → three views side by side.
    PRD §4.4: minimum required views for the Verifier.
    """
    if store is None:
        store = get_store()

    try:
        from autofab.render import render_stl_to_png

        render_filename = f"{name}_iter{iteration}_render.png"
        local_render_path = str(
            store.base_path / workflow_id / "render" / render_filename
        )
        Path(local_render_path).parent.mkdir(parents=True, exist_ok=True)
        render_stl_to_png(stl_path, local_render_path)

        uri = store.put_file(workflow_id, "render", local_render_path, filename=render_filename)
        return uri

    except Exception as exc:
        print(f"[render_views] WARNING: rendering failed: {exc}")
        return None


# ---------------------------------------------------------------------------
# 8. visual_verify — LLM Judge verification (PRD §4.7, §6.2)  — BUG-3 FIX
# ---------------------------------------------------------------------------


def visual_verify(
    prompt: str,
    code: str,
    geometry_json: dict,
    render_artifact_uri: Optional[str] = None,
    stl_artifact_uri: Optional[str] = None,
    prior_feedback: Optional[list[str]] = None,
    store: Optional[ArtifactStore] = None,
    workflow_id: Optional[str] = None,
) -> VerifierScore:
    """
    Run the independent Judge (Claude Opus) against prompt, code, OCCT
    measurements, and rendered views.

    BUG-3 FIX: previously passed stl_path="" so the Judge never received
    the rendered image. Now resolves the actual STL path from the artifact
    store URI and passes it to agents.evaluate_geometry(), which renders
    fresh three-view PNG and sends it to Claude Opus as base64 image.

    PRD §4.7: Judge model must be independent from generation agents.
    CADSmith: agents.evaluate_geometry() → dict with 'passed' + 'feedback'.
    """
    if store is None:
        store = get_store()

    # BUG-3 FIX: Resolve the STL path so the Judge can render and see the geometry
    stl_path = ""
    if stl_artifact_uri and store.exists(stl_artifact_uri):
        stl_path = str(store.local_path(stl_artifact_uri))

    # Determine render_save_path: persist the render if we have a workflow_id
    render_save_path = ""
    if workflow_id and stl_path:
        render_dir = store.base_path / workflow_id / "render"
        render_dir.mkdir(parents=True, exist_ok=True)
        render_save_path = str(render_dir / f"judge_render_{workflow_id}.png")
        # If the render already exists in the store, reuse its local path
        if render_artifact_uri and store.exists(render_artifact_uri):
            render_save_path = str(store.local_path(render_artifact_uri))

    result = agents.evaluate_geometry(
        prompt=prompt,
        code=code,
        geometry_metrics=geometry_json,
        stl_path=stl_path,           # BUG-3 FIX: real STL path → renders PNG for Judge
        render_save_path=render_save_path,
        prior_judge_feedback=prior_feedback or [],
    )

    return VerifierScore(
        passed=result.get("passed", False),
        feedback=result.get("feedback", ""),
        render_artifact_uri=render_artifact_uri,
    )


# ---------------------------------------------------------------------------
# 9. forgecad_emit — ForgeCAD handoff primitive (PRD §6.2)
# ---------------------------------------------------------------------------


def forgecad_emit(
    plan: PrimitivePlan,
    code: str,
    workflow_id: str,
    trace_id: str,
    iteration: int = 0,
    step_artifact_uri: Optional[str] = None,
    stl_artifact_uri: Optional[str] = None,
    render_artifact_uri: Optional[str] = None,
    store: Optional[ArtifactStore] = None,
) -> tuple[str, str, dict]:
    """
    Generate and persist the ForgeCAD (annotated CadQuery) model code.

    Returns:
        (forgecad_artifact_uri, annotated_source, metadata)

    PRD §6.2: Emit editable ForgeCAD model code and attach previews,
    exports, and review notes.
    """
    if store is None:
        store = get_store()

    annotated_source, metadata = emit_forgecad_code(
        plan=plan,
        cadquery_code=code,
        trace_id=trace_id,
        workflow_id=workflow_id,
        step_artifact_uri=step_artifact_uri,
        stl_artifact_uri=stl_artifact_uri,
        render_artifact_uri=render_artifact_uri,
        iteration=iteration,
    )

    filename = f"{plan.description.replace(' ', '_')[:40]}_iter{iteration}_forgecad.py"
    uri = store.put(workflow_id, "forgecad", annotated_source.encode(), filename=filename)

    return uri, annotated_source, metadata


# ---------------------------------------------------------------------------
# 10. trace_capture — persist TraceArtifact (PRD §6.2, §9.2)
# ---------------------------------------------------------------------------


def trace_capture(
    trace: TraceArtifact,
    store: Optional[ArtifactStore] = None,
) -> str:
    """
    Serialize a TraceArtifact and persist it to the artifact store.

    Returns the artifact URI.  PRD §11.2: 100% trace coverage required.
    Every execution — success or failure — must call this function.
    """
    if store is None:
        store = get_store()

    filename = f"trace_{trace.trace_id}.json"
    uri = store.put(
        trace.workflow_id,
        "trace",
        trace.to_json().encode(),
        filename=filename,
    )
    return uri


# ---------------------------------------------------------------------------
# 11. approval_gate_check — structured approval record (PRD §6.2)
# ---------------------------------------------------------------------------


def approval_gate_check(
    workflow_id: str,
    trace_id: str,
    decision: str,
    reviewer: Optional[str] = None,
    notes: str = "",
    store: Optional[ArtifactStore] = None,
) -> dict:
    """
    Record a human approval gate decision as a structured artifact.

    PRD §6.2: The approval gate is a named primitive, not inline logic.
    PRD §5.3: Human decisions must be logged with timestamp and reviewer.

    Args:
        workflow_id: The design workflow ID.
        trace_id:    The trace artifact ID for this run.
        decision:    'approved', 'rejected', or 'changes_requested'.
        reviewer:    Optional reviewer identifier.
        notes:       Optional reviewer comments.
        store:       ArtifactStore instance.

    Returns:
        Approval record dict (also persisted to the store as JSON).
    """
    import datetime

    if store is None:
        store = get_store()

    if decision not in ("approved", "rejected", "changes_requested"):
        raise ValueError(
            f"Invalid decision {decision!r}. "
            "Must be 'approved', 'rejected', or 'changes_requested'."
        )

    record = {
        "workflow_id": workflow_id,
        "trace_id": trace_id,
        "decision": decision,
        "reviewer": reviewer,
        "notes": notes,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

    store.put_json(
        workflow_id,
        "misc",
        record,
        filename=f"approval_{trace_id}.json",
    )

    return record


# ---------------------------------------------------------------------------
# 12. compute_mesh_metrics — CD/F1/IoU against reference STL (PRD §11.3)
# ---------------------------------------------------------------------------


def compute_mesh_metrics(
    generated_stl_path: str,
    reference_stl_path: str,
    normalize: bool = False,
    use_icp: bool = True,
    n_points: int = 10_000,
) -> Optional[dict]:
    """
    Compute Chamfer Distance, F1 Score, and Volumetric IoU against a
    reference STL, matching the Text-to-CadQuery paper metrics (PRD §11.3).

    CADSmith: metrics.compare_stl() — uses the same implementation.

    Args:
        generated_stl_path:  Path to the generated STL.
        reference_stl_path:  Path to the ground-truth reference STL.
        normalize:           If True, normalize meshes to [0,1]³ (shape only).
                             If False (default), compare in absolute mm.
        use_icp:             Run ICP alignment before metric computation.
        n_points:            Surface point samples per mesh.

    Returns:
        dict with keys: chamfer_distance, f1_score, volumetric_iou,
        precision, recall, normalize, use_icp.
        Returns None if trimesh is unavailable or both STL files do not exist.
    """
    if not Path(generated_stl_path).exists():
        return None
    if not Path(reference_stl_path).exists():
        return None

    try:
        from autofab.metrics import compare_stl  # type: ignore

        metrics = compare_stl(
            generated_stl=generated_stl_path,
            reference_stl=reference_stl_path,
            n_points=n_points,
            normalize=normalize,
            use_icp=use_icp,
        )
        result = metrics.to_dict()
        result["normalize"] = normalize
        result["use_icp"] = use_icp
        return result

    except ImportError:
        print("[compute_mesh_metrics] trimesh/scipy not available; skipping metrics")
        return None
    except Exception as exc:
        print(f"[compute_mesh_metrics] Metrics computation failed: {exc}")
        return None
