"""
harness/runtime/forgecad_adapter.py
====================================
ForgeCAD handoff adapter — Phase 1 stub.

PRD §6.2: ``forgecad_emit`` generates editable ForgeCAD model code and
attaches previews, exports, and review notes.

Phase 1 reality: ForgeCAD is not a publicly available Python package.  This
adapter emits richly-annotated **CadQuery Python source** that is
engineer-ready:

  - Structured YAML-style header block with all metadata
  - Parametric variables section preserved and named
  - Export paths as comments (never calls cq.exporters — harness handles that)
  - Trace reference embedded so engineers can look up the full audit trail

When a real ForgeCAD SDK becomes available, this module is the only place
that needs to change.
"""

from __future__ import annotations

import textwrap
from typing import Optional

from harness.schema.primitives import PrimitivePlan


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------


def emit_forgecad_code(
    plan: PrimitivePlan,
    cadquery_code: str,
    *,
    trace_id: str,
    workflow_id: str,
    step_artifact_uri: Optional[str] = None,
    stl_artifact_uri: Optional[str] = None,
    render_artifact_uri: Optional[str] = None,
    iteration: int = 0,
) -> tuple[str, dict]:
    """
    Annotate ``cadquery_code`` with a structured header and return it as the
    "ForgeCAD model code" deliverable.

    Returns:
        (annotated_source: str, metadata: dict)
        ``metadata`` contains all fields needed for the handoff API response.
    """
    header = _build_header(
        plan=plan,
        trace_id=trace_id,
        workflow_id=workflow_id,
        step_artifact_uri=step_artifact_uri,
        stl_artifact_uri=stl_artifact_uri,
        render_artifact_uri=render_artifact_uri,
        iteration=iteration,
    )
    footer = _build_footer()
    annotated = f"{header}\n{cadquery_code}\n{footer}"

    metadata = {
        "workflow_id": workflow_id,
        "trace_id": trace_id,
        "design_name": plan.description,
        "iteration": iteration,
        "step_artifact_uri": step_artifact_uri,
        "stl_artifact_uri": stl_artifact_uri,
        "render_artifact_uri": render_artifact_uri,
        "components": plan.components,
        "acceptance_criteria": plan.acceptance_criteria.model_dump(),
        "forgecad_stub": True,  # Flag: real ForgeCAD SDK not yet integrated
    }

    return annotated, metadata


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _build_header(
    plan: PrimitivePlan,
    trace_id: str,
    workflow_id: str,
    step_artifact_uri: Optional[str],
    stl_artifact_uri: Optional[str],
    render_artifact_uri: Optional[str],
    iteration: int,
) -> str:
    """Build the structured header block prepended to the CadQuery source."""

    bbox = plan.dimensions.overall_bbox
    key_dims = plan.dimensions.key_dimensions

    # Format features list
    features_lines = ""
    for feat in plan.features:
        features_lines += (
            f"#     - [{feat.feature_type.value}] {feat.feature_id}: "
            f"{feat.description}"
        )
        if feat.count > 1:
            features_lines += f" (×{feat.count})"
        features_lines += "\n"
    if not features_lines:
        features_lines = "#     (no typed features in plan)\n"

    # Format key dimensions
    dim_lines = f"#     Overall envelope: {bbox.xlen}×{bbox.ylen}×{bbox.zlen} mm\n"
    for k, v in key_dims.items():
        dim_lines += f"#     {k}: {v} mm\n"

    # Format acceptance criteria
    ac = plan.acceptance_criteria

    header = f"""\
# ╔══════════════════════════════════════════════════════════════════════╗
# ║  GEOMETRY AGENT HARNESS — ForgeCAD Model Code                       ║
# ║  (Phase 1: annotated CadQuery — ForgeCAD SDK integration pending)   ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# Part Description : {plan.description}
# Workflow ID      : {workflow_id}
# Trace ID         : {trace_id}
# Iteration        : {iteration}
#
# ── Primitive Plan ───────────────────────────────────────────────────────
# Components:
#   {', '.join(plan.components) if plan.components else '(none listed)'}
#
# Typed Features:
{features_lines}#
# ── Dimensions ───────────────────────────────────────────────────────────
{dim_lines}#
# ── Acceptance Criteria ──────────────────────────────────────────────────
#   Volume error threshold : {ac.volume_error_threshold_pct}%
#   BBox IoU threshold     : {ac.bbox_iou_threshold}
#   Min F1 score           : {ac.min_f1_score}
#   Max Chamfer Distance   : {ac.max_chamfer_distance_mm} mm
#   Require watertight     : {ac.require_watertight}
#
# ── Export Artifacts ─────────────────────────────────────────────────────
#   STEP  : {step_artifact_uri or '(not yet exported)'}
#   STL   : {stl_artifact_uri or '(not yet exported)'}
#   Render: {render_artifact_uri or '(not yet rendered)'}
#
# ── Constraints ──────────────────────────────────────────────────────────
#   Symmetry             : {plan.constraints.symmetry.value}
#   Material             : {plan.constraints.material or 'not specified'}
#   Manufacturing process: {plan.constraints.manufacturing_process or 'not specified'}
#
# ── Notes ────────────────────────────────────────────────────────────────
#   {plan.notes or '(none)'}
#
# ─────────────────────────────────────────────────────────────────────────
# HOW TO USE THIS FILE
#   1. Verify parametric variables at the top match your target dimensions.
#   2. Run with `cadquery`: `python this_file.py` — assigns result to `result`.
#   3. Export: use cq.exporters.export(result, "output.step")
#   4. Full audit trail: look up trace_id in the artifact store.
# ─────────────────────────────────────────────────────────────────────────

"""
    return header


def _build_footer() -> str:
    return """

# ─────────────────────────────────────────────────────────────────────────
# END OF HARNESS-GENERATED FILE
# The `result` variable above contains the final CadQuery Workplane.
# Export example:
#   import cadquery as cq
#   cq.exporters.export(result, "output.step")
#   cq.exporters.export(result, "output.stl")
# ─────────────────────────────────────────────────────────────────────────
"""
