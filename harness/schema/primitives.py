"""
harness/schema/primitives.py
============================
Typed Pydantic v2 schema for the Geometry Agent Runtime primitive plan.

PRD §6.3: Every ``primitive_plan`` output must be validated against a typed
schema before any geometry tool execution is triggered.  Schema failures must
produce an explicit error, not degraded execution.

CADSmith baseline: the Planner agent (``agents.py``) emits an unstructured
JSON dict.  This module formalizes that dict into a validated schema.
"""

from __future__ import annotations

import json
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field, model_validator


# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------


class FeatureType(str, Enum):
    """Typed CAD feature vocabulary (PRD §4.2)."""

    hole = "hole"
    rib = "rib"
    mounting_plate = "mounting_plate"
    fillet = "fillet"
    chamfer = "chamfer"
    clearance = "clearance"
    mate = "mate"
    fastener_pattern = "fastener_pattern"
    extrusion = "extrusion"
    revolution = "revolution"
    loft = "loft"
    sweep = "sweep"
    shell = "shell"
    counterbore = "counterbore"
    countersink = "countersink"
    pocket = "pocket"
    boss = "boss"
    rib_pattern = "rib_pattern"
    envelope = "envelope"
    cut = "cut"
    union = "union"
    intersection = "intersection"
    other = "other"  # catch-all; must include a description


class SymmetryType(str, Enum):
    none = "none"
    bilateral = "bilateral"
    rotational = "rotational"
    mirror = "mirror"


# ---------------------------------------------------------------------------
# Sub-models
# ---------------------------------------------------------------------------


class BoundingBox(BaseModel):
    """Overall envelope of the part in mm."""

    xlen: float = Field(gt=0, description="Length along X axis (mm)")
    ylen: float = Field(gt=0, description="Length along Y axis (mm)")
    zlen: float = Field(gt=0, description="Length along Z axis (mm)")


class DimensionMap(BaseModel):
    """Named key dimensions extracted from the prompt (mm or count)."""

    overall_bbox: BoundingBox
    key_dimensions: dict[str, float] = Field(
        default_factory=dict,
        description="Named engineering dimensions, e.g. {'wall_thickness': 3.0}",
    )


class PrimitiveFeature(BaseModel):
    """One typed CAD feature in the primitive plan."""

    feature_id: str = Field(description="Unique identifier within the plan, e.g. 'hole_1'")
    feature_type: FeatureType
    description: str = Field(description="Human-readable description of this feature")
    dimensions: dict[str, float] = Field(
        default_factory=dict,
        description="Numeric parameters (mm), e.g. {'diameter': 5.0, 'depth': 10.0}",
    )
    position: Optional[dict[str, float]] = Field(
        default=None,
        description="Placement relative to part origin (mm), e.g. {'x': 8.0, 'y': 8.0, 'z': 0.0}",
    )
    count: int = Field(default=1, ge=1, description="Number of instances (e.g. 4 holes)")
    pattern: Optional[str] = Field(
        default=None,
        description="Placement pattern description, e.g. 'corners at 8mm from edges'",
    )
    manufacturability_notes: Optional[str] = Field(
        default=None,
        description="DFM constraints or warnings for this feature",
    )

    @model_validator(mode="after")
    def validate_other_has_description(self) -> "PrimitiveFeature":
        if self.feature_type == FeatureType.other and not self.description:
            raise ValueError("Features of type 'other' must include a description.")
        return self


class ConstraintSpec(BaseModel):
    """Engineering constraints extracted from the prompt."""

    volume_estimate_mm3: Optional[float] = Field(
        default=None, gt=0, description="Estimated part volume (mm³)"
    )
    num_holes: Optional[int] = Field(default=None, ge=0)
    hole_diameter_mm: Optional[float] = Field(default=None, gt=0)
    symmetry: SymmetryType = SymmetryType.none
    material: Optional[str] = Field(default=None, description="e.g. 'aluminum 6061'")
    manufacturing_process: Optional[str] = Field(
        default=None, description="e.g. 'CNC milling', 'FDM 3D printing'"
    )
    additional: dict[str, Any] = Field(
        default_factory=dict,
        description="Any extra constraints not covered above",
    )


class AcceptanceCriteria(BaseModel):
    """
    Pass/fail thresholds used by the Verifier Worker (PRD §4.1).

    CADSmith baseline: Planner emits ``volume_error_threshold_pct`` and
    ``bbox_iou_threshold`` directly.  These are preserved and extended.
    """

    volume_error_threshold_pct: float = Field(
        default=5.0, ge=0, le=100,
        description="Max % deviation in volume vs. estimate before FAIL",
    )
    bbox_iou_threshold: float = Field(
        default=0.90, ge=0.0, le=1.0,
        description="Min bounding-box IoU before FAIL",
    )
    min_f1_score: float = Field(
        default=0.95, ge=0.0, le=1.0,
        description="Min surface F1 score (from metrics.py baseline 0.9846)",
    )
    max_chamfer_distance_mm: float = Field(
        default=2.0, ge=0.0,
        description="Max mean Chamfer Distance in mm (CADSmith full-pipeline target: 0.74)",
    )
    require_watertight: bool = Field(
        default=True,
        description="Reject geometry that is not watertight",
    )


