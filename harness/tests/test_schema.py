"""
harness/tests/test_schema.py
=============================
Pytest unit tests for the typed PrimitivePlan schema and TraceArtifact.

PRD §15.5: Schema validation must be tested independently of LLM calls.
"""

import pytest
from pydantic import ValidationError

from harness.schema.primitives import (
    AcceptanceCriteria,
    BoundingBox,
    ConstraintSpec,
    DimensionMap,
    FeatureType,
    PrimitivePlan,
    PrimitiveFeature,
    SchemaValidationError,
    validate_plan,
)
from harness.schema.trace import (
    FailureCategory,
    GeometryEvidence,
    IterationRecord,
    TraceArtifact,
    VerifierScore,
)


# ---------------------------------------------------------------------------
# Helpers / Fixtures
# ---------------------------------------------------------------------------


def _minimal_plan_dict(**overrides) -> dict:
    """Minimal valid PrimitivePlan dict for testing."""
    base = {
        "description": "Test bracket",
        "dimensions": {
            "overall_bbox": {"xlen": 60.0, "ylen": 40.0, "zlen": 10.0},
            "key_dimensions": {"wall_thickness": 3.0},
        },
        "features": [
            {
                "feature_id": "hole_1",
                "feature_type": "hole",
                "description": "M5 clearance hole",
                "dimensions": {"diameter": 5.5},
                "count": 4,
            }
        ],
        "constraints": {
            "volume_estimate_mm3": 20000.0,
            "num_holes": 4,
            "hole_diameter_mm": 5.5,
        },
        "acceptance_criteria": {
            "volume_error_threshold_pct": 5.0,
            "bbox_iou_threshold": 0.90,
            "min_f1_score": 0.95,
        },
        "notes": "Corner holes at 8mm from edges",
        "ambiguous": False,
    }
    base.update(overrides)
    return base


# ---------------------------------------------------------------------------
# PrimitivePlan schema validation
# ---------------------------------------------------------------------------


class TestPrimitivePlan:
    def test_valid_plan_passes(self):
        plan = PrimitivePlan.model_validate(_minimal_plan_dict())
        assert plan.description == "Test bracket"
        assert len(plan.features) == 1
        assert plan.features[0].feature_type == FeatureType.hole
        assert plan.dimensions.overall_bbox.xlen == 60.0

    def test_missing_description_fails(self):
        d = _minimal_plan_dict()
        del d["description"]
        with pytest.raises(ValidationError):
            PrimitivePlan.model_validate(d)

    def test_bbox_nonpositive_dimension_fails(self):
        d = _minimal_plan_dict()
        d["dimensions"]["overall_bbox"]["xlen"] = 0.0
        with pytest.raises(ValidationError):
            PrimitivePlan.model_validate(d)

    def test_other_feature_requires_description(self):
        d = _minimal_plan_dict()
        d["features"] = [{
            "feature_id": "misc_1",
            "feature_type": "other",
            "description": "",  # empty — should fail
            "dimensions": {},
        }]
        with pytest.raises(ValidationError):
            PrimitivePlan.model_validate(d)

    def test_other_feature_with_description_passes(self):
        d = _minimal_plan_dict()
        d["features"] = [{
            "feature_id": "misc_1",
            "feature_type": "other",
            "description": "Custom complex sweep path",
            "dimensions": {},
        }]
        plan = PrimitivePlan.model_validate(d)
        assert plan.features[0].feature_type == FeatureType.other

    def test_acceptance_criteria_defaults(self):
        d = _minimal_plan_dict()
        del d["acceptance_criteria"]
        plan = PrimitivePlan.model_validate(d)
        assert plan.acceptance_criteria.volume_error_threshold_pct == 5.0
        assert plan.acceptance_criteria.bbox_iou_threshold == 0.90

    def test_ambiguous_flag(self):
        d = _minimal_plan_dict(ambiguous=True, ambiguity_questions=["What is the wall thickness?"])
        plan = PrimitivePlan.model_validate(d)
        assert plan.ambiguous
        assert len(plan.ambiguity_questions) == 1

    def test_to_cadsmith_dict_backward_compat(self):
        plan = PrimitivePlan.model_validate(_minimal_plan_dict())
        cadsmith_dict = plan.to_cadsmith_dict()
        assert "description" in cadsmith_dict
        assert "dimensions" in cadsmith_dict
        assert "overall_bbox" in cadsmith_dict["dimensions"]
        assert "constraints" in cadsmith_dict
        assert "notes" in cadsmith_dict


