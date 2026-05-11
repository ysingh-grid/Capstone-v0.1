"""
harness/workflows/worker.py
============================
Temporal worker runner for the Geometry Agent Harness.

Registers all activities and the DesignWorkflow on the configured queues.
Start this process before submitting any design workflows.

Usage:
    python -m harness.cli run-worker
    # or directly:
    python harness/workflows/worker.py

PRD §8.2: Worker boundary definitions.
PRD §8.1: Temporal owns durable progression; workers own bounded execution.
"""

from __future__ import annotations

import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

import temporalio.worker as tw
from temporalio.client import Client

from harness.workflows.activities import (
    geometry_activity,
    handoff_activity,
    planning_activity,
    refiner_activity,
    verifier_activity,
)
from harness.workflows.design_workflow import DesignWorkflow


# Task queues (one per worker type, PRD §8.2)
TASK_QUEUES = {
    "design": "design",       # W·01 — Workflow orchestration
    "planning": "planning",   # W·02 — Planning (reasoning)
    "geometry": "geometry",   # W·03 — Geometry (CadQuery + OCCT)
    "verify": "verify",       # W·04 — Verifier (Judge)
    "handoff": "handoff",     # W·05 — ForgeCAD adapter
}

# For Phase 1 MVP all activities run on the "design" queue in a single worker.
# Phase 3 will split into dedicated queue workers.
MVP_QUEUE = "design"


async def run_worker(temporal_host: str | None = None, task_queue: str = MVP_QUEUE):
    """
    Start the Temporal worker and block until cancelled.

    Args:
        temporal_host: Temporal gRPC endpoint (default: $TEMPORAL_HOST or localhost:7233)
        task_queue: Task queue name to listen on.
    """
    host = temporal_host or os.getenv("TEMPORAL_HOST", "localhost:7233")
    namespace = os.getenv("TEMPORAL_NAMESPACE", "default")

    print(f"[worker] Connecting to Temporal at {host} namespace={namespace}")
    client = await Client.connect(host, namespace=namespace)

    worker = tw.Worker(
        client,
        task_queue=task_queue,
        workflows=[DesignWorkflow],
        activities=[
            planning_activity,
            geometry_activity,
            verifier_activity,
            refiner_activity,
            handoff_activity,
        ],
    )

    print(f"[worker] Worker started on queue '{task_queue}'. Press Ctrl+C to stop.")
    await worker.run()


def main():
    """Entry point for `python harness/workflows/worker.py`."""
    asyncio.run(run_worker())


if __name__ == "__main__":
    main()
