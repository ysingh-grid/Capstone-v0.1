"""
harness/cli.py
==============
Command-line interface for the Geometry Agent Harness.

Commands:
  harness run-worker          Start the Temporal worker process
  harness run-api             Start the FastAPI server
  harness submit <prompt>     Start a design workflow and stream status
  harness approve <id>        Send approval signal
  harness reject <id>         Send rejection signal
  harness iterate <id>        Send iteration instructions
  harness status <id>         Print current status
  harness trace <id>          Print the trace artifact JSON

All commands read from .env automatically.
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Optional

import click
from dotenv import load_dotenv

# Load .env from project root
_PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(_PROJECT_ROOT / ".env")


# ---------------------------------------------------------------------------
# CLI group
# ---------------------------------------------------------------------------


@click.group()
def main():
    """Geometry Agent Harness — CLI.

    Build, verify, and deliver AI-generated CAD parts with durable Temporal
    orchestration and deterministic geometry validation.
    """


# ---------------------------------------------------------------------------
# run-worker
# ---------------------------------------------------------------------------


@main.command("run-worker")
@click.option("--host", default=None, help="Temporal gRPC endpoint (overrides TEMPORAL_HOST)")
@click.option("--queue", default="design", help="Task queue name (default: design)")
def run_worker(host: Optional[str], queue: str):
    """Start the Temporal worker. Run this before submitting designs."""
    from harness.workflows.worker import run_worker as _run_worker

    click.echo(f"Starting Temporal worker on queue='{queue}' …")
    asyncio.run(_run_worker(temporal_host=host, task_queue=queue))


# ---------------------------------------------------------------------------
# run-api
# ---------------------------------------------------------------------------


@main.command("run-api")
@click.option("--host", default="0.0.0.0", help="API bind host")
@click.option("--port", default=8000, type=int, help="API bind port")
@click.option("--reload", is_flag=True, help="Enable hot-reload (dev mode)")
def run_api(host: str, port: int, reload: bool):
    """Start the FastAPI Product API server."""
    import uvicorn

    click.echo(f"Starting API server at http://{host}:{port} …")
    uvicorn.run(
        "harness.api.app:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info",
    )


# ---------------------------------------------------------------------------
# submit
# ---------------------------------------------------------------------------


@main.command("submit")
@click.argument("prompt")
@click.option("--name", default="part", help="Part name (used as file prefix)")
@click.option("--no-approval", is_flag=True, help="Skip the human approval gate")
@click.option("--max-retries", default=3, type=int)
@click.option("--max-refinements", default=5, type=int)
@click.option("--context", default=None, help="Project context string")
def submit(
    prompt: str,
    name: str,
    no_approval: bool,
    max_retries: int,
    max_refinements: int,
    context: Optional[str],
):
    """
    Submit a natural-language CAD design prompt and stream status updates.

    Example:
        harness submit "A 60x40x10mm plate with four M5 corner holes"
    """
    asyncio.run(
        _submit_and_stream(
            prompt=prompt,
            name=name,
            require_approval=not no_approval,
            max_error_retries=max_retries,
            max_refinement_iterations=max_refinements,
            project_context=context,
        )
    )


async def _submit_and_stream(
    prompt: str,
    name: str,
    require_approval: bool,
    max_error_retries: int,
    max_refinement_iterations: int,
    project_context: Optional[str],
):
    from temporalio.client import Client
    from harness.workflows.design_workflow import DesignWorkflow, DesignWorkflowInput

    host = os.getenv("TEMPORAL_HOST", "localhost:7233")
    namespace = os.getenv("TEMPORAL_NAMESPACE", "default")

    click.echo(f"Connecting to Temporal at {host} …")
    client = await Client.connect(host, namespace=namespace)

    wf_input = DesignWorkflowInput(
        prompt=prompt,
        name=name,
        project_context=project_context,
        max_error_retries=max_error_retries,
        max_refinement_iterations=max_refinement_iterations,
        require_approval=require_approval,
    )

    import uuid as _uuid
    wf_id = f"design-{name}-{_uuid.uuid4().hex[:8]}"
    handle = await client.start_workflow(
        DesignWorkflow.run,
        wf_input,
        id=wf_id,
        task_queue="design",
    )

    click.echo(f"\n✓ Workflow started: {wf_id}")
    click.echo(f"  Temporal UI: http://localhost:8233/namespaces/default/workflows/{wf_id}")
    click.echo("\nPolling status every 10 seconds (Ctrl+C to stop polling) …\n")

    last_stage = None
    try:
        while True:
            try:
                status = await handle.query(DesignWorkflow.status)
                stage = status.get("stage", "?")

                if stage != last_stage:
                    click.echo(f"  [{stage}]")
                    last_stage = stage

                    score = status.get("latest_verifier_score")
                    if score:
                        click.echo(
                            f"    Judge: passed={score.get('passed')} "
                            f"feedback={str(score.get('feedback', ''))[:120]}"
                        )

                    if stage == "AWAITING_APPROVAL":
                        click.echo(
                            "\n  ⚠  Workflow is waiting for human approval.\n"
                            f"  Run: harness approve {wf_id}\n"
                        )

                    if stage in ("DONE", "FAILED", "ESCALATED"):
                        _print_final_status(status, wf_id)
                        break

            except Exception as poll_exc:
                click.echo(f"  [poll error] {poll_exc}")

            await asyncio.sleep(10)

    except KeyboardInterrupt:
        click.echo(f"\nStopped polling. Workflow {wf_id} continues running in Temporal.")


def _print_final_status(status: dict, wf_id: str):
    stage = status.get("stage")
    click.echo(f"\n{'='*60}")
    click.echo(f"  Workflow {wf_id} — {stage}")
    click.echo(f"{'='*60}")
    if stage == "DONE":
        click.echo(f"  ForgeCAD URI : {status.get('forgecad_artifact_uri')}")
        click.echo(f"  STEP URI     : {status.get('step_artifact_uri')}")
        click.echo(f"  STL URI      : {status.get('stl_artifact_uri')}")
        click.echo(f"  Render URI   : {status.get('render_artifact_uri')}")
        click.echo(f"  Trace URI    : {status.get('trace_artifact_uri')}")
    else:
        click.echo(f"  Failure: {status.get('failure_reason')}")
    click.echo(f"  LLM calls    : {status.get('total_llm_calls', '?')}")


# ---------------------------------------------------------------------------
# approve
# ---------------------------------------------------------------------------


@main.command("approve")
@click.argument("workflow_id")
@click.option("--notes", default="", help="Optional reviewer notes")
def approve(workflow_id: str, notes: str):
    """Send an approval signal to a waiting workflow."""
    asyncio.run(_signal_workflow(workflow_id, "approve", {"decision": "approved", "notes": notes}))
    click.echo(f"✓ Approved: {workflow_id}")


# ---------------------------------------------------------------------------
# reject
# ---------------------------------------------------------------------------


@main.command("reject")
@click.argument("workflow_id")
@click.option("--reason", default="", help="Rejection reason")
def reject(workflow_id: str, reason: str):
    """Send a rejection signal to a waiting workflow."""
    asyncio.run(_signal_workflow(workflow_id, "reject", reason))
    click.echo(f"✓ Rejected: {workflow_id}")


# ---------------------------------------------------------------------------
# iterate
# ---------------------------------------------------------------------------


@main.command("iterate")
@click.argument("workflow_id")
@click.argument("instructions")
@click.option("--constraints", default="", help="Updated constraints")
def iterate(workflow_id: str, instructions: str, constraints: str):
    """Send revision instructions into a running workflow."""
    asyncio.run(_signal_workflow(workflow_id, "iterate", {"instructions": instructions, "updated_constraints": constraints}))
    click.echo(f"✓ Iterate signal sent: {workflow_id}")


# ---------------------------------------------------------------------------
# status
# ---------------------------------------------------------------------------


@main.command("status")
@click.argument("workflow_id")
def status(workflow_id: str):
    """Print the current status of a design workflow."""
    result = asyncio.run(_query_workflow(workflow_id, "status"))
    click.echo(json.dumps(result, indent=2))


# ---------------------------------------------------------------------------
# trace
# ---------------------------------------------------------------------------


@main.command("trace")
@click.argument("workflow_id")
def trace(workflow_id: str):
    """Print the trace artifact JSON for a completed design workflow."""
    from harness.artifacts.store import get_store

    result = asyncio.run(_query_workflow(workflow_id, "status"))
    trace_uri = result.get("trace_artifact_uri")
    if not trace_uri:
        click.echo("Trace not yet available.")
        return
    store = get_store()
    if not store.exists(trace_uri):
        click.echo(f"Trace artifact not found at {trace_uri}")
        return
    click.echo(store.get_text(trace_uri))


# ---------------------------------------------------------------------------
# Shared async helpers
# ---------------------------------------------------------------------------


async def _signal_workflow(workflow_id: str, signal_name: str, payload):
    from temporalio.client import Client
    from harness.workflows.design_workflow import DesignWorkflow

    host = os.getenv("TEMPORAL_HOST", "localhost:7233")
    namespace = os.getenv("TEMPORAL_NAMESPACE", "default")
    client = await Client.connect(host, namespace=namespace)
    handle = client.get_workflow_handle(workflow_id)

    signal_map = {
        "approve": DesignWorkflow.approve_signal,
        "reject": DesignWorkflow.reject_signal,
        "iterate": DesignWorkflow.iterate_signal,
    }
    sig = signal_map[signal_name]

    if isinstance(payload, dict):
        if signal_name == "approve":
            await handle.signal(sig, payload["decision"], payload["notes"])
        elif signal_name == "iterate":
            await handle.signal(sig, payload["instructions"], payload["updated_constraints"])
    else:
        await handle.signal(sig, payload)


async def _query_workflow(workflow_id: str, query_name: str) -> dict:
    from temporalio.client import Client
    from harness.workflows.design_workflow import DesignWorkflow

    host = os.getenv("TEMPORAL_HOST", "localhost:7233")
    namespace = os.getenv("TEMPORAL_NAMESPACE", "default")
    client = await Client.connect(host, namespace=namespace)
    handle = client.get_workflow_handle(workflow_id)

    query_map = {
        "status": DesignWorkflow.status,
        "current_phase": DesignWorkflow.current_phase,
    }
    return await handle.query(query_map[query_name])
