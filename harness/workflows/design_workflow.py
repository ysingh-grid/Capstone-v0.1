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

from dataclasses import dataclass, field
from datetime import timedelta
from typing import Optional

from temporalio import workflow
from temporalio.common import RetryPolicy
from temporalio.exceptions import ActivityError, TimeoutError as TemporalTimeoutError

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
# Internal sentinels
# ---------------------------------------------------------------------------


class _DeadlineFailure(Exception):
    """
    Internal sentinel raised by ``_execute_activity_safe`` when an activity
    fails in a way that should collapse into a clean global-deadline
    terminal FAILED.  The top-level ``run`` catches it and returns
    ``_fail_deadline(...)`` so the workflow never escapes as a raw
    Temporal ``WorkflowExecutionFailed`` event.
    """

    def __init__(self, debug: str):
        super().__init__(debug)
        self.debug = debug


def _is_activity_timeout(exc: BaseException) -> bool:
    """
    True iff this exception (or any wrapped cause) represents a Temporal
    activity StartToClose / ScheduleToClose / Heartbeat / ScheduleToStart
    timeout.  Handles ActivityError-wrapped TimeoutError as well as a
    bare TimeoutError.
    """
    seen: set[int] = set()
    cur: Optional[BaseException] = exc
    while cur is not None and id(cur) not in seen:
        seen.add(id(cur))
        if isinstance(cur, TemporalTimeoutError):
            return True
        cur = getattr(cur, "cause", None) or cur.__cause__


    return False


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
    # Global hard cap on total wall-clock runtime for the entire workflow
    # (planning + generation + verifier + refinement + handoff).  When the
    # deadline is exceeded the workflow returns a terminal FAILED with a
    # user-facing message.
    max_total_runtime_seconds: int = 600


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
    user_message: Optional[str] = None
    debug_failure_reason: Optional[str] = None
    deadline_exceeded: bool = False


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

        # Terminal-failure surface for the UI / API.
        # _user_message is the clean string shown to the end user; the
        # _debug_failure_reason carries diagnostic detail for operators.
        self._user_message: Optional[str] = None
        self._debug_failure_reason: Optional[str] = None
        self._deadline_exceeded: bool = False

        # Approval gate state (PRD §9.4)
        self._approval_decision: Optional[str] = None   # 'approved'/'rejected'/'iterate'
        self._approval_notes: str = ""
        self._iterate_instructions: Optional[str] = None

        # Latest artifact URIs (for Query responses)
        self._step_uri: Optional[str] = None
        self._stl_uri: Optional[str] = None
        self._render_uri: Optional[str] = None
        self._forgecad_uri: Optional[str] = None
        self._forgecad_project_dir: Optional[str] = None
        self._studio_launch_command: Optional[str] = None
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
            "user_message": self._user_message,
            "debug_failure_reason": self._debug_failure_reason,
            "deadline_exceeded": self._deadline_exceeded,
            "approval_required": (self._stage == WorkflowStage.AWAITING_APPROVAL),
            "approval_decision": self._approval_decision,
            "latest_verifier_score": self._latest_verifier_score,
            "step_artifact_uri": self._step_uri,
            "stl_artifact_uri": self._stl_uri,
            "render_artifact_uri": self._render_uri,
            "forgecad_artifact_uri": self._forgecad_uri,
            "forgecad_project_dir": self._forgecad_project_dir,
            "studio_launch_command": self._studio_launch_command,
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
        trace_id = str(workflow.uuid4())          # deterministic — seeded by Temporal
        self._start_time_ms = workflow.now().timestamp() * 1000

        try:
            return await self._run_pipeline(workflow_id, trace_id, inp)
        except _DeadlineFailure as exc:
            # Activity timeout (or post-deadline activity failure) converted
            # into a clean terminal FAILED rather than a raw Temporal
            # "Workflow Execution Failed: Activity task timed out".
            return self._fail_deadline(
                workflow_id, trace_id, inp, debug_override=exc.debug
            )

    async def _run_pipeline(
        self,
        workflow_id: str,
        trace_id: str,
        inp: DesignWorkflowInput,
    ) -> DesignWorkflowOutput:
        # Configurable loop caps (PRD §4.5)
        max_error_retries = inp.max_error_retries
        max_refinements = inp.max_refinement_iterations

        current_prompt = inp.prompt
        plan_dict: dict = {}

        # BUG-2 FIX: outer restart loop handles iterate-signal re-entry.
        # Each pass through this loop is one full attempt (plan → generate → verify → approve).
        while True:
            refinement_history: list[dict] = []
            judge_feedback_history: list[str] = []
            refiner_feedback: Optional[str] = None

            # ── Step 1: PLANNING ─────────────────────────────────────────
            self._stage = WorkflowStage.PLANNING
            if self._deadline_exceeded_now(inp):
                return self._fail_deadline(workflow_id, trace_id, inp)
            planning_out: PlanningOutput = await self._execute_activity_safe(
                inp,
                planning_activity,
                PlanningInput(
                    workflow_id=workflow_id,
                    prompt=current_prompt,
                    project_context=inp.project_context,
                ),
                default_timeout=timedelta(minutes=5),
                retry_policy=RetryPolicy(maximum_attempts=2),
            )
            self._plan_uri = planning_out.plan_artifact_uri
            self._total_llm_calls += 1

            # ── Ambiguity gate ───────────────────────────────────────────
            if planning_out.ambiguous:
                self._stage = WorkflowStage.AWAITING_CLARIFICATION
                await workflow.wait_condition(
                    lambda: self._approval_decision is not None,
                    timeout=timedelta(hours=24),
                )
                if self._iterate_instructions:
                    current_prompt = (
                        f"{current_prompt}\n\nClarification: {self._iterate_instructions}"
                    )
                self._approval_decision = None
                self._iterate_instructions = None

                # Re-plan with clarified prompt
                self._stage = WorkflowStage.PLANNING
                if self._deadline_exceeded_now(inp):
                    return self._fail_deadline(workflow_id, trace_id, inp)
                planning_out = await self._execute_activity_safe(
                    inp,
                    planning_activity,
                    PlanningInput(workflow_id=workflow_id, prompt=current_prompt),
                    default_timeout=timedelta(minutes=5),
                    retry_policy=RetryPolicy(maximum_attempts=2),
                )
                self._plan_uri = planning_out.plan_artifact_uri
                self._total_llm_calls += 1

            plan_dict = planning_out.plan_dict
            self._outer_iteration = 0
            geo_out: GeometryOutput = None  # type: ignore[assignment]

            # ── Steps 2–4: GENERATING → VERIFYING inner-outer loop ───────
            #
            # Outer-loop semantics (clarified):
            #   self._outer_iteration == 0 is the INITIAL generation (attempt 1).
            #   Subsequent iterations are REFINEMENT attempts driven by the
            #   verifier's feedback.  `max_refinements` caps refinement
            #   attempts only — it does NOT cap the initial generation.
            #
            #   With max_refinements = 5 the workflow performs at most:
            #       1 initial generation + 5 refinement cycles = 6 total
            #       generation attempts before declaring FAILED.
            #
            #   We iterate while outer_iteration <= max_refinements so that
            #   the last allowed pass (outer_iteration == max_refinements)
            #   still gets a verifier pass.  If the verifier rejects that
            #   final pass we fail with OUTER_REFINEMENT_EXHAUSTED rather
            #   than refining a 6th time.
            while self._outer_iteration <= max_refinements:
                # Continue-As-New guard (PRD §9.5)
                if workflow.info().get_current_history_length() >= 38_000:
                    workflow.logger.info("Approaching event limit — triggering Continue-As-New")
                    workflow.continue_as_new(inp)

                # ── Step 2+3: GENERATING ─────────────────────────────────
                self._stage = WorkflowStage.GENERATING
                part_name = f"{inp.name}_outer{self._outer_iteration}"

                if self._deadline_exceeded_now(inp):
                    return self._fail_deadline(workflow_id, trace_id, inp)
                geo_out = await self._execute_activity_safe(
                    inp,
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
                    default_timeout=timedelta(minutes=10),
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
                    iteration_type=(
                        "initial" if self._outer_iteration == 0
                        else "outer_geometric_refinement"
                    ),
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
                    # Inner code-repair loop is exhausted.  This is a clean
                    # terminal FAILED for the user — no human escalation.
                    iter_record.passed = False
                    self._iteration_records.append(iter_record.model_dump())
                    debug = (
                        f"Inner repair loop exhausted after {max_error_retries} attempts. "
                        f"error_type={geo_out.error_type} "
                        f"error={(geo_out.error or '')[:300]}"
                    )
                    user_msg = (
                        f"Something went wrong. The code repair loop failed after "
                        f"{max_error_retries} attempts. Please try again with a "
                        f"simpler or more specific prompt."
                    )
                    return self._fail(
                        workflow_id=workflow_id,
                        trace_id=trace_id,
                        inp=inp,
                        failure_reason="INNER_REPAIR_EXHAUSTED",
                        user_message=user_msg,
                        debug_failure_reason=debug,
                        deadline_exceeded=False,
                    )

                # ── Step 4: VERIFYING ─────────────────────────────────────
                self._stage = WorkflowStage.VERIFYING
                if self._deadline_exceeded_now(inp):
                    return self._fail_deadline(workflow_id, trace_id, inp)
                ver_out: VerifierOutput = await self._execute_activity_safe(
                    inp,
                    verifier_activity,
                    VerifierInput(
                        workflow_id=workflow_id,
                        prompt=current_prompt,
                        cadquery_code=geo_out.cadquery_code,
                        geometry_evidence_dict=geo_out.geometry_evidence_dict or {},
                        render_artifact_uri=geo_out.render_artifact_uri,
                        stl_artifact_uri=geo_out.stl_artifact_uri,
                        prior_feedback=list(judge_feedback_history),
                    ),
                    default_timeout=timedelta(minutes=5),
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

                # Verifier failed — accumulate feedback
                judge_feedback_history.append(ver_out.feedback)
                refinement_history.append({
                    "iteration": self._outer_iteration,
                    "feedback": ver_out.feedback,
                    "approach": None,
                })

                # Refinement budget exhausted: the current pass was already
                # the last allowed refinement attempt and the verifier still
                # rejected it.  Return a clean FAILED — no human escalation.
                if self._outer_iteration >= max_refinements:
                    debug = (
                        f"Outer refinement loop exhausted after "
                        f"{max_refinements} refinement attempts. "
                        f"latest_verifier_feedback={(ver_out.feedback or '')[:300]}"
                    )
                    user_msg = (
                        f"Something went wrong. The design could not pass verification "
                        f"after {max_refinements} refinement attempts. Please try again "
                        f"with clearer dimensions or simpler geometry."
                    )
                    return self._fail(
                        workflow_id=workflow_id,
                        trace_id=trace_id,
                        inp=inp,
                        failure_reason="OUTER_REFINEMENT_EXHAUSTED",
                        user_message=user_msg,
                        debug_failure_reason=debug,
                        deadline_exceeded=False,
                    )

                # ── REFINING ─────────────────────────────────────────────
                self._stage = WorkflowStage.REFINING
                if self._deadline_exceeded_now(inp):
                    return self._fail_deadline(workflow_id, trace_id, inp)
                ref_out: RefinerOutput = await self._execute_activity_safe(
                    inp,
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
                    default_timeout=timedelta(minutes=5),
                    retry_policy=RetryPolicy(maximum_attempts=2),
                )
                self._total_llm_calls += 1
                refiner_feedback = ref_out.refined_code

                self._outer_iteration += 1

            # ── Step 5: AWAITING_APPROVAL ─────────────────────────────────
            if inp.require_approval:
                self._stage = WorkflowStage.AWAITING_APPROVAL
                await workflow.wait_condition(
                    lambda: self._approval_decision is not None,
                    timeout=timedelta(hours=72),
                )

                if self._approval_decision == "rejected":
                    self._failure_reason = (
                        f"Rejected by reviewer: {self._approval_notes}"
                    )
                    self._stage = WorkflowStage.FAILED
                    return self._terminal_output(workflow_id, trace_id, inp, converged=False)

                if self._approval_decision == "iterate":
                    # BUG-2 FIX: properly re-enter the outer restart loop
                    if self._iterate_instructions:
                        current_prompt = (
                            f"{current_prompt}"
                            f"\n\nIteration request: {self._iterate_instructions}"
                        )
                    self._approval_decision = None
                    self._iterate_instructions = None
                    self._iteration_records.clear()  # Fresh history for new attempt
                    continue  # Re-enter outer while True — goes back to PLANNING

            # ── Step 6: HANDOFF ───────────────────────────────────────────
            break  # Exit restart loop — proceed to handoff

        # ─────────────────────────────────────────────────────────────────
        self._stage = WorkflowStage.HANDOFF
        elapsed_ms = (workflow.now().timestamp() * 1000) - self._start_time_ms
        final_score_dict = self._latest_verifier_score

        if self._deadline_exceeded_now(inp):
            return self._fail_deadline(workflow_id, trace_id, inp)
        handoff_out: HandoffOutput = await self._execute_activity_safe(
            inp,
            handoff_activity,
            HandoffInput(
                workflow_id=workflow_id,
                trace_id=trace_id,
                prompt=current_prompt,
                plan_dict=plan_dict,
                cadquery_code=geo_out.cadquery_code,
                iteration=self._outer_iteration,
                step_artifact_uri=geo_out.step_artifact_uri,
                stl_artifact_uri=geo_out.stl_artifact_uri,
                render_artifact_uri=geo_out.render_artifact_uri,
                iteration_records_dicts=list(self._iteration_records),
                final_verifier_score_dict=final_score_dict,
                total_llm_calls=self._total_llm_calls,
                total_time_ms=elapsed_ms,
            ),
            default_timeout=timedelta(minutes=5),
            retry_policy=RetryPolicy(maximum_attempts=3),
        )

        self._forgecad_uri = handoff_out.forgecad_artifact_uri
        self._forgecad_project_dir = handoff_out.metadata.get("forgecad_project_dir")
        self._studio_launch_command = handoff_out.metadata.get("studio_launch_command")
        self._trace_uri = handoff_out.trace_artifact_uri
        self._stage = WorkflowStage.DONE

        return DesignWorkflowOutput(
            workflow_id=workflow_id,
            converged=True,
            trace_artifact_uri=handoff_out.trace_artifact_uri,
            forgecad_artifact_uri=handoff_out.forgecad_artifact_uri,
            step_artifact_uri=geo_out.step_artifact_uri,
            stl_artifact_uri=geo_out.stl_artifact_uri,
            render_artifact_uri=geo_out.render_artifact_uri,
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
            user_message=self._user_message,
            debug_failure_reason=self._debug_failure_reason,
            deadline_exceeded=self._deadline_exceeded,
        )

    # -----------------------------------------------------------------------
    # Deadline / global runtime helpers
    # -----------------------------------------------------------------------

    def _elapsed_seconds(self) -> float:
        """Wall-clock seconds since workflow start (Temporal-deterministic)."""
        return workflow.now().timestamp() - (self._start_time_ms / 1000.0)

    def _remaining_seconds(self, inp: DesignWorkflowInput) -> float:
        """Seconds remaining before the global deadline; never negative."""
        return max(0.0, float(inp.max_total_runtime_seconds) - self._elapsed_seconds())

    def _deadline_exceeded_now(self, inp: DesignWorkflowInput) -> bool:
        return self._remaining_seconds(inp) <= 0

    def _activity_timeout(
        self,
        inp: DesignWorkflowInput,
        default_timeout: timedelta,
    ) -> timedelta:
        """
        Activity start_to_close_timeout clipped to whatever remains of the
        global runtime budget.  Returns timedelta(0) when the deadline is
        already past so the caller can short-circuit.
        """
        remaining = self._remaining_seconds(inp)
        if remaining <= 0:
            return timedelta(seconds=0)
        return min(default_timeout, timedelta(seconds=max(1, int(remaining))))

    def _fail(
        self,
        workflow_id: str,
        trace_id: str,
        inp: DesignWorkflowInput,
        failure_reason: str,
        user_message: str,
        debug_failure_reason: Optional[str] = None,
        deadline_exceeded: bool = False,
    ) -> DesignWorkflowOutput:
        """Set FAILED state and return a terminal output for the workflow."""
        self._stage = WorkflowStage.FAILED
        self._failure_reason = failure_reason
        self._user_message = user_message
        self._debug_failure_reason = debug_failure_reason or failure_reason
        self._deadline_exceeded = deadline_exceeded
        return self._terminal_output(workflow_id, trace_id, inp, converged=False)

    def _timeout_message(self) -> str:
        return (
            "Something went wrong. The design could not be completed within "
            "10 minutes. Please try again with a simpler or more specific prompt."
        )

    def _fail_deadline(
        self,
        workflow_id: str,
        trace_id: str,
        inp: DesignWorkflowInput,
        debug_override: Optional[str] = None,
    ) -> DesignWorkflowOutput:
        return self._fail(
            workflow_id=workflow_id,
            trace_id=trace_id,
            inp=inp,
            failure_reason="GLOBAL_TIMEOUT_EXCEEDED",
            user_message=self._timeout_message(),
            debug_failure_reason=(
                debug_override
                or (
                    f"Global timeout exceeded at stage={self._stage} "
                    f"elapsed={self._elapsed_seconds():.1f}s "
                    f"budget={inp.max_total_runtime_seconds}s"
                )
            ),
            deadline_exceeded=True,
        )

    async def _execute_activity_safe(
        self,
        inp: DesignWorkflowInput,
        activity_fn,
        activity_input,
        *,
        default_timeout: timedelta,
        retry_policy: RetryPolicy,
    ):
        """
        Wrap ``workflow.execute_activity`` so a Temporal ActivityError /
        TimeoutError never escapes as a raw workflow-level failure.

        When the activity fails AND (a) the failure is timeout-related, or
        (b) the global runtime budget is already exhausted, raise the
        internal ``_DeadlineFailure`` sentinel so the top-level ``run``
        catches it and returns terminal FAILED with the clean
        GLOBAL_TIMEOUT_EXCEEDED user message.

        Any other ActivityError / TimeoutError is re-raised unchanged so
        genuine bugs still surface.
        """
        try:
            return await workflow.execute_activity(
                activity_fn,
                activity_input,
                start_to_close_timeout=self._activity_timeout(inp, default_timeout),
                retry_policy=retry_policy,
            )
        except (ActivityError, TemporalTimeoutError) as exc:
            if _is_activity_timeout(exc) or self._deadline_exceeded_now(inp):
                raise _DeadlineFailure(
                    f"{type(exc).__name__} at stage={self._stage} "
                    f"elapsed={self._elapsed_seconds():.1f}s "
                    f"budget={inp.max_total_runtime_seconds}s "
                    f"detail={str(exc)[:300]}"
                ) from exc
            raise
