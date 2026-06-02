/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A solid cylindrical dowel pin centered at the origin along the Z-axis with 1mm 45-degree chamfers on both ends.
 * Workflow ID : eval-T2_011-80c5fb
 * Trace ID    : d0fa616b-5763-45e3-b950-6c9768e98a26
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 8.0 × 8.0 × 40.0 mm
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
 *   STEP   : artifact://eval-T2_011-80c5fb/step/T2_011_outer0_attempt0.step
 *   STL    : artifact://eval-T2_011-80c5fb/stl/T2_011_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The part must be centered at the origin (0, 0, 0), meaning it spans from Z = -20mm to Z = 20mm, and X/Y span from -4mm to 4mm. Apply the chamfers precisely to the top and bottom circular rims.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: Solid Cylindrical Dowel Pin
 * Centered at the origin along the Z-axis with 45-degree chamfers on both ends.
 */

// Define parameters for the dowel pin
const diameter = Param.number("Diameter", 8.0, { min: 2.0, max: 50.0, unit: "mm" });
const length = Param.number("Length", 40.0, { min: 5.0, max: 200.0, unit: "mm" });
const chamferWidth = Param.number("Chamfer Width", 1.0, { min: 0.1, max: 5.0, unit: "mm" });

// Calculate helper dimensions
const radius = diameter / 2;
const centerLength = length - (2 * chamferWidth);
const stepHeight = chamferWidth / 3;

// Create the main central cylindrical body, centered on Z-axis
const body = cylinder(centerLength, radius).translate(0, 0, -centerLength / 2);

// Create three-step micro-cylinders to approximate the top 45-degree chamfer
const topStep1 = cylinder(stepHeight, radius - (0.167 * chamferWidth)).translate(0, 0, centerLength / 2);
const topStep2 = cylinder(stepHeight, radius - (0.5 * chamferWidth)).translate(0, 0, (centerLength / 2) + stepHeight);
const topStep3 = cylinder(stepHeight, radius - (0.833 * chamferWidth)).translate(0, 0, (centerLength / 2) + (2 * stepHeight));

// Create three-step micro-cylinders to approximate the bottom 45-degree chamfer
const bottomStep1 = cylinder(stepHeight, radius - (0.167 * chamferWidth)).translate(0, 0, (-centerLength / 2) - stepHeight);
const bottomStep2 = cylinder(stepHeight, radius - (0.5 * chamferWidth)).translate(0, 0, (-centerLength / 2) - (2 * stepHeight));
const bottomStep3 = cylinder(stepHeight, radius - (0.833 * chamferWidth)).translate(0, 0, (-centerLength / 2) - (3 * stepHeight));

// Union all the parts together sequentially to form the chamfered dowel pin
const finalPin = body
  .union(topStep1)
  .union(topStep2)
  .union(topStep3)
  .union(bottomStep1)
  .union(bottomStep2)
  .union(bottomStep3)
  .color("#b0c4de");

// Return the final geometry
return {
  "a-solid-cylindrical-dowel-pin-centered-a": finalPin,
};
