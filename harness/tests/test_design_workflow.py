"""
harness/tests/test_design_workflow.py
======================================
Tests for the global 10-minute workflow timeout and clean terminal-failure
behavior of DesignWorkflow.

Covers:
  A. Global deadline exceeded (max_total_runtime_seconds=1).
  B. Inner repair loop exhausted (geometry_activity returns success=False).
  C. Outer refinement loop exhausted (verifier_activity always returns
     passed=False).
  D. Successful path (verifier_activity returns passed=True on attempt 1).

The full DesignWorkflow is exercised via Temporal's time-skipping
WorkflowEnvironment with stubbed activities so we don't depend on CadQuery /
MeshLib / autofab / vtk at test time.
"""
from __future__ import annotations

import asyncio
import sys
import types
import uuid

import pytest

# Skip the whole module if temporalio is unavailable.
pytest.importorskip("temporalio")

from temporalio import activity  # noqa: E402
from temporalio.client import Client  # noqa: E402
from temporalio.testing import WorkflowEnvironment  # noqa: E402
from temporalio.worker import Worker  # noqa: E402


# ---------------------------------------------------------------------------
# Stub the heavy / optional dependencies that `harness.workflows.activities`
# tries to import at module-load time.  We don't run those activities in
# tests — only the DesignWorkflow with stubbed replacements — so empty stub
# modules are sufficient.
# ---------------------------------------------------------------------------


def _stub(mod_name: str, **attrs) -> types.ModuleType:
    m = sys.modules.get(mod_name)
    if m is None:
        m = types.ModuleType(mod_name)
        sys.modules[mod_name] = m
    for k, v in attrs.items():
        setattr(m, k, v)
    return m


for _name in (
    "cadquery",
    "vtk",
    "meshlib",
    "meshlib.mrmeshpy",
    "trimesh",
    "numpy_stl",
    "stl",
    "pandas",
    "matplotlib",
    "matplotlib.pyplot",
):
    _stub(_name)

# autofab namespace stubs
_autofab = _stub("autofab")
_stub(
    "autofab.agents",
    plan=lambda *a, **k: {},
    generate_code=lambda *a, **k: "",
    evaluate_geometry=lambda *a, **k: {},
    refine_geometry=lambda *a, **k: "",
)


class _StubExecutor:  # placeholder for autofab.executor.Executor
    def __init__(self, *a, **k):
        pass


class _StubExecutionResult:
    pass


def _strip_python_fences(code: str) -> str:
    return code


_stub(
    "autofab.executor",
    Executor=_StubExecutor,
    ExecutionResult=_StubExecutionResult,
    _strip_python_fences=_strip_python_fences,
)


class _StubValidator:
    def __init__(self, *a, **k):
        pass


_stub("autofab.validator", Validator=_StubValidator)
_stub(
    "autofab.langfuse_tracing",
    init_workflow_trace=lambda *a, **k: None,
    update_workflow_trace=lambda *a, **k: None,
    flush_trace=lambda: None,
)

# Import the workflow + activity I/O dataclasses *after* the stubs are wired.
from harness.workflows.design_workflow import (  # noqa: E402
    DesignWorkflow,
    DesignWorkflowInput,
    WorkflowStage,
)
from harness.workflows.activities import (  # noqa: E402
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
)


# ---------------------------------------------------------------------------
# Stub activity factories — keyed by behavior we need per test.
# ---------------------------------------------------------------------------


def _minimal_plan_dict() -> dict:
    return {
        "description": "Test bracket",
        "dimensions": {
            "overall_bbox": {"xlen": 60.0, "ylen": 40.0, "zlen": 10.0},
            "key_dimensions": {"wall_thickness": 3.0},
        },
        "features": [],
        "constraints": {
            "volume_estimate_mm3": 20000.0,
            "num_holes": 0,
        },
        "acceptance_criteria": {
            "volume_error_threshold_pct": 5.0,
            "bbox_iou_threshold": 0.90,
            "min_f1_score": 0.95,
        },
        "notes": "",
        "ambiguous": False,
    }


@activity.defn(name="planning_activity")
async def planning_stub(inp: PlanningInput) -> PlanningOutput:
    return PlanningOutput(
        plan_dict=_minimal_plan_dict(),
        plan_artifact_uri="stub://plan.json",
        ambiguous=False,
        ambiguity_questions=[],
    )


