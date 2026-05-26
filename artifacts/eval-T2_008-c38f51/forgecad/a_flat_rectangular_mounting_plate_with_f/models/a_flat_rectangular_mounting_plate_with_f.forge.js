/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A flat rectangular mounting plate with four M4 clearance holes positioned near the corners.
 * Workflow ID : eval-T2_008-c38f51
 * Trace ID    : dec23717-c1c1-41ca-a8d1-76ad488b5db1
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 80.0 × 60.0 × 5.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 4 hole(s) of diameter 4.2 mm (×4)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 2.0%
 *   BBox IoU       : ≥ 0.98
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T2_008-c38f51/step/T2_008_outer0_attempt0.step
 *   STL    : artifact://eval-T2_008-c38f51/stl/T2_008_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The plate should be centered at the origin. The bounding box in XY is [-40 to 40, -30 to 30]. Since the holes are inset by 8mm from each corner, their centers must be located at (+/-32, +/-22) in the XY plane, and they must be drilled completely through the Z-axis.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file mounting_plate.forge.js
 * @description A flat rectangular mounting plate with four M4 clearance holes near the corners.
 */

// Define parameters for the mounting plate
const width = Param.number("Plate Width X", 80, { min: 10, max: 500, unit: "mm" });
const depth = Param.number("Plate Depth Y", 60, { min: 10, max: 500, unit: "mm" });
const thickness = Param.number("Plate Thickness Z", 5, { min: 1, max: 100, unit: "mm" });
const holeDia = Param.number("Hole Diameter", 4.2, { min: 1, max: 20, unit: "mm" });
const inset = Param.number("Hole Inset", 8, { min: 2, max: 50, unit: "mm" });

// Calculate helper values
const holeRadius = holeDia / 2;
const holeHeight = thickness + 2; // Extra length to ensure clean through-cuts
const posX = width / 2 - inset;
const posY = depth / 2 - inset;

// Create the main rectangular base plate (centered on XY, extends +Z)
const basePlate = box(width, depth, thickness).color("#5f87c6");

// Create the four through-holes positioned at the inset corners
const hole1 = cylinder(holeHeight, holeRadius).translate(posX, posY, -1);
const hole2 = cylinder(holeHeight, holeRadius).translate(-posX, posY, -1);
const hole3 = cylinder(holeHeight, holeRadius).translate(posX, -posY, -1);
const hole4 = cylinder(holeHeight, holeRadius).translate(-posX, -posY, -1);

// Subtract the clearance holes from the plate
const finalPlate = basePlate
  .subtract(hole1)
  .subtract(hole2)
  .subtract(hole3)
  .subtract(hole4);

// Return the final geometry
return {
  "a-flat-rectangular-mounting-plate-with-f": finalPlate,
};
