"""
harness/eval/benchmark.py
==========================
Evaluation harness for the Geometry Agent Harness.

Runs the DesignWorkflow via Temporal (not the raw CADSmith Pipeline) on the
T1/T2/T3 benchmark dataset (data/dataset_v2/) and collects:
  - Trace artifacts (convergence, LLM calls, time)
  - CD/F1/IoU against reference STLs
  - Failure category labels
  - Per-tier aggregated statistics

This is a drop-in Temporal-native replacement for
CADSmith/scripts/run_custom_benchmark.py (PRD §14.3).

Usage:
    # Dry-run (no API calls, just list entries)
    python3 -m harness.eval.benchmark --experiment-name test --dry-run

    # Validation run (2 per tier, no approval gate)
    python3 -m harness.eval.benchmark --experiment-name val_run --limit-per-tier 2 --no-approval

    # Full T1 run
    python3 -m harness.eval.benchmark --experiment-name full_t1 --tiers T1

    # Resume a partial run
    python3 -m harness.eval.benchmark --experiment-name full_t1 --tiers T1
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
import time
from pathlib import Path
from typing import Optional

import numpy as np
from dotenv import load_dotenv

_PROJECT_ROOT = Path(__file__).resolve().parents[3]
load_dotenv(_PROJECT_ROOT / ".env")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

_CADSMITH_DIR = _PROJECT_ROOT / "CADSmith"
if str(_CADSMITH_DIR) not in sys.path:
    sys.path.insert(0, str(_CADSMITH_DIR))

DATA_DIR = _CADSMITH_DIR / "data" / "dataset_v2"
RESULTS_BASE_DIR = _PROJECT_ROOT / "eval_results"

TIER_FILES = {
    "T1": "t1_primitives.jsonl",
    "T2": "t2_engineering_parts.jsonl",
    "T3": "t3_complex_parts.jsonl",
}


# ---------------------------------------------------------------------------
# Dataset loader
# ---------------------------------------------------------------------------


def load_entries(tiers: list[str], limit_per_tier: int = 0) -> list[dict]:
    """Load benchmark entries from dataset JSONL files."""
    entries = []
    for tier in tiers:
        filename = TIER_FILES.get(tier)
        if not filename:
            print(f"WARNING: Unknown tier {tier}, skipping")
            continue
        filepath = DATA_DIR / filename
        if not filepath.exists():
            print(f"WARNING: {filepath} not found, skipping")
            continue

        tier_entries = []
        with open(filepath) as f:
            for line in f:
                entry = json.loads(line.strip())
                tier_entries.append(entry)

        if limit_per_tier > 0:
            tier_entries = tier_entries[:limit_per_tier]

        entries.extend(tier_entries)
        print(f"  {tier}: {len(tier_entries)} entries loaded")

    return entries


# ---------------------------------------------------------------------------
# Reference STL management
# ---------------------------------------------------------------------------


def ensure_reference_stl(entry: dict, ref_stl_dir: Path) -> Optional[str]:
    """
    Return path to the reference STL, generating it from reference_code if needed.

    PRD §14.2: Reference STLs are generated once and cached.
    """
    entry_id = entry["id"]
    ref_stl_path = ref_stl_dir / f"{entry_id}.stl"

    if ref_stl_path.exists():
        return str(ref_stl_path)

    reference_code = entry.get("reference_code")
    if not reference_code:
        return None

    try:
        from autofab.executor import Executor
        executor = Executor(output_dir=str(ref_stl_dir), timeout_seconds=60)
        result = executor.execute(reference_code, name=entry_id)
        if result.success and ref_stl_path.exists():
            return str(ref_stl_path)
        print(f"[eval] Reference STL generation failed for {entry_id}: {result.error}")
        return None
    except Exception as exc:
        print(f"[eval] Reference STL generation error for {entry_id}: {exc}")
        return None


# ---------------------------------------------------------------------------
# Single-entry runner
# ---------------------------------------------------------------------------


async def run_single_entry(
    entry: dict,
    client,
    task_queue: str,
    experiment_dir: Path,
    require_approval: bool,
    max_error_retries: int,
    max_refinement_iterations: int,
    timeout_minutes: int,
    ref_stl_dir: Path,
    dry_run: bool,
) -> dict:
    """
    Submit a single entry as a Temporal workflow and await the result.
    Computes CD/F1/IoU against the reference STL post-completion.
    """
    from harness.artifacts.store import get_store
    from harness.workflows.design_workflow import DesignWorkflow, DesignWorkflowInput
    from harness.runtime.primitives import compute_mesh_metrics

    entry_id = entry["id"]
    tier = entry.get("tier", "unknown")
    prompt = entry["prompt"]

    base_record = {
        "id": entry_id,
        "tier": tier,
        "prompt": prompt,
        "success": False,
        "converged": False,
        "execution_success": False,
        "num_iterations": 0,
        "num_llm_calls": 0,
        "total_time_ms": 0.0,
        "metrics": None,
        "failure_category": None,
        "failure_reason": None,
        "trace_artifact_uri": None,
        "step_artifact_uri": None,
        "stl_artifact_uri": None,
        "error": None,
    }

    if dry_run:
        print(f"  [DRY RUN] Would submit: {entry_id} | {prompt[:60]}")
        return {**base_record, "dry_run": True}

    # Ensure reference STL exists
    ref_stl_path = ensure_reference_stl(entry, ref_stl_dir)

    wf_input = DesignWorkflowInput(
        prompt=prompt,
        name=entry_id,
        require_approval=require_approval,
        max_error_retries=max_error_retries,
        max_refinement_iterations=max_refinement_iterations,
    )

    import uuid
    wf_id = f"eval-{entry_id}-{uuid.uuid4().hex[:6]}"
    start_time = time.time()

    try:
        handle = await client.start_workflow(
            DesignWorkflow.run,
            wf_input,
            id=wf_id,
            task_queue=task_queue,
        )

        # Await completion with timeout
        result = await asyncio.wait_for(
            handle.result(),
            timeout=timeout_minutes * 60,
        )

        elapsed_ms = (time.time() - start_time) * 1000

        # Read the trace artifact for detailed stats
        store = get_store()
        trace_data = {}
        if result.trace_artifact_uri and store.exists(result.trace_artifact_uri):
            trace_data = store.get_json(result.trace_artifact_uri)

        record = {
            **base_record,
            "success": result.converged,
            "converged": result.converged,
            "execution_success": result.step_artifact_uri is not None,
            "num_iterations": trace_data.get("total_iterations", 0),
            "num_llm_calls": trace_data.get("total_llm_calls", 0),
            "total_time_ms": elapsed_ms,
            "failure_category": trace_data.get("failure_category"),
            "failure_reason": result.failure_reason,
            "trace_artifact_uri": result.trace_artifact_uri,
            "step_artifact_uri": result.step_artifact_uri,
            "stl_artifact_uri": result.stl_artifact_uri,
        }

        # Compute CD/F1/IoU if STL was generated and reference STL exists
        if result.stl_artifact_uri and ref_stl_path and store.exists(result.stl_artifact_uri):
            gen_stl = str(store.local_path(result.stl_artifact_uri))
            metrics = compute_mesh_metrics(
                generated_stl_path=gen_stl,
                reference_stl_path=ref_stl_path,
                normalize=False,
                use_icp=True,
            )
            record["metrics"] = metrics

    except asyncio.TimeoutError:
        elapsed_ms = (time.time() - start_time) * 1000
        record = {
            **base_record,
            "total_time_ms": elapsed_ms,
            "error": f"Workflow timed out after {timeout_minutes} minutes",
            "failure_reason": f"Timeout after {timeout_minutes} min",
        }
    except Exception as exc:
        elapsed_ms = (time.time() - start_time) * 1000
        record = {
            **base_record,
            "total_time_ms": elapsed_ms,
            "error": str(exc),
        }

    return record


# ---------------------------------------------------------------------------
# Main benchmark runner
# ---------------------------------------------------------------------------


async def run_benchmark(args: argparse.Namespace) -> None:
    from temporalio.client import Client

    host = os.getenv("TEMPORAL_HOST", "localhost:7233")
    namespace = os.getenv("TEMPORAL_NAMESPACE", "default")

    experiment_dir = RESULTS_BASE_DIR / args.experiment_name
    experiment_dir.mkdir(parents=True, exist_ok=True)
    ref_stl_dir = DATA_DIR / "reference_stls"
    ref_stl_dir.mkdir(parents=True, exist_ok=True)

    results_file = experiment_dir / "results.jsonl"
    config_file = experiment_dir / "config.json"

    config = {
        "experiment_name": args.experiment_name,
        "dataset": "dataset_v2",
        "tiers": args.tiers,
        "max_error_retries": args.max_error_retries,
        "max_refinement_iterations": args.max_refinement_iterations,
        "limit_per_tier": args.limit_per_tier,
        "require_approval": not args.no_approval,
        "dry_run": args.dry_run,
        "temporal_host": host,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    with open(config_file, "w") as f:
        json.dump(config, f, indent=2)

    print(f"\nLoading benchmark entries…")
    entries = load_entries(args.tiers, limit_per_tier=args.limit_per_tier)

    if args.ids:
        id_set = set(args.ids)
        entries = [e for e in entries if e["id"] in id_set]
        print(f"Filtered to {len(entries)} entries: {args.ids}")

    # Resume: skip already-completed IDs
    completed_ids: set[str] = set()
    if results_file.exists() and not args.ids:
        with open(results_file) as f:
            for line in f:
                try:
                    r = json.loads(line)
                    completed_ids.add(r["id"])
                except (json.JSONDecodeError, KeyError):
                    continue
    remaining = [e for e in entries if e["id"] not in completed_ids]
    print(f"Total: {len(entries)}, already done: {len(completed_ids)}, remaining: {len(remaining)}\n")

    if not remaining:
        print("All entries already completed.")
        return

    if args.dry_run:
        print(f"DRY RUN — listing {len(remaining)} entries:")
        for e in remaining:
            print(f"  [{e.get('tier', '?')}] {e['id']}: {e['prompt'][:70]}")
        return

    client = await Client.connect(host, namespace=namespace)

    total_done = 0
    cd_vals, f1_vals, iou_vals = [], [], []
    tier_stats: dict[str, dict] = {}

    for entry in remaining:
        tier = entry.get("tier", "?")
        print(f"\n[{total_done + len(completed_ids) + 1}/{len(entries)}] "
              f"{entry['id']} ({tier}): {entry['prompt'][:60]}…", flush=True)

        record = await run_single_entry(
            entry=entry,
            client=client,
            task_queue=args.task_queue,
            experiment_dir=experiment_dir,
            require_approval=not args.no_approval,
            max_error_retries=args.max_error_retries,
            max_refinement_iterations=args.max_refinement_iterations,
            timeout_minutes=args.timeout_minutes,
            ref_stl_dir=ref_stl_dir,
            dry_run=args.dry_run,
        )

        with open(results_file, "a") as f:
            f.write(json.dumps(record) + "\n")

        total_done += 1

        # Update aggregates
        if tier not in tier_stats:
            tier_stats[tier] = {"total": 0, "exec": 0, "conv": 0, "cd": [], "f1": [], "iou": []}
        ts = tier_stats[tier]
        ts["total"] += 1
        if record.get("execution_success"):
            ts["exec"] += 1
        if record.get("converged"):
            ts["conv"] += 1
        if m := record.get("metrics"):
            if m.get("chamfer_distance") is not None:
                ts["cd"].append(m["chamfer_distance"])
                ts["f1"].append(m["f1_score"])
                ts["iou"].append(m["volumetric_iou"])
                cd_vals.append(m["chamfer_distance"])
                f1_vals.append(m["f1_score"])
                iou_vals.append(m["volumetric_iou"])

        # Print per-entry summary
        print(f"  exec={record.get('execution_success')}, "
              f"conv={record.get('converged')}, "
              f"iters={record.get('num_iterations')}, "
              f"calls={record.get('num_llm_calls')}, "
              f"time={record.get('total_time_ms', 0)/1000:.1f}s")
        if m := record.get("metrics"):
            print(f"  CD={m['chamfer_distance']:.4f}  "
                  f"F1={m['f1_score']:.4f}  "
                  f"IoU={m['volumetric_iou']:.4f}")
        elif record.get("error"):
            print(f"  ERROR: {record['error'][:120]}")

    # ── Final summary ──────────────────────────────────────────────────────
    print(f"\n{'='*70}")
    print(f"EXPERIMENT: {args.experiment_name}")
    print(f"{'='*70}")
    print(f"Total: {total_done} | "
          f"Exec OK: {sum(1 for ts in tier_stats.values() for _ in range(ts['exec']))}/{total_done}")

    if cd_vals:
        print(f"\nOverall Metrics (n={len(cd_vals)}):")
        print(f"  CD  — median: {np.median(cd_vals):.4f}, mean: {np.mean(cd_vals):.4f}")
        print(f"  F1  — median: {np.median(f1_vals):.4f}, mean: {np.mean(f1_vals):.4f}")
        print(f"  IoU — median: {np.median(iou_vals):.4f}, mean: {np.mean(iou_vals):.4f}")

    if tier_stats:
        print(f"\nPer-Tier:")
        print(f"  {'Tier':<6} {'Exec%':>8} {'Conv%':>8} {'CD Med':>10} {'F1 Med':>10} {'IoU Med':>10}")
        print(f"  {'-'*6} {'-'*8} {'-'*8} {'-'*10} {'-'*10} {'-'*10}")
        for tier in sorted(tier_stats.keys()):
            ts = tier_stats[tier]
            exec_pct = ts["exec"] / ts["total"] * 100 if ts["total"] else 0
            conv_pct = ts["conv"] / ts["total"] * 100 if ts["total"] else 0
            cd_med = f"{np.median(ts['cd']):.4f}" if ts["cd"] else "—"
            f1_med = f"{np.median(ts['f1']):.4f}" if ts["f1"] else "—"
            iou_med = f"{np.median(ts['iou']):.4f}" if ts["iou"] else "—"
            print(f"  {tier:<6} {exec_pct:>7.1f}% {conv_pct:>7.1f}% "
                  f"{cd_med:>10} {f1_med:>10} {iou_med:>10}")

    print(f"\nResults : {results_file}")
    print(f"Config  : {config_file}")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(description="Geometry Agent Harness — Benchmark Runner")
    parser.add_argument("--experiment-name", required=True, help="Name for this experiment run")
    parser.add_argument("--tiers", nargs="+", default=["T1", "T2", "T3"],
                        choices=["T1", "T2", "T3"], help="Which tiers to include")
    parser.add_argument("--limit-per-tier", type=int, default=0,
                        help="Max entries per tier (0 = all)")
    parser.add_argument("--ids", nargs="+", default=None,
                        help="Run only specific entry IDs")
    parser.add_argument("--max-error-retries", type=int, default=3)
    parser.add_argument("--max-refinement-iterations", type=int, default=5)
    parser.add_argument("--timeout-minutes", type=int, default=15,
                        help="Per-entry workflow timeout in minutes (default 15)")
    parser.add_argument("--task-queue", default="design",
                        help="Temporal task queue (default: design)")
    parser.add_argument("--no-approval", action="store_true",
                        help="Skip the human approval gate")
    parser.add_argument("--dry-run", action="store_true",
                        help="List entries without submitting any workflows")
    args = parser.parse_args()
    asyncio.run(run_benchmark(args))


if __name__ == "__main__":
    main()