@activity.defn(name="planning_activity")
async def planning_slow_stub(inp: PlanningInput) -> PlanningOutput:
    """Sleeps long enough that any activity timeout shorter than ~5s will
    fire.  Used to verify the workflow converts a Temporal StartToClose
    timeout into a clean terminal FAILED rather than letting the raw
    ActivityError escape."""
    await asyncio.sleep(5.0)
    return PlanningOutput(
        plan_dict=_minimal_plan_dict(),
        plan_artifact_uri="stub://plan.json",
        ambiguous=False,
        ambiguity_questions=[],
    )


@activity.defn(name="geometry_activity")
async def geometry_success_stub(inp: GeometryInput) -> GeometryOutput:
    return GeometryOutput(
        success=True,
        cadquery_code="# stub code\n",
        geometry_evidence_dict=None,
        step_artifact_uri="stub://part.step",
        stl_artifact_uri="stub://part.stl",
        render_artifact_uri="stub://part.png",
        repair_actions_dicts=[],
    )


@activity.defn(name="geometry_activity")
async def geometry_failure_stub(inp: GeometryInput) -> GeometryOutput:
    return GeometryOutput(
        success=False,
        cadquery_code="# bad code\n",
        geometry_evidence_dict=None,
        step_artifact_uri=None,
        stl_artifact_uri=None,
        render_artifact_uri=None,
        repair_actions_dicts=[],
        error="NameError: name 'broken' is not defined",
        error_type="NameError",
    )


@activity.defn(name="verifier_activity")
async def verifier_pass_stub(inp: VerifierInput) -> VerifierOutput:
    return VerifierOutput(passed=True, feedback="ok", failure_category=None)


@activity.defn(name="verifier_activity")
async def verifier_fail_stub(inp: VerifierInput) -> VerifierOutput:
    return VerifierOutput(
        passed=False,
        feedback="bbox mismatch",
        failure_category=None,
    )


@activity.defn(name="refiner_activity")
async def refiner_stub(inp: RefinerInput) -> RefinerOutput:
    return RefinerOutput(refined_code="# refined\n")


@activity.defn(name="handoff_activity")
async def handoff_stub(inp: HandoffInput) -> HandoffOutput:
    return HandoffOutput(
        forgecad_artifact_uri="stub://part.forge.js",
        trace_artifact_uri="stub://trace.json",
        metadata={"studio_launch_command": "forgecad studio ."},
    )


# ---------------------------------------------------------------------------
# Test harness — spins up a time-skipping Temporal env, registers the
# DesignWorkflow plus whichever stubbed activities the test needs.
# ---------------------------------------------------------------------------


async def _run_workflow(
    *,
    activities: list,
    wf_input: DesignWorkflowInput,
):
    async with await WorkflowEnvironment.start_time_skipping() as env:
        client: Client = env.client
        task_queue = f"test-{uuid.uuid4().hex[:8]}"
        async with Worker(
            client,
            task_queue=task_queue,
            workflows=[DesignWorkflow],
            activities=activities,
        ):
            handle = await client.start_workflow(
                DesignWorkflow.run,
                wf_input,
                id=f"wf-{uuid.uuid4().hex[:8]}",
                task_queue=task_queue,
            )
            result = await handle.result()
            status = await handle.query(DesignWorkflow.status)
            return result, status


# ---------------------------------------------------------------------------
# A. Global deadline exceeded
# ---------------------------------------------------------------------------


def test_global_deadline_exceeded_returns_failed():
    """A zero-second budget trips the deadline check on the very first
    activity (planning) and returns terminal FAILED without ever invoking
    planning.  This exercises both the deadline check and the
    GLOBAL_TIMEOUT_EXCEEDED user-facing failure path."""
    async def _run():
        inp = DesignWorkflowInput(
            prompt="A bracket",
            name="part",
            require_approval=False,
            max_total_runtime_seconds=0,
        )
        return await _run_workflow(
            activities=[
                planning_stub,
                geometry_success_stub,
                verifier_pass_stub,
                refiner_stub,
                handoff_stub,
            ],
            wf_input=inp,
        )

    result, status = asyncio.run(_run())
    assert status["stage"] == WorkflowStage.FAILED
    assert status["deadline_exceeded"] is True
    assert status["failure_reason"] == "GLOBAL_TIMEOUT_EXCEEDED"
    assert isinstance(status["user_message"], str)
    assert status["user_message"].startswith("Something went wrong")
    assert result.deadline_exceeded is True
    assert result.failure_reason == "GLOBAL_TIMEOUT_EXCEEDED"


# ---------------------------------------------------------------------------
# B. Inner repair loop exhausted
# ---------------------------------------------------------------------------


