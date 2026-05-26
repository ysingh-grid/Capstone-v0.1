/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A regular pentagonal prism with a circumscribed circle diameter of 25mm and a height of 40mm.
 * Workflow ID : eval-T1_018-b17d13
 * Trace ID    : 173924aa-d181-400d-ba6f-9ebb98b57074
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 23.78 × 22.61 × 40.0 mm
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
 *   STEP   : artifact://eval-T1_018-b17d13/step/T1_018_outer0_attempt0.step
 *   STL    : artifact://eval-T1_018-b17d13/stl/T1_018_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The base of the prism is a regular pentagon circumscribed by a circle of diameter 25mm. The vertices of the pentagon can be calculated using polar coordinates with spacing of 72 degrees. Extrude this sketch along the Z-axis by 40mm.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Regular Pentagonal Prism
 * A pentagonal prism with a circumscribed circle diameter of 25mm and a height of 40mm.
 */

// Define parameters for the pentagonal prism
const diameter = Param.number("Circumscribed Diameter", 25.0, { min: 5, max: 200, unit: "mm" });
const height = Param.number("Height", 40.0, { min: 5, max: 300, unit: "mm" });

// Calculate geometric constants for the pentagon
const radius = diameter / 2;
const apothem = radius * Math.cos(36 * Math.PI / 180);

// Use a large bounding size for the half-space boxes to ensure complete intersection
const boxSize = diameter * 3;

// Create the 5 half-space boxes, translated so their top edge aligns with the apothem distance
const b0 = box(boxSize, boxSize, height).translate(0, apothem - boxSize / 2, 0);
const b1 = box(boxSize, boxSize, height).translate(0, apothem - boxSize / 2, 0).rotate([0, 0, 1], 72);
const b2 = box(boxSize, boxSize, height).translate(0, apothem - boxSize / 2, 0).rotate([0, 0, 1], 144);
const b3 = box(boxSize, boxSize, height).translate(0, apothem - boxSize / 2, 0).rotate([0, 0, 1], 216);
const b4 = box(boxSize, boxSize, height).translate(0, apothem - boxSize / 2, 0).rotate([0, 0, 1], 288);

// Intersect the 5 half-spaces to produce a clean regular pentagonal prism
const pentagonalPrism = b0
  .intersect(b1)
  .intersect(b2)
  .intersect(b3)
  .intersect(b4)
  .color("#5f87c6");

// Return the final model
return {
  "a-regular-pentagonal-prism-with-a-circum": pentagonalPrism
};
