/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A 120mm diameter flywheel with a 40mm raised hub boss, a 16mm center bore, and six 22mm lightening holes spaced on a 70mm pitch circle diameter.
 * Workflow ID : eval-T3_024-ce44d5
 * Trace ID    : 31c3c223-35fa-4d3e-8629-6e834bd05906
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 120.0 × 120.0 × 30.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 7 hole(s) of diameter 22.0 mm (×7)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_024-ce44d5/step/T3_024_outer0_attempt0.step
 *   STL    : artifact://eval-T3_024-ce44d5/stl/T3_024_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the center bore cuts through both the main disc and the hub boss (total Z range 0 to 30). The 6 lightening holes must only cut through the main disc (Z range 0 to 20) and are positioned at 60-degree increments starting from 0 degrees (along the +X axis) at a radial distance of 35mm from the origin.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Flywheel with Lightening Holes and a Raised Hub Boss
 * Centered at the origin on the XY plane.
 */

// Define parameters for live adjustment in ForgeCAD
const discDiameter = Param.number("Main Disc Diameter", 120, { min: 50, max: 300, unit: "mm" });
const discThickness = Param.number("Main Disc Thickness", 20, { min: 5, max: 100, unit: "mm" });
const hubDiameter = Param.number("Hub Boss Diameter", 40, { min: 20, max: 100, unit: "mm" });
const hubHeight = Param.number("Hub Boss Height", 10, { min: 2, max: 50, unit: "mm" });
const boreDiameter = Param.number("Center Bore Diameter", 16, { min: 5, max: 50, unit: "mm" });
const holeDiameter = Param.number("Lightening Hole Diameter", 22, { min: 5, max: 50, unit: "mm" });
const holePCD = Param.number("Lightening Hole PCD", 70, { min: 30, max: 200, unit: "mm" });

// Calculate radii
const discRadius = discDiameter / 2;
const hubRadius = hubDiameter / 2;
const boreRadius = boreDiameter / 2;
const holeRadius = holeDiameter / 2;
const holeRadialDistance = holePCD / 2;

// 1. Create the main flywheel disc
const mainDisc = cylinder(discThickness, discRadius);

// 2. Create the raised hub boss and translate it to sit on top of the disc (Z = discThickness)
const hubBoss = cylinder(hubHeight, hubRadius).translate(0, 0, discThickness);

// 3. Union the main disc and the hub boss to form the solid blank
const solidBlank = mainDisc.union(hubBoss);

// 4. Create the center bore tool (slightly taller to ensure a clean through-cut)
const totalHeight = discThickness + hubHeight;
const boreTool = cylinder(totalHeight + 2, boreRadius).translate(0, 0, -1);

// 5. Create the base lightening hole tool (positioned at 0 degrees, slightly taller than the disc thickness)
const baseHole = cylinder(discThickness + 2, holeRadius).translate(holeRadialDistance, 0, -1);

// 6. Create rotated instances of the lightening hole tool at 60-degree increments
const hole0 = baseHole;
const hole60 = baseHole.rotate([0, 0, 1], 60);
const hole120 = baseHole.rotate([0, 0, 1], 120);
const hole180 = baseHole.rotate([0, 0, 1], 180);
const hole240 = baseHole.rotate([0, 0, 1], 240);
const hole300 = baseHole.rotate([0, 0, 1], 300);

// 7. Subtract the center bore and all six lightening holes from the solid blank
const finishedFlywheel = solidBlank
  .subtract(boreTool)
  .subtract(hole0)
  .subtract(hole60)
  .subtract(hole120)
  .subtract(hole180)
  .subtract(hole240)
  .subtract(hole300)
  .color("#5f87c6");

// Return the final model
return {
  "a-120mm-diameter-flywheel-with-a-40mm-ra": finishedFlywheel
};