def test_inner_repair_exhausted_returns_failed():
    async def _run():
        inp = DesignWorkflowInput(
            prompt="A bracket",
            name="part",
            require_approval=False,
            max_error_retries=3,
            max_refinement_iterations=5,
            max_total_runtime_seconds=600,
        )
        return await _run_workflow(
            activities=[
                planning_stub,
                geometry_failure_stub,
                verifier_pass_stub,
                refiner_stub,
                handoff_stub,
            ],
            wf_input=inp,
        )

    result, status = asyncio.run(_run())
    assert status["stage"] == WorkflowStage.FAILED
    assert status["failure_reason"] == "INNER_REPAIR_EXHAUSTED"
    assert status["deadline_exceeded"] is False
    assert "repair loop" in (status["user_message"] or "").lower()
    assert result.failure_reason == "INNER_REPAIR_EXHAUSTED"


# ---------------------------------------------------------------------------
# C. Outer refinement loop exhausted
# ---------------------------------------------------------------------------


def test_outer_refinement_exhausted_returns_failed():
    async def _run():
        inp = DesignWorkflowInput(
            prompt="A bracket",
            name="part",
            require_approval=False,
            max_error_retries=3,
            max_refinement_iterations=5,
            max_total_runtime_seconds=600,
        )
        return await _run_workflow(
            activities=[
                planning_stub,
                geometry_success_stub,
                verifier_fail_stub,
                refiner_stub,
                handoff_stub,
            ],
            wf_input=inp,
        )

    result, status = asyncio.run(_run())
    assert status["stage"] == WorkflowStage.FAILED
    assert status["failure_reason"] == "OUTER_REFINEMENT_EXHAUSTED"
    assert status["deadline_exceeded"] is False
    msg = status["user_message"] or ""
    assert "5 refinement attempts" in msg
    assert result.failure_reason == "OUTER_REFINEMENT_EXHAUSTED"


# ---------------------------------------------------------------------------
# E. Activity StartToClose timeout → clean terminal FAILED
# ---------------------------------------------------------------------------


def test_activity_timeout_is_converted_to_failed():
    """
    Real-world failure mode: with a tight global budget, the first
    activity's start_to_close_timeout fires and Temporal raises
    ActivityError(cause=TimeoutError(StartToClose)).  The workflow must
    catch that and return a clean terminal FAILED with
    failure_reason=GLOBAL_TIMEOUT_EXCEEDED, deadline_exceeded=True, and
    the user-facing timeout message — NOT a raw "Workflow Execution
    Failed: Activity task timed out".
    """
    async def _run():
        # Tight 1-second budget — planning_slow_stub sleeps 5s, so the
        # activity start_to_close_timeout (clamped to ~1s by
        # _activity_timeout) trips well before planning returns.
        inp = DesignWorkflowInput(
            prompt="A bracket",
            name="part",
            require_approval=False,
            max_total_runtime_seconds=1,
        )
        return await _run_workflow(
            activities=[
                planning_slow_stub,
                geometry_success_stub,
                verifier_pass_stub,
                refiner_stub,
                handoff_stub,
            ],
            wf_input=inp,
        )

    result, status = asyncio.run(_run())
    assert status["stage"] == WorkflowStage.FAILED
    assert status["failure_reason"] == "GLOBAL_TIMEOUT_EXCEEDED"
    assert status["deadline_exceeded"] is True
    assert status["user_message"] is not None
    assert status["user_message"].startswith("Something went wrong")
    assert "10 minutes" in status["user_message"]
    # Debug field should retain the underlying ActivityError / timeout detail.
    debug = status["debug_failure_reason"] or ""
    assert (
        "ActivityError" in debug
        or "TimeoutError" in debug
        or "StartToClose" in debug.lower() + debug
    )
    assert result.failure_reason == "GLOBAL_TIMEOUT_EXCEEDED"
    assert result.deadline_exceeded is True


# ---------------------------------------------------------------------------
# D. Successful path
# ---------------------------------------------------------------------------


def test_success_path_returns_done():
    async def _run():
        inp = DesignWorkflowInput(
            prompt="A bracket",
            name="part",
            require_approval=False,
            max_total_runtime_seconds=600,
        )
        return await _run_workflow(
            activities=[
                planning_stub,
                geometry_success_stub,
                verifier_pass_stub,
                refiner_stub,
                handoff_stub,
            ],
            wf_input=inp,
        )

    result, status = asyncio.run(_run())
    assert status["stage"] == WorkflowStage.DONE
    assert status["deadline_exceeded"] is False
    assert status["failure_reason"] is None
    assert status["user_message"] is None
    assert result.converged is True
    assert result.forgecad_artifact_uri == "stub://part.forge.js"
