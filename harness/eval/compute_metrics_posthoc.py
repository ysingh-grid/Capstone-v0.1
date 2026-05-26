"""
harness/eval/compute_metrics_posthoc.py
========================================
Post-hoc metrics computation for benchmark runs where CD/F1/IoU were skipped
(e.g. due to the trimesh import bug).

Reads an existing results.jsonl, resolves the saved stl_artifact_uri for each
converged entry, computes CD/F1/IoU against the reference STL, and writes an
updated results file alongside the original.

Usage:
    python3 -m harness.eval.compute_metrics_posthoc \
        --experiment-name phase2_gate

Output:
    eval_results/<name>/results_with_metrics.jsonl  — updated records
    eval_results/<name>/metrics_summary.json        — aggregate stats
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_CADSMITH_DIR = _PROJECT_ROOT / "CADSmith"
if str(_CADSMITH_DIR) not in sys.path:
    sys.path.insert(0, str(_CADSMITH_DIR))

RESULTS_BASE_DIR = _PROJECT_ROOT / "eval_results"
REF_STL_DIR = _CADSMITH_DIR / "data" / "dataset_v2" / "reference_stls"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--experiment-name", required=True)
    parser.add_argument("--normalize", action="store_true", default=False,
                        help="Normalize meshes to [0,1]³ (default: absolute mm)")
    parser.add_argument("--no-icp", action="store_true", default=False,
                        help="Skip ICP alignment")
    args = parser.parse_args()

    from harness.artifacts.store import get_store
    from harness.runtime.primitives import compute_mesh_metrics

    store = get_store()
    exp_dir = RESULTS_BASE_DIR / args.experiment_name
    results_file = exp_dir / "results.jsonl"

    if not results_file.exists():
        print(f"ERROR: {results_file} not found")
        sys.exit(1)

    with open(results_file) as f:
        records = [json.loads(l) for l in f if l.strip()]

    print(f"Loaded {len(records)} records from {results_file}")

    updated = []
    skipped = 0
    computed = 0
    cd_vals, f1_vals, iou_vals = [], [], []
    tier_stats: dict[str, dict] = {}

    for rec in records:
        entry_id = rec["id"]
        tier = rec.get("tier", "?")

        # Skip if already has metrics
        if rec.get("metrics"):
            updated.append(rec)
            if m := rec["metrics"]:
                _accum(tier_stats, tier, m)
                cd_vals.append(m["chamfer_distance"])
                f1_vals.append(m["f1_score"])
                iou_vals.append(m["volumetric_iou"])
            continue

        stl_uri = rec.get("stl_artifact_uri")
        if not stl_uri or not rec.get("converged"):
            updated.append(rec)
            skipped += 1
            continue

        ref_stl = REF_STL_DIR / f"{entry_id}.stl"
        if not ref_stl.exists():
            print(f"  [{entry_id}] no reference STL — skipping")
            updated.append(rec)
            skipped += 1
            continue

        if not store.exists(stl_uri):
            print(f"  [{entry_id}] artifact not found: {stl_uri}")
            updated.append(rec)
            skipped += 1
            continue

        gen_stl = str(store.local_path(stl_uri))
        print(f"  [{entry_id}] computing metrics…", end=" ", flush=True)

        metrics = compute_mesh_metrics(
            generated_stl_path=gen_stl,
            reference_stl_path=str(ref_stl),
            normalize=args.normalize,
            use_icp=not args.no_icp,
        )

        if metrics:
            rec = {**rec, "metrics": metrics}
            _accum(tier_stats, tier, metrics)
            cd_vals.append(metrics["chamfer_distance"])
            f1_vals.append(metrics["f1_score"])
            iou_vals.append(metrics["volumetric_iou"])
            print(f"CD={metrics['chamfer_distance']:.4f}  "
                  f"F1={metrics['f1_score']:.4f}  "
                  f"IoU={metrics['volumetric_iou']:.4f}")
            computed += 1
        else:
            print("FAILED")
            skipped += 1

        updated.append(rec)

    # Write updated results
    out_file = exp_dir / "results_with_metrics.jsonl"
    with open(out_file, "w") as f:
        for r in updated:
            f.write(json.dumps(r) + "\n")

    # Print summary
    print(f"\n{'='*70}")
    print(f"EXPERIMENT: {args.experiment_name}")
    print(f"{'='*70}")
    print(f"Computed: {computed} | Skipped/no-ref: {skipped}")

    if cd_vals:
        print(f"\nOverall Metrics (n={len(cd_vals)}):")
        print(f"  CD  — median: {np.median(cd_vals):.4f}, mean: {np.mean(cd_vals):.4f}")
        print(f"  F1  — median: {np.median(f1_vals):.4f}, mean: {np.mean(f1_vals):.4f}")
        print(f"  IoU — median: {np.median(iou_vals):.4f}, mean: {np.mean(iou_vals):.4f}")

        print(f"\nPer-Tier:")
        print(f"  {'Tier':<6} {'n':>4} {'CD Med':>10} {'CD Mean':>10} {'F1 Med':>10} {'IoU Med':>10}")
        print(f"  {'-'*6} {'-'*4} {'-'*10} {'-'*10} {'-'*10} {'-'*10}")
        for tier in sorted(tier_stats.keys()):
            ts = tier_stats[tier]
            n = len(ts["cd"])
            if n == 0:
                continue
            print(f"  {tier:<6} {n:>4} "
                  f"{np.median(ts['cd']):>10.4f} "
                  f"{np.mean(ts['cd']):>10.4f} "
                  f"{np.median(ts['f1']):>10.4f} "
                  f"{np.median(ts['iou']):>10.4f}")

        # Gate check
        print(f"\n{'='*70}")
        print("PHASE 2 GATE CHECK (CADSmith baseline: CD mean ≤0.74, F1 med ≥0.9846, IoU med ≥0.9629)")
        cd_pass = np.mean(cd_vals) <= 0.74
        f1_pass = np.median(f1_vals) >= 0.9846
        iou_pass = np.median(iou_vals) >= 0.9629
        print(f"  CD  mean  {np.mean(cd_vals):.4f}  {'PASS ✓' if cd_pass else 'FAIL ✗'}")
        print(f"  F1  med   {np.median(f1_vals):.4f}  {'PASS ✓' if f1_pass else 'FAIL ✗'}")
        print(f"  IoU med   {np.median(iou_vals):.4f}  {'PASS ✓' if iou_pass else 'FAIL ✗'}")
        gate = cd_pass and f1_pass and iou_pass
        print(f"\n  GATE: {'PASSED' if gate else 'NOT PASSED'}")

        # Save summary
        summary = {
            "experiment": args.experiment_name,
            "n_with_metrics": len(cd_vals),
            "cd_median": float(np.median(cd_vals)),
            "cd_mean": float(np.mean(cd_vals)),
            "f1_median": float(np.median(f1_vals)),
            "f1_mean": float(np.mean(f1_vals)),
            "iou_median": float(np.median(iou_vals)),
            "iou_mean": float(np.mean(iou_vals)),
            "gate_passed": bool(gate),
            "per_tier": {
                t: {
                    "n": len(ts["cd"]),
                    "cd_median": float(np.median(ts["cd"])) if ts["cd"] else None,
                    "cd_mean": float(np.mean(ts["cd"])) if ts["cd"] else None,
                    "f1_median": float(np.median(ts["f1"])) if ts["f1"] else None,
                    "iou_median": float(np.median(ts["iou"])) if ts["iou"] else None,
                }
                for t, ts in tier_stats.items()
            },
        }
        summary_file = exp_dir / "metrics_summary.json"
        with open(summary_file, "w") as f:
            json.dump(summary, f, indent=2)
        print(f"\nResults : {out_file}")
        print(f"Summary : {summary_file}")


def _accum(tier_stats: dict, tier: str, m: dict) -> None:
    if tier not in tier_stats:
        tier_stats[tier] = {"cd": [], "f1": [], "iou": []}
    if m.get("chamfer_distance") is not None:
        tier_stats[tier]["cd"].append(m["chamfer_distance"])
        tier_stats[tier]["f1"].append(m["f1_score"])
        tier_stats[tier]["iou"].append(m["volumetric_iou"])


if __name__ == "__main__":
    main()
