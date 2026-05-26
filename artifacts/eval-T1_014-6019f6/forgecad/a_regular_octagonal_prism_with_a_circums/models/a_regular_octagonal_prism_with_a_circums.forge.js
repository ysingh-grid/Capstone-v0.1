/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A regular octagonal prism with a circumscribed circle diameter of 40mm and a height of 15mm.
 * Workflow ID : eval-T1_014-6019f6
 * Trace ID    : 80d08c75-cfeb-43ea-9ac4-2c7135c49532
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 40.0 × 40.0 × 15.0 mm
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
 *   STEP   : artifact://eval-T1_014-6019f6/step/T1_014_outer0_attempt0.step
 *   STL    : artifact://eval-T1_014-6019f6/stl/T1_014_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create the octagon using 8 vertices distributed evenly on a circle of radius 20mm (angle steps of 45 degrees, starting at 0). Center the profile at (0,0) and extrude it symmetrically or from Z=0 to Z=15.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Regular Octagonal Prism
 * Generated for ForgeCAD Studio
 */

// Define parameters
const circumscribedDiameter = Param.number("Circumscribed Diameter", 40, { min: 5, max: 500, unit: "mm" });
const height = Param.number("Height", 15, { min: 1, max: 300, unit: "mm" });

// Calculate dimensions for the regular octagon
// An octagon can be constructed by intersecting 4 rotated boxes.
// The distance from the center to the flat edge (inscribed radius) is R * cos(22.5 deg).
const circumscribedRadius = circumscribedDiameter / 2;
const degToRad = Math.PI / 180;
const inscribedRadius = circumscribedRadius * Math.cos(22.5 * degToRad);
const boxWidth = inscribedRadius * 2;
const boxLength = circumscribedDiameter * 1.5; // Ensuring length is large enough to span the corners

// Create the 4 rotated boxes
const box0 = box(boxWidth, boxLength, height);
const box45 = box(boxWidth, boxLength, height).rotate([0, 0, 1], 45);
const box90 = box(boxWidth, boxLength, height).rotate([0, 0, 1], 90);
const box135 = box(boxWidth, boxLength, height).rotate([0, 0, 1], 135);

// Intersect the boxes to form the regular octagonal prism
const octagonalPrism = box0
  .intersect(box45)
  .intersect(box90)
  .intersect(box135)
  .color("#4a90e2");

// Return the final shape
return {
  "a-regular-octagonal-prism-with-a-circums": octagonalPrism,
};
