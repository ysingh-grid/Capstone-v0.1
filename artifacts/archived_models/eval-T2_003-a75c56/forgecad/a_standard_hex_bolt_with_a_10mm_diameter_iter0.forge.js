/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A standard hex bolt with a 10mm diameter cylindrical shaft and a hexagonal head on top, centered on the Z-axis.
 * Workflow ID : eval-T2_003-a75c56
 * Trace ID    : c0e950df-3bf9-4490-a020-501d73ff493d
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 19.6 × 19.6 × 37.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T2_003-a75c56/step/T2_003_outer0_attempt0.step
 *   STL    : artifact://eval-T2_003-a75c56/stl/T2_003_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the shaft starts at Z=0 and goes up to Z=30. The hexagonal head must sit on top of the shaft from Z=30 to Z=37. Both parts must be centered at X=0, Y=0. Use a regular 6-sided polygon extrusion for the hexagonal head.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: Hex Bolt
 * A standard hex bolt with a 10mm diameter cylindrical shaft and a hexagonal head.
 */

// Define parameters for the hex bolt
const shaftDiameter = Param.number("Shaft Diameter", 10.0, { min: 2, max: 50, unit: "mm" });
const shaftLength = Param.number("Shaft Length", 30.0, { min: 5, max: 200, unit: "mm" });
const headFlatToFlat = Param.number("Head Across Flats", 17.0, { min: 5, max: 100, unit: "mm" });
const headHeight = Param.number("Head Height", 7.0, { min: 2, max: 50, unit: "mm" });

// Calculate shaft radius
const shaftRadius = shaftDiameter / 2;

// Create the cylindrical shaft (centered on XY, extends from Z=0 to Z=shaftLength)
const shaft = cylinder(shaftLength, shaftRadius);

// Create the hexagonal head using intersection of three rotated boxes
const boxWidth = headFlatToFlat;
const boxDepth = headFlatToFlat * 1.5; // Ensure depth is wider than the circumscribed diameter

const box1 = box(boxWidth, boxDepth, headHeight);
const box2 = box(boxWidth, boxDepth, headHeight).rotate([0, 0, 1], 60);
const box3 = box(boxWidth, boxDepth, headHeight).rotate([0, 0, 1], 120);

// Intersect the boxes to form a perfect hexagon, then translate to the top of the shaft
const hexHead = box1.intersect(box2).intersect(box3).translate(0, 0, shaftLength);

// Union the shaft and head to form the complete bolt
const bolt = shaft.union(hexHead).color("#a0a0a0");

// Return the final assembly
return {
  "a-standard-hex-bolt-with-a-10mm-diameter": bolt,
};
