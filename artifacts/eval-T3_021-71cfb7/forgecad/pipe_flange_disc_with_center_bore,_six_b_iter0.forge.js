/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Pipe flange disc with center bore, six bolt holes, and a concentric gasket groove on the top face.
 * Workflow ID : eval-T3_021-71cfb7
 * Trace ID    : 4bb23ea4-bb48-46af-b978-892918e15505
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 80.0 × 80.0 × 16.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 7 hole(s) of diameter 9.0 mm (×7)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_021-71cfb7/step/T3_021_outer0_attempt0.step
 *   STL    : artifact://eval-T3_021-71cfb7/stl/T3_021_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Base cylinder is diameter 80mm, Z from 0 to 16. Center bore is diameter 32mm, subtracted through full thickness. Six bolt holes are diameter 9mm, centered at radius 27.5mm at angles 0, 60, 120, 180, 240, 300 degrees, subtracted through full thickness. Gasket groove is concentric on top face, outer diameter 50mm, inner diameter 38mm, depth 2mm (subtracted from Z=14 to Z=16).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file pipe_flange_disc.forge.js
 * @description Parametric model of a pipe flange disc with center bore, six bolt holes, and a gasket groove.
 */

// Define parametric inputs
const flangeDiameter = Param.number("Flange Diameter", 80, { min: 10, max: 200, unit: "mm" });
const flangeThickness = Param.number("Flange Thickness", 16, { min: 1, max: 50, unit: "mm" });
const centerBoreDiameter = Param.number("Center Bore Diameter", 32, { min: 5, max: 100, unit: "mm" });
const boltCircleDiameter = Param.number("Bolt Circle Diameter", 55, { min: 10, max: 150, unit: "mm" });
const boltHoleDiameter = Param.number("Bolt Hole Diameter", 9, { min: 1, max: 20, unit: "mm" });
const gasketOuterDiameter = Param.number("Gasket Outer Diameter", 50, { min: 10, max: 150, unit: "mm" });
const gasketInnerDiameter = Param.number("Gasket Inner Diameter", 38, { min: 5, max: 140, unit: "mm" });
const gasketDepth = Param.number("Gasket Depth", 2, { min: 0.5, max: 10, unit: "mm" });

// Calculate radii from diameters
const flangeRadius = flangeDiameter / 2;
const centerBoreRadius = centerBoreDiameter / 2;
const boltCircleRadius = boltCircleDiameter / 2;
const boltHoleRadius = boltHoleDiameter / 2;
const gasketOuterRadius = gasketOuterDiameter / 2;
const gasketInnerRadius = gasketInnerDiameter / 2;

// Helper function to convert degrees to radians
const degToRad = (deg) => (deg * Math.PI) / 180;

// Create main flange disc body (centered on XY, Z from 0 to flangeThickness)
const mainDisc = cylinder(flangeThickness, flangeRadius);

// Create central bore cylinder (slightly taller to ensure clean boolean subtraction)
const centerBore = cylinder(flangeThickness + 2, centerBoreRadius).translate(0, 0, -1);

// Create bolt hole cutters at specific angles (0, 60, 120, 180, 240, 300 degrees)
const hole0 = cylinder(flangeThickness + 2, boltHoleRadius).translate(boltCircleRadius * Math.cos(degToRad(0)), boltCircleRadius * Math.sin(degToRad(0)), -1);
const hole1 = cylinder(flangeThickness + 2, boltHoleRadius).translate(boltCircleRadius * Math.cos(degToRad(60)), boltCircleRadius * Math.sin(degToRad(60)), -1);
const hole2 = cylinder(flangeThickness + 2, boltHoleRadius).translate(boltCircleRadius * Math.cos(degToRad(120)), boltCircleRadius * Math.sin(degToRad(120)), -1);
const hole3 = cylinder(flangeThickness + 2, boltHoleRadius).translate(boltCircleRadius * Math.cos(degToRad(180)), boltCircleRadius * Math.sin(degToRad(180)), -1);
const hole4 = cylinder(flangeThickness + 2, boltHoleRadius).translate(boltCircleRadius * Math.cos(degToRad(240)), boltCircleRadius * Math.sin(degToRad(240)), -1);
const hole5 = cylinder(flangeThickness + 2, boltHoleRadius).translate(boltCircleRadius * Math.cos(degToRad(300)), boltCircleRadius * Math.sin(degToRad(300)), -1);

// Create gasket groove cutting tool
const grooveOuter = cylinder(gasketDepth + 1, gasketOuterRadius);
const grooveInner = cylinder(gasketDepth + 2, gasketInnerRadius).translate(0, 0, -0.5);
const gasketGrooveTool = grooveOuter.subtract(grooveInner).translate(0, 0, flangeThickness - gasketDepth);

// Combine all parts using subtraction chain to avoid loops and ensure high performance
const finishedFlange = mainDisc
  .subtract(centerBore)
  .subtract(hole0)
  .subtract(hole1)
  .subtract(hole2)
  .subtract(hole3)
  .subtract(hole4)
  .subtract(hole5)
  .subtract(gasketGrooveTool)
  .color("#5f87c6");

// Export final part
return {
  "pipe-flange-disc-with-center-bore,-six-b": finishedFlange,
};
