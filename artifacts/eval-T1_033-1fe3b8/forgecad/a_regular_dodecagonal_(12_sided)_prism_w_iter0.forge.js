/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A regular dodecagonal (12-sided) prism with a circumscribed circle diameter of 50mm and a height of 10mm.
 * Workflow ID : eval-T1_033-1fe3b8
 * Trace ID    : b9bf1381-4e46-4fd5-a98d-02f447083bd4
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 50.0 × 50.0 × 10.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 2.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_033-1fe3b8/step/T1_033_outer0_attempt0.step
 *   STL    : artifact://eval-T1_033-1fe3b8/stl/T1_033_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Construct by creating a regular 12-sided polygon sketch centered at the origin, with vertices constrained to a circumscribed circle of diameter 50mm (radius 25mm). Extrude the sketch symmetrically or directionally to a height of 10mm.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Regular Dodecagonal (12-sided) Prism
 * 
 * This model defines a regular 12-sided prism by intersecting 6 rotated boxes.
 * The geometry is fully parametric, allowing adjustments to the circumscribed diameter and height.
 */

// Parameters
const circumscribed_diameter = Param.number("Circumscribed Diameter", 50, { min: 10, max: 200, unit: "mm" });
const height = Param.number("Height", 10, { min: 1, max: 100, unit: "mm" });

// Calculations for the regular dodecagon
// The distance across flat sides (inscribed diameter) is D_circumscribed * cos(15 degrees)
const cos15 = 0.965925826;
const inscribed_diameter = circumscribed_diameter * cos15;
const box_length = circumscribed_diameter * 1.2; // Oversized to ensure clean intersection corners

// Create 6 boxes rotated at 30-degree increments to form the 12-sided prism
const b0 = box(inscribed_diameter, box_length, height);
const b30 = box(inscribed_diameter, box_length, height).rotate([0, 0, 1], 30);
const b60 = box(inscribed_diameter, box_length, height).rotate([0, 0, 1], 60);
const b90 = box(inscribed_diameter, box_length, height).rotate([0, 0, 1], 90);
const b120 = box(inscribed_diameter, box_length, height).rotate([0, 0, 1], 120);
const b150 = box(inscribed_diameter, box_length, height).rotate([0, 0, 1], 150);

// Intersect all boxes to generate the final regular dodecagonal prism
const finalShape = b0
  .intersect(b30)
  .intersect(b60)
  .intersect(b90)
  .intersect(b120)
  .intersect(b150)
  .color("#5f87c6");

// Return the final assembly
return {
  "a-regular-dodecagonal-(12-sided)-prism-w": finalShape,
};