# ---------------------------------------------------------------------------
# Top-level PrimitivePlan
# ---------------------------------------------------------------------------


class PrimitivePlan(BaseModel):
    """
    The typed primitive plan produced by the Planning Worker.

    This is the gate between planning and geometry execution.  All fields
    must be valid before ``solid_generate`` or any other geometry primitive
    is called (PRD §6.3).
    """

    # Metadata
    description: str = Field(description="Brief summary of the part")
    components: list[str] = Field(
        default_factory=list,
        description="High-level sub-components, e.g. ['base plate', 'mounting ears']",
    )

    # Geometry
    dimensions: DimensionMap
    features: list[PrimitiveFeature] = Field(
        default_factory=list,
        description="Ordered list of typed primitive features",
    )

    # Constraints and criteria
    constraints: ConstraintSpec = Field(default_factory=ConstraintSpec)
    acceptance_criteria: AcceptanceCriteria = Field(default_factory=AcceptanceCriteria)

    # Pass-through notes for the Coder agent
    notes: str = Field(
        default="",
        description="Special construction notes for the Coder agent",
    )

    # Ambiguity flag
    ambiguous: bool = Field(
        default=False,
        description="True when the Planner could not fully resolve the prompt; "
                    "triggers human clarification before execution",
    )
    ambiguity_questions: list[str] = Field(
        default_factory=list,
        description="Questions to resolve when ambiguous=True",
    )

    def to_cadsmith_dict(self) -> dict:
        """
        Serialize back to the flat dict format expected by CADSmith's
        ``agents.generate_code()`` and ``agents.refine_geometry()``.

        This preserves full backward-compatibility with the CADSmith agent chain.
        """
        return {
            "description": self.description,
            "components": self.components,
            "dimensions": {
                "overall_bbox": self.dimensions.overall_bbox.model_dump(),
                "key_dimensions": self.dimensions.key_dimensions,
            },
            "constraints": {
                "volume_estimate": self.constraints.volume_estimate_mm3,
                "num_holes": self.constraints.num_holes,
                "hole_diameter": self.constraints.hole_diameter_mm,
                "symmetry": self.constraints.symmetry.value,
            },
            "acceptance_criteria": {
                "volume_error_threshold_pct": self.acceptance_criteria.volume_error_threshold_pct,
                "bbox_iou_threshold": self.acceptance_criteria.bbox_iou_threshold,
            },
            "notes": self.notes,
        }


# ---------------------------------------------------------------------------
# Validation entry point
# ---------------------------------------------------------------------------


class SchemaValidationError(ValueError):
    """Raised when a Planner output cannot be coerced into PrimitivePlan."""

    def __init__(self, message: str, raw_dict: dict | None = None):
        super().__init__(message)
        self.raw_dict = raw_dict


def validate_plan(raw_dict: dict) -> PrimitivePlan:
    """
    Validate the Planner agent's raw output dict against the PrimitivePlan schema.

    Raises ``SchemaValidationError`` (not a silent degraded execution) on any
    field-level validation failure.  Callers must handle this before triggering
    any geometry tool.

    CADSmith compatibility layer: the Planner emits a flat dict without a
    ``features`` list.  This function synthesises a minimal feature list from
    the flat constraint fields so the schema is populated even for raw
    CADSmith-style output.
    """
    from pydantic import ValidationError

    # ── CADSmith compat: synthesise features from flat constraint fields ──
    enriched = dict(raw_dict)

    if "features" not in enriched:
        enriched["features"] = _infer_features_from_cadsmith_plan(raw_dict)

    # Ensure nested structure is present
    if "dimensions" in enriched and "overall_bbox" not in enriched.get("dimensions", {}):
        dims = enriched["dimensions"]
        if "overall_bbox" not in dims:
            # CADSmith Planner puts bbox directly under 'dimensions'
            # Try to lift it
            dims["overall_bbox"] = {
                k: dims.get(k, 1.0)
                for k in ("xlen", "ylen", "zlen")
            }

    try:
        return PrimitivePlan.model_validate(enriched)
    except ValidationError as exc:
        raise SchemaValidationError(
            f"Primitive plan failed schema validation: {exc}",
            raw_dict=raw_dict,
        ) from exc


def _infer_features_from_cadsmith_plan(raw: dict) -> list[dict]:
    """
    Best-effort feature inference for raw CADSmith Planner output.

    CADSmith's Planner does not emit a features list; this function creates a
    minimal one from the ``constraints`` section so downstream agents have a
    typed feature reference.
    """
    features: list[dict] = []
    constraints = raw.get("constraints", {})

    num_holes = constraints.get("num_holes")
    hole_diameter = constraints.get("hole_diameter")

    if num_holes and hole_diameter:
        features.append({
            "feature_id": "hole_group_1",
            "feature_type": "hole",
            "description": f"{num_holes} hole(s) of diameter {hole_diameter} mm",
            "dimensions": {"diameter": float(hole_diameter)},
            "count": int(num_holes),
        })

    return features
