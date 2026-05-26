/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Flanged shaft standing upright along Z, centered at the origin, featuring a 40mm diameter base flange and a 20mm diameter, 50mm long shaft, with four 6mm bolt holes on a 30mm bolt circle.
 * Workflow ID : eval-T2_025-ef5630
 * Trace ID    : 9866fae4-84e4-4935-9c2d-da3a1b7bfbe8
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 40.0 × 40.0 × 55.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 4 hole(s) of diameter 6.0 mm (×4)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T2_025-ef5630/step/T2_025_outer0_attempt0.step
 *   STL    : artifact://eval-T2_025-ef5630/stl/T2_025_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   To model this, first construct the flange cylinder from Z=0 to Z=5 with radius 20. Next, construct the shaft cylinder from Z=5 to Z=55 with radius 10. Perform a union of these two bodies. Then, generate four cutting cylinders of radius 3, extending at least from Z=-1 to Z=6 to ensure clean through-cuts. Position these cutting cylinders at (15, 0), (0, 15), (-15, 0), and (0, -15) in the XY plane. Subtract the four cylinders from the combined body.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: Flanged Shaft Standing Upright Along Z
 * Centered at the origin, featuring a base flange, vertical shaft, and four bolt holes.
 */

// User-adjustable parameters for the flanged shaft
const flangeDia = Param.number("Flange Diameter", 40, { min: 10, max: 200, unit: "mm" });
const flangeThick = Param.number("Flange Thickness", 5, { min: 1, max: 50, unit: "mm" });
const shaftDia = Param.number("Shaft Diameter", 20, { min: 5, max: 100, unit: "mm" });
const shaftLen = Param.number("Shaft Length", 50, { min: 10, max: 300, unit: "mm" });
const boltCircleDia = Param.number("Bolt Circle Diameter", 30, { min: 10, max: 150, unit: "mm" });
const boltHoleDia = Param.number("Bolt Hole Diameter", 6, { min: 1, max: 20, unit: "mm" });

// Calculate radii and offsets
const flangeRadius = flangeDia / 2;
const shaftRadius = shaftDia / 2;
const boltCircleRadius = boltCircleDia / 2;
const boltHoleRadius = boltHoleDia / 2;
const holeHeight = flangeThick + 2;

// Create the base flange cylinder (Z = 0 to Z = flangeThick)
const flange = cylinder(flangeThick, flangeRadius);

// Create the vertical shaft cylinder and translate it to sit on top of the flange
const shaft = cylinder(shaftLen, shaftRadius).translate(0, 0, flangeThick);

// Combine the flange and the shaft into a single solid body
const combinedBody = flange.union(shaft);

// Create the four bolt holes, slightly taller than the flange thickness and offset downwards for a clean cut
const hole1 = cylinder(holeHeight, boltHoleRadius).translate(boltCircleRadius, 0, -1);
const hole2 = cylinder(holeHeight, boltHoleRadius).translate(0, boltCircleRadius, -1);
const hole3 = cylinder(holeHeight, boltHoleRadius).translate(-boltCircleRadius, 0, -1);
const hole4 = cylinder(holeHeight, boltHoleRadius).translate(0, -boltCircleRadius, -1);

// Subtract the bolt holes from the combined body and set the color
const finalShape = combinedBody
  .subtract(hole1)
  .subtract(hole2)
  .subtract(hole3)
  .subtract(hole4)
  .color("#5f87c6");

// Return the final shape mapping
return {
  "flanged-shaft-standing-upright-along-z,-": finalShape
};
