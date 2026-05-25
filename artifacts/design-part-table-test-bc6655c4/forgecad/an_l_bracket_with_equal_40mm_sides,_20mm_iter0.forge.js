/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : An L-bracket with equal 40mm sides, 20mm width, and 5mm thickness.
 * Workflow ID : design-part-table-test-bc6655c4
 * Trace ID    : fb891d57-2a84-4ee6-b6e8-4db24d1c9c07
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 40.0 × 20.0 × 40.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://design-part-table-test-bc6655c4/step/part-table-test_outer0_attempt0.step
 *   STL    : artifact://design-part-table-test-bc6655c4/stl/part-table-test_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The bracket can be modeled either by extruding an L-shaped profile of 40mm x 40mm outer dimensions with 5mm thickness by a distance of 20mm, or by joining two perpendicular legs (one 40x20x5mm and one 35x20x5mm) to avoid overlapping volume.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

const side1 = Param.number("Side 1 Length", 40, { min: 10, max: 200, unit: "mm" });
const side2 = Param.number("Side 2 Length", 40, { min: 10, max: 200, unit: "mm" });
const thickness = Param.number("Thickness", 5, { min: 1, max: 50, unit: "mm" });
const width = Param.number("Width", 20, { min: 5, max: 100, unit: "mm" });

// Create the horizontal leg of the L-bracket (centered on XY, extends +Z)
const horizontalLeg = box(side1, width, thickness);

// Calculate dimensions for the vertical leg to avoid overlapping volume
const vertHeight = side2 - thickness;
const vertXOffset = -side1 / 2 + thickness / 2;

// Create and position the vertical leg
const verticalLeg = box(thickness, width, vertHeight)
  .translate(vertXOffset, 0, thickness);

// Combine both legs into a single solid bracket
const bracket = horizontalLeg.union(verticalLeg).color("#5f87c6");

// Return the final assembly
return {
  "an-l-bracket-with-equal-40mm-sides,-20mm": bracket
};
