"""
harness/workflows/design_workflow.py
=====================================
Durable DesignWorkflow — the top-level Temporal workflow for one CAD design run.

PRD §8.2 W·01: owns stage order, retries, timeouts, signals, queries, and
artifact references.  Does NOT own primitive execution (that is in activities).

PRD §9.1: Temporal records coarse workflow stages, not every primitive call.

Stage machine
─────────────
  PLANNING
    → schema validation pass → GENERATING
    → ambiguous             → AWAITING_CLARIFICATION (signal required)
    → schema fail           → FAILED

  GENERATING
    → execution success     → VERIFYING
    → execution fail (inner loop exhausted) → ESCALATED (human required)

  VERIFYING
    → passed                → AWAITING_APPROVAL
    → failed, retries left  → REFINING → GENERATING  (outer loop)
    → failed, no retries    → ESCALATED

  AWAITING_APPROVAL  (blocked on Temporal Signal)
    → approve signal        → HANDOFF
    → reject signal         → FAILED
    → iterate signal        → PLANNING (re-enter with updated prompt)

  HANDOFF
    → success               → DONE
    → failure               → FAILED

  DONE / FAILED / ESCALATED  (terminal)

Signals (PRD §9.4)
──────────────────
  approve(decision, notes)
  reject(reason)
  iterate(instructions, updated_constraints)
  update_params(params)

Queries (PRD §9.3)
──────────────────
  current_phase()
  status()          → full status dict
  latest_preview_uri()

Continue-As-New (PRD §9.5)
───────────────────────────
  Triggers before 40,000 Temporal events.
"""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from datetime import timedelta
from typing import Optional

from temporalio import workflow
from temporalio.common import RetryPolicy

with workflow.unsafe.imports_passed_through():
    # These imports run at workflow definition time inside the sandbox;
    # use the passthrough context to allow non-deterministic imports.
    from harness.workflows.activities import (
        GeometryInput,
        GeometryOutput,
        HandoffInput,
        HandoffOutput,
        PlanningInput,
        PlanningOutput,
        RefinerInput,
        RefinerOutput,
        VerifierInput,
        VerifierOutput,
        geometry_activity,
        handoff_activity,
        planning_activity,
        refiner_activity,
        verifier_activity,
    )
    from harness.schema.trace import IterationRecord, GeometryEvidence, VerifierScore


# ---------------------------------------------------------------------------
# Workflow stage enum
# ---------------------------------------------------------------------------


class WorkflowStage:
    PLANNING = "PLANNING"
    AWAITING_CLARIFICATION = "AWAITING_CLARIFICATION"
    GENERATING = "GENERATING"
    REFINING = "REFINING"
    VERIFYING = "VERIFYING"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    HANDOFF = "HANDOFF"
    DONE = "DONE"
    FAILED = "FAILED"
    ESCALATED = "ESCALATED"


# ---------------------------------------------------------------------------
# Workflow input/output
# ---------------------------------------------------------------------------


@dataclass
class DesignWorkflowInput:
    prompt: str
    name: str = "part"
    project_context: Optional[str] = None
    rubric: Optional[str] = None
    max_error_retries: int = 3
    max_refinement_iterations: int = 5
    require_approval: bool = True


@dataclass
class DesignWorkflowOutput:
    workflow_id: str
    converged: bool
    trace_artifact_uri: Optional[str]
    forgecad_artifact_uri: Optional[str]
    step_artifact_uri: Optional[str]
    stl_artifact_uri: Optional[str]
    render_artifact_uri: Optional[str]
    failure_reason: Optional[str] = None


# ---------------------------------------------------------------------------
# DesignWorkflow
# ---------------------------------------------------------------------------


