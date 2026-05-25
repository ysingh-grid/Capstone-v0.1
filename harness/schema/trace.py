"""
harness/schema/trace.py
=======================
Pydantic v2 models for the Geometry Agent Runtime trace artifact.

PRD §9.2: The Geometry Runtime must record primitive calls, parameters,
measurements, renders, mesh diagnostics, repair attempts, and verifier
scores as trace artifacts external to Temporal.

PRD §14.4: The trace must support classification against the seven-category
failure taxonomy.

CADSmith baseline: ``scripts/analyze_results.py`` and ``metrics.py`` result
bundles prototype what a trace artifact contains.  This module formalizes
and extends those fields for the production harness.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Failure taxonomy (PRD §14.4 — exactly seven categories)
# ---------------------------------------------------------------------------


class FailureCategory(str, Enum):
    """
    Seven failure categories (PRD §14.4).

    Every failed execution must be tagged with exactly one of these.
    Category 7 is derived from the CADSmith T3_019 drone-frame near-miss.
    """

    primitive_gap = "primitive_gap"
    """Planner could not represent the required feature in the primitive schema."""

    geometry_invalidity = "geometry_invalidity"
    """CadQuery / OCCT produced a non-watertight or self-intersecting solid."""

    visual_mismatch = "visual_mismatch"
    """Rendered views do not match the intent even though kernel metrics are borderline."""

    translation_drift = "translation_drift"
    """ForgeCAD / STEP export diverges measurably from the accepted CadQuery solid."""

    verifier_miss = "verifier_miss"
    """Verifier passed an output that a human reviewer later identified as wrong."""

    user_ambiguity = "user_ambiguity"
    """The prompt was underspecified; the agent could not proceed without clarification."""

    near_miss_fixed_view_blind_spot = "near_miss_fixed_view_blind_spot"
    """
    Geometry passed all checks but contained defects invisible to fixed
    three-view rendering (e.g., small arm-hub gaps in T3_019 drone frame).
    """


# ---------------------------------------------------------------------------
# Geometry evidence (OCCT kernel + MeshLib stub)
# ---------------------------------------------------------------------------


class BoundingBoxEvidence(BaseModel):
    xmin: float
    xmax: float
    xlen: float
    ymin: float
    ymax: float
    ylen: float
    zmin: float
    zmax: float
    zlen: float


class GeometryEvidence(BaseModel):
    """
    Deterministic geometry measurements from the OCCT kernel (PRD §4.3).

    CADSmith baseline: ``executor.py`` already extracts these fields.
    MeshLib-extended fields are nullable; they will be populated in Phase 2.
    """

    # OCCT kernel measurements (from executor.py)
    volume_mm3: Optional[float] = None
    center_of_mass: Optional[tuple[float, float, float]] = None
    bounding_box: Optional[BoundingBoxEvidence] = None
    is_valid: Optional[bool] = None
    num_faces: Optional[int] = None
    num_edges: Optional[int] = None
    num_vertices: Optional[int] = None

    # MeshLib-extended measurements (Phase 2)
    is_watertight: Optional[bool] = None
    has_self_intersections: Optional[bool] = None
    mesh_defect_count: Optional[int] = None
    proximity_clearance_mm: Optional[float] = None
    normals_consistent: Optional[bool] = None
    volume_drift_pct: Optional[float] = None

    @classmethod
    def from_cadsmith_geometry_json(cls, geometry_json: dict) -> "GeometryEvidence":
        """
        Construct from the geometry_json dict produced by ``executor.py``.
        """
        bb_raw = geometry_json.get("bounding_box", {})
        bb = BoundingBoxEvidence(**bb_raw) if bb_raw else None
        com = geometry_json.get("center_of_mass")
        return cls(
            volume_mm3=geometry_json.get("volume"),
            center_of_mass=tuple(com) if com else None,
            bounding_box=bb,
            is_valid=geometry_json.get("is_valid"),
            num_faces=geometry_json.get("num_faces"),
            num_edges=geometry_json.get("num_edges"),
            num_vertices=geometry_json.get("num_vertices"),
        )


# ---------------------------------------------------------------------------
# Verifier score (from metrics.py model)
# ---------------------------------------------------------------------------


class VerifierScore(BaseModel):
    """
    Geometry quality metrics (PRD §11.3) and judge decision.

    CADSmith baseline: ``metrics.py`` computes CD, F1, IoU for benchmark runs.
    In the harness, the Judge (Claude Opus) returns pass/feedback; CD/F1/IoU
    are computed post-hoc when reference geometry is available.
    """

    passed: bool
    feedback: str = ""

    # Geometry quality metrics (nullable until reference STL comparison is available)
    chamfer_distance_mean_mm: Optional[float] = None
    chamfer_distance_median_mm: Optional[float] = None
    f1_score: Optional[float] = None
    iou_volumetric: Optional[float] = None

    # Evidence artifacts
    render_artifact_uri: Optional[str] = None
    failure_category: Optional[FailureCategory] = None


# ---------------------------------------------------------------------------
# Repair actions
# ---------------------------------------------------------------------------


class RepairAction(BaseModel):
    """One repair attempt within an inner or outer loop iteration."""

    loop: str = Field(description="'inner' (error fix) or 'outer' (geometry refinement)")
    attempt_number: int
    error_or_feedback: str
    error_type: Optional[str] = None
    fix_applied: str = Field(description="Brief description of the fix or new code produced")
    success: bool


# ---------------------------------------------------------------------------
# Per-iteration record
# ---------------------------------------------------------------------------


class IterationRecord(BaseModel):
    """Complete record for one iteration of the pipeline loop."""

    iteration_number: int
    iteration_type: str = Field(
        description="'initial', 'inner_error_fix', 'outer_geometric_refinement', 'error_fix_exhausted'"
    )
    cadquery_code_lines: int = 0
    execution_time_ms: Optional[float] = None
    execution_success: bool = False
    geometry_evidence: Optional[GeometryEvidence] = None
    repair_actions: list[RepairAction] = Field(default_factory=list)
    verifier_score: Optional[VerifierScore] = None
    render_artifact_uri: Optional[str] = None
    step_artifact_uri: Optional[str] = None
    stl_artifact_uri: Optional[str] = None
    passed: bool = False


# ---------------------------------------------------------------------------
# Top-level TraceArtifact
# ---------------------------------------------------------------------------


class TraceArtifact(BaseModel):
    """
    The complete execution trace for one design workflow run.

    PRD §9.2: Every execution, success or failure, must produce a trace.
    100% trace coverage is a hard requirement (PRD §11.2, §15.5).
    """

    # Identity
    trace_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workflow_id: str
    design_name: str
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    # Input
    prompt: str
    project_context: Optional[str] = None
    rubric: Optional[str] = None

    # Plan
    primitive_plan_summary: Optional[str] = None
    plan_ambiguous: bool = False
    plan_ambiguity_questions: list[str] = Field(default_factory=list)

    # Execution history
    iterations: list[IterationRecord] = Field(default_factory=list)

    # Final outcome
    converged: bool = False
    total_iterations: int = 0
    total_llm_calls: int = 0
    total_time_ms: float = 0.0

    # Final artifacts
    final_step_artifact_uri: Optional[str] = None
    final_stl_artifact_uri: Optional[str] = None
    final_render_artifact_uri: Optional[str] = None
    final_forgecad_artifact_uri: Optional[str] = None
    final_geometry_evidence: Optional[GeometryEvidence] = None
    final_verifier_score: Optional[VerifierScore] = None

    # Outcome labels (PRD §14.2)
    first_pass_success: bool = False
    inner_loop_total_attempts: int = 0
    outer_loop_total_iterations: int = 0
    failure_category: Optional[FailureCategory] = None
    failure_reason: Optional[str] = None
    human_approval_decision: Optional[str] = None  # 'approved', 'rejected', 'changes_requested'
    export_ready: bool = False

    # Regression metadata
    dataset_tier: Optional[str] = None  # 't1_primitives', 't2_engineering_parts', 't3_complex_parts'
    dataset_entry_id: Optional[str] = None

    def to_json(self) -> str:
        """Serialize to JSON string for artifact store persistence."""
        return self.model_dump_json(indent=2)

    @classmethod
    def from_json(cls, json_str: str) -> "TraceArtifact":
        return cls.model_validate_json(json_str)

    def summary_dict(self) -> dict[str, Any]:
        """
        Compact summary dict suitable for Temporal Query responses and API status
        endpoints (PRD §9.3).  Does not embed full iteration records.
        """
        return {
            "trace_id": self.trace_id,
            "workflow_id": self.workflow_id,
            "design_name": self.design_name,
            "converged": self.converged,
            "total_iterations": self.total_iterations,
            "total_llm_calls": self.total_llm_calls,
            "total_time_ms": self.total_time_ms,
            "first_pass_success": self.first_pass_success,
            "inner_loop_total_attempts": self.inner_loop_total_attempts,
            "outer_loop_total_iterations": self.outer_loop_total_iterations,
            "failure_category": self.failure_category,
            "failure_reason": self.failure_reason,
            "human_approval_decision": self.human_approval_decision,
            "export_ready": self.export_ready,
            "final_step_artifact_uri": self.final_step_artifact_uri,
            "final_stl_artifact_uri": self.final_stl_artifact_uri,
            "final_render_artifact_uri": self.final_render_artifact_uri,
            "final_forgecad_artifact_uri": self.final_forgecad_artifact_uri,
            "verifier_score": (
                self.final_verifier_score.model_dump()
                if self.final_verifier_score
                else None
            ),
        }