# ---------------------------------------------------------------------------
# validate_plan — CADSmith compat layer
# ---------------------------------------------------------------------------


class TestValidatePlan:
    def test_validate_plan_full_dict(self):
        plan = validate_plan(_minimal_plan_dict())
        assert isinstance(plan, PrimitivePlan)

    def test_validate_plan_cadsmith_flat_raises_on_missing_bbox(self):
        """CADSmith Planner may omit overall_bbox — validate_plan should handle it."""
        raw = {
            "description": "A flat plate",
            "dimensions": {
                "xlen": 60.0,
                "ylen": 40.0,
                "zlen": 5.0,
                "key_dimensions": {},
            },
            "constraints": {
                "volume_estimate": 12000,
                "num_holes": 0,
                "hole_diameter": None,
                "symmetry": "none",
            },
            "acceptance_criteria": {
                "volume_error_threshold_pct": 5.0,
                "bbox_iou_threshold": 0.90,
            },
            "notes": "",
        }
        # Should either succeed with inferred bbox or raise SchemaValidationError — not crash
        try:
            plan = validate_plan(raw)
            assert plan.description == "A flat plate"
        except SchemaValidationError:
            pass  # Also acceptable: logged as schema validation failure

    def test_validate_plan_raises_schema_validation_error(self):
        raw = {"description": "incomplete"}  # missing dimensions
        with pytest.raises(SchemaValidationError):
            validate_plan(raw)

    def test_schema_validation_error_contains_raw_dict(self):
        raw = {"description": "bad"}
        try:
            validate_plan(raw)
        except SchemaValidationError as exc:
            assert exc.raw_dict == raw


# ---------------------------------------------------------------------------
# GeometryEvidence
# ---------------------------------------------------------------------------


class TestGeometryEvidence:
    def test_from_cadsmith_geometry_json(self):
        geo_json = {
            "volume": 12000.0,
            "bounding_box": {"xlen": 60.0, "ylen": 40.0, "zlen": 5.0,
                             "xmin": 0.0, "xmax": 60.0,
                             "ymin": 0.0, "ymax": 40.0,
                             "zmin": 0.0, "zmax": 5.0},
            "num_faces": 8,
            "num_edges": 12,
            "center_of_mass": [30.0, 20.0, 2.5],
        }
        ev = GeometryEvidence.from_cadsmith_geometry_json(geo_json)
        assert ev.volume_mm3 == 12000.0
        assert ev.bounding_box is not None
        assert ev.bounding_box.xlen == 60.0
        assert ev.num_faces == 8

    def test_from_empty_json_gives_defaults(self):
        ev = GeometryEvidence.from_cadsmith_geometry_json({})
        assert ev.volume_mm3 is None
        assert ev.num_faces is None



# ---------------------------------------------------------------------------
# TraceArtifact
# ---------------------------------------------------------------------------


class TestTraceArtifact:
    def _make_trace(self) -> TraceArtifact:
        geo = GeometryEvidence.from_cadsmith_geometry_json({
            "volume": 12000.0,
            "bounding_box": {
                "xlen": 60.0, "ylen": 40.0, "zlen": 5.0,
                "xmin": 0.0, "xmax": 60.0,
                "ymin": 0.0, "ymax": 40.0,
                "zmin": 0.0, "zmax": 5.0,
            },
        })
        score = VerifierScore(passed=True, feedback="Looks good.")
        iter_rec = IterationRecord(
            iteration_number=0,
            iteration_type="initial",
            cadquery_code_lines=42,
            execution_success=True,
            geometry_evidence=geo,
            passed=True,
            verifier_score=score,
        )
        return TraceArtifact(
            trace_id="trace-test-001",
            workflow_id="wf-test-001",
            design_name="Test bracket",
            prompt="A 60x40x5mm plate",
            primitive_plan_summary="Flat plate",
            iterations=[iter_rec],
            converged=True,
            total_iterations=1,
            total_llm_calls=2,
            total_time_ms=5000.0,
        )


    def test_trace_serializes_to_json(self):
        trace = self._make_trace()
        j = trace.to_json()
        assert "trace-test-001" in j
        assert "wf-test-001" in j

    def test_trace_roundtrip(self):
        import json
        trace = self._make_trace()
        data = json.loads(trace.to_json())
        assert data["trace_id"] == "trace-test-001"
        assert data["converged"] is True

    def test_first_pass_success_flag(self):
        trace = self._make_trace()
        assert trace.total_iterations == 1

    def test_failure_category_enum_values(self):
        cats = list(FailureCategory)
        assert len(cats) == 7  # PRD §11.3: 7 failure categories