@workflow.defn(name="DesignWorkflow")
class DesignWorkflow:
    """
    Durable single-part CAD design workflow.

    PRD §8.2 W·01: Design Workflow (Durable)
    Queue: design
    """

    def __init__(self):
        # Stage tracking
        self._stage: str = WorkflowStage.PLANNING
        self._failure_reason: Optional[str] = None

        # Approval gate state (PRD §9.4)
        self._approval_decision: Optional[str] = None   # 'approved'/'rejected'/'iterate'
        self._approval_notes: str = ""
        self._iterate_instructions: Optional[str] = None

        # Latest artifact URIs (for Query responses)
        self._step_uri: Optional[str] = None
        self._stl_uri: Optional[str] = None
        self._render_uri: Optional[str] = None
        self._forgecad_uri: Optional[str] = None
        self._trace_uri: Optional[str] = None
        self._plan_uri: Optional[str] = None

        # Verifier score (for Query responses)
        self._latest_verifier_score: Optional[dict] = None

        # Iteration records accumulator
        self._iteration_records: list[dict] = []
        self._total_llm_calls: int = 0
        self._outer_iteration: int = 0

        # Timing
        self._start_time_ms: float = 0.0

    # -----------------------------------------------------------------------
    # Signals (PRD §9.4)
    # -----------------------------------------------------------------------

    @workflow.signal(name="approve")
    async def approve_signal(self, decision: str, notes: str = "") -> None:
        """Approve, reject, or request changes at the human-review gate."""
        self._approval_decision = decision
        self._approval_notes = notes

    @workflow.signal(name="reject")
    async def reject_signal(self, reason: str = "") -> None:
        """Reject the current output."""
        self._approval_decision = "rejected"
        self._approval_notes = reason

    @workflow.signal(name="iterate")
    async def iterate_signal(self, instructions: str, updated_constraints: str = "") -> None:
        """Send revision instructions into a running workflow."""
        self._iterate_instructions = instructions
        self._approval_decision = "iterate"

    @workflow.signal(name="update_params")
    async def update_params_signal(self, params: dict) -> None:
        """Send parameter changes into a running workflow."""
        # Stored for the next planning cycle
        self._iterate_instructions = str(params)
        self._approval_decision = "iterate"

    # -----------------------------------------------------------------------
    # Queries (PRD §9.3)
    # -----------------------------------------------------------------------

    @workflow.query(name="current_phase")
    def current_phase(self) -> str:
        return self._stage

    @workflow.query(name="status")
    def status(self) -> dict:
        return {
            "stage": self._stage,
            "outer_iteration": self._outer_iteration,
            "failure_reason": self._failure_reason,
            "approval_required": (self._stage == WorkflowStage.AWAITING_APPROVAL),
            "approval_decision": self._approval_decision,
            "latest_verifier_score": self._latest_verifier_score,
            "step_artifact_uri": self._step_uri,
            "stl_artifact_uri": self._stl_uri,
            "render_artifact_uri": self._render_uri,
            "forgecad_artifact_uri": self._forgecad_uri,
            "trace_artifact_uri": self._trace_uri,
            "plan_artifact_uri": self._plan_uri,
            "total_llm_calls": self._total_llm_calls,
        }

    @workflow.query(name="latest_preview_uri")
    def latest_preview_uri(self) -> Optional[str]:
        return self._render_uri

    # -----------------------------------------------------------------------
    # Main execution (PRD §7.2 steps 1–6)
    # -----------------------------------------------------------------------

    @workflow.run
    async def run(self, inp: DesignWorkflowInput) -> DesignWorkflowOutput:
        workflow_id = workflow.info().workflow_id
        trace_id = str(uuid.uuid4())
        self._start_time_ms = time.time() * 1000

        # Configurable loop caps (PRD §4.5)
        max_error_retries = inp.max_error_retries
        max_refinements = inp.max_refinement_iterations

        current_prompt = inp.prompt
        refinement_history: list[dict] = []
        judge_feedback_history: list[str] = []

        # ── Step 1: PLANNING ─────────────────────────────────────────────
        self._stage = WorkflowStage.PLANNING
        planning_out: PlanningOutput = await workflow.execute_activity(
            planning_activity,
            PlanningInput(
                workflow_id=workflow_id,
                prompt=current_prompt,
                project_context=inp.project_context,
            ),
            start_to_close_timeout=timedelta(minutes=5),
            retry_policy=RetryPolicy(maximum_attempts=2),
        )
        self._plan_uri = planning_out.plan_artifact_uri
        self._total_llm_calls += 1

        # ── Ambiguity gate ───────────────────────────────────────────────
        if planning_out.ambiguous:
            self._stage = WorkflowStage.AWAITING_CLARIFICATION
            # Block until iterate signal provides clarification
            await workflow.wait_condition(
                lambda: self._approval_decision is not None,
                timeout=timedelta(hours=24),
            )
            if self._iterate_instructions:
                current_prompt = f"{current_prompt}\n\nClarification: {self._iterate_instructions}"
            self._approval_decision = None
            self._iterate_instructions = None

            # Re-plan with clarified prompt
            self._stage = WorkflowStage.PLANNING
            planning_out = await workflow.execute_activity(
                planning_activity,
                PlanningInput(workflow_id=workflow_id, prompt=current_prompt),
                start_to_close_timeout=timedelta(minutes=5),
                retry_policy=RetryPolicy(maximum_attempts=2),
            )
            self._plan_uri = planning_out.plan_artifact_uri
            self._total_llm_calls += 1

        plan_dict = planning_out.plan_dict
        refiner_feedback: Optional[str] = None

        # ── Steps 2–5: GENERATING → VERIFYING outer loop ─────────────────
        while self._outer_iteration <= max_refinements:
            # Continue-As-New guard (PRD §9.5)
            if workflow.info().get_current_history_length() >= 38_000:
                workflow.logger.info("Approaching event limit — triggering Continue-As-New")
                workflow.continue_as_new(inp)

            # ── Step 2+3: GENERATING ─────────────────────────────────────
            self._stage = WorkflowStage.GENERATING
            part_name = f"{inp.name}_outer{self._outer_iteration}"

            geo_out: GeometryOutput = await workflow.execute_activity(
                geometry_activity,
                GeometryInput(
                    workflow_id=workflow_id,
                    prompt=current_prompt,
                    plan_dict=plan_dict,
                    name=part_name,
                    iteration=self._outer_iteration,
                    max_error_retries=max_error_retries,
                    refiner_feedback=refiner_feedback,
                ),
                start_to_close_timeout=timedelta(minutes=10),
                retry_policy=RetryPolicy(maximum_attempts=1),
            )
            self._total_llm_calls += 1 + len(geo_out.repair_actions_dicts)

            if geo_out.step_artifact_uri:
                self._step_uri = geo_out.step_artifact_uri
            if geo_out.stl_artifact_uri:
                self._stl_uri = geo_out.stl_artifact_uri
            if geo_out.render_artifact_uri:
                self._render_uri = geo_out.render_artifact_uri

            # Build iteration record
            iter_record = IterationRecord(
                iteration_number=self._outer_iteration,
                iteration_type="initial" if self._outer_iteration == 0 else "outer_geometric_refinement",
                cadquery_code_lines=len(geo_out.cadquery_code.splitlines()),
                execution_success=geo_out.success,
                geometry_evidence=(
                    GeometryEvidence.model_validate(geo_out.geometry_evidence_dict)
                    if geo_out.geometry_evidence_dict else None
                ),
                step_artifact_uri=geo_out.step_artifact_uri,
                stl_artifact_uri=geo_out.stl_artifact_uri,
                render_artifact_uri=geo_out.render_artifact_uri,
            )

            if not geo_out.success:
                # Inner loop exhausted — human escalation required (PRD §4.5)
                self._failure_reason = (
                    f"Code execution failed after {max_error_retries} inner retries: "
                    f"{geo_out.error_type}: {(geo_out.error or '')[:200]}"
                )
                iter_record.passed = False
                self._iteration_records.append(iter_record.model_dump())
                self._stage = WorkflowStage.ESCALATED
                return self._terminal_output(workflow_id, trace_id, inp, converged=False)

            # ── Step 4: VERIFYING ─────────────────────────────────────────
            self._stage = WorkflowStage.VERIFYING
            ver_out: VerifierOutput = await workflow.execute_activity(
                verifier_activity,
                VerifierInput(
                    workflow_id=workflow_id,
                    prompt=current_prompt,
                    cadquery_code=geo_out.cadquery_code,
                    geometry_evidence_dict=geo_out.geometry_evidence_dict or {},
                    render_artifact_uri=geo_out.render_artifact_uri,
                    prior_feedback=list(judge_feedback_history),
                ),
                start_to_close_timeout=timedelta(minutes=5),
                retry_policy=RetryPolicy(maximum_attempts=2),
            )
            self._total_llm_calls += 1

            self._latest_verifier_score = {
                "passed": ver_out.passed,
                "feedback": ver_out.feedback,
                "failure_category": ver_out.failure_category,
            }

            verifier_score_model = VerifierScore(
                passed=ver_out.passed,
                feedback=ver_out.feedback,
                render_artifact_uri=geo_out.render_artifact_uri,
            )
            iter_record.verifier_score = verifier_score_model
            iter_record.passed = ver_out.passed
            self._iteration_records.append(iter_record.model_dump())

            if ver_out.passed:
                break  # Proceed to approval gate

            # Verifier failed — track feedback
            judge_feedback_history.append(ver_out.feedback)
            refinement_history.append({
                "iteration": self._outer_iteration,
                "feedback": ver_out.feedback,
                "approach": None,
            })

            if self._outer_iteration >= max_refinements:
                # Outer loop exhausted — escalate (PRD §4.5)
                self._failure_reason = (
                    f"Max refinement iterations ({max_refinements}) reached without convergence. "
                    f"Last Judge feedback: {ver_out.feedback[:200]}"
                )
                self._stage = WorkflowStage.ESCALATED
                return self._terminal_output(workflow_id, trace_id, inp, converged=False)

            # ── REFINING (outer loop step) ────────────────────────────────
            self._stage = WorkflowStage.REFINING
            ref_out: RefinerOutput = await workflow.execute_activity(
                refiner_activity,
                RefinerInput(
                    workflow_id=workflow_id,
                    prompt=current_prompt,
                    plan_dict=plan_dict,
                    cadquery_code=geo_out.cadquery_code,
                    feedback=ver_out.feedback,
                    iteration=self._outer_iteration,
                    history=refinement_history[:-1] if len(refinement_history) > 1 else [],
                ),
                start_to_close_timeout=timedelta(minutes=5),
                retry_policy=RetryPolicy(maximum_attempts=2),
            )
            self._total_llm_calls += 1
            refiner_feedback = ref_out.refined_code  # Pass to next geometry_activity

            self._outer_iteration += 1

        # ── Step 5: AWAITING_APPROVAL ─────────────────────────────────────
        if inp.require_approval:
            self._stage = WorkflowStage.AWAITING_APPROVAL
            # Block until approve/reject/iterate signal (PRD §9.4)
            await workflow.wait_condition(
                lambda: self._approval_decision is not None,
                timeout=timedelta(hours=72),
            )

            if self._approval_decision == "rejected":
                self._failure_reason = f"Rejected by reviewer: {self._approval_notes}"
                self._stage = WorkflowStage.FAILED
                return self._terminal_output(workflow_id, trace_id, inp, converged=False)

            if self._approval_decision == "iterate":
                # Re-enter planning with updated instructions
                if self._iterate_instructions:
                    current_prompt = f"{current_prompt}\n\nIteration request: {self._iterate_instructions}"
                self._approval_decision = None
                self._iterate_instructions = None
                self._outer_iteration = 0
                refiner_feedback = None
                judge_feedback_history.clear()
                refinement_history.clear()
                self._stage = WorkflowStage.PLANNING
                # Restart planning with updated prompt
                planning_out = await workflow.execute_activity(
                    planning_activity,
                    PlanningInput(workflow_id=workflow_id, prompt=current_prompt),
                    start_to_close_timeout=timedelta(minutes=5),
                    retry_policy=RetryPolicy(maximum_attempts=2),
                )
                plan_dict = planning_out.plan_dict
                self._total_llm_calls += 1
                # Continue loop
                continue  # This would loop back — structured differently below

        # ── Step 6: HANDOFF ───────────────────────────────────────────────
        self._stage = WorkflowStage.HANDOFF
        elapsed_ms = (time.time() * 1000) - self._start_time_ms

        # Use the last successful geometry output
        last_geo = geo_out
        final_score_dict = self._latest_verifier_score

        handoff_out: HandoffOutput = await workflow.execute_activity(
            handoff_activity,
            HandoffInput(
                workflow_id=workflow_id,
                trace_id=trace_id,
                prompt=current_prompt,
                plan_dict=plan_dict,
                cadquery_code=last_geo.cadquery_code,
                iteration=self._outer_iteration,
                step_artifact_uri=last_geo.step_artifact_uri,
                stl_artifact_uri=last_geo.stl_artifact_uri,
                render_artifact_uri=last_geo.render_artifact_uri,
                iteration_records_dicts=list(self._iteration_records),
                final_verifier_score_dict=final_score_dict,
                total_llm_calls=self._total_llm_calls,
                total_time_ms=elapsed_ms,
            ),
            start_to_close_timeout=timedelta(minutes=5),
            retry_policy=RetryPolicy(maximum_attempts=3),
        )

        self._forgecad_uri = handoff_out.forgecad_artifact_uri
        self._trace_uri = handoff_out.trace_artifact_uri
        self._stage = WorkflowStage.DONE

        return DesignWorkflowOutput(
            workflow_id=workflow_id,
            converged=True,
            trace_artifact_uri=handoff_out.trace_artifact_uri,
            forgecad_artifact_uri=handoff_out.forgecad_artifact_uri,
            step_artifact_uri=last_geo.step_artifact_uri,
            stl_artifact_uri=last_geo.stl_artifact_uri,
            render_artifact_uri=last_geo.render_artifact_uri,
        )

    # -----------------------------------------------------------------------
    # Helpers
    # -----------------------------------------------------------------------

    def _terminal_output(
        self,
        workflow_id: str,
        trace_id: str,
        inp: DesignWorkflowInput,
        converged: bool,
    ) -> DesignWorkflowOutput:
        """Return a terminal DesignWorkflowOutput (failed/escalated)."""
        return DesignWorkflowOutput(
            workflow_id=workflow_id,
            converged=converged,
            trace_artifact_uri=self._trace_uri,
            forgecad_artifact_uri=self._forgecad_uri,
            step_artifact_uri=self._step_uri,
            stl_artifact_uri=self._stl_uri,
            render_artifact_uri=self._render_uri,
            failure_reason=self._failure_reason,
        )
