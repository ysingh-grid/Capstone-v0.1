/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : An upright, symmetric flanged pipe section with a central bore and four bolt holes on both flanges.
 * Workflow ID : eval-T3_005-05d9ef
 * Trace ID    : 0308c81b-1dba-4ea5-a828-c420ea823c34
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 50.0 × 50.0 × 50.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 5 hole(s) of diameter 6.0 mm (×5)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_005-05d9ef/step/T3_005_outer0_attempt0.step
 *   STL    : artifact://eval-T3_005-05d9ef/stl/T3_005_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure proper union of the three concentric cylinders before performing the subtraction of the central bore and the four bolt holes. The bolt holes should be placed using pushPoints at coordinates: (20, 0), (0, 20), (-20, 0), (0, -20) on the XY plane and extruded/cut through the flanges.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Flanged Pipe Section
 * An upright, symmetric flanged pipe section with a central bore and four bolt holes.
 */

// Define parameters for customizer sliders
const overallHeight = Param.number("Overall Height", 50, { min: 10, max: 200, unit: "mm" });
const flangeOD = Param.number("Flange Outer Diameter", 50, { min: 10, max: 200, unit: "mm" });
const flangeThickness = Param.number("Flange Thickness", 5, { min: 1, max: 50, unit: "mm" });
const pipeOD = Param.number("Pipe Outer Diameter", 30, { min: 5, max: 150, unit: "mm" });
const boreID = Param.number("Bore Inner Diameter", 20, { min: 2, max: 100, unit: "mm" });
const boltCircleD = Param.number("Bolt Circle Diameter", 40, { min: 5, max: 180, unit: "mm" });
const boltHoleD = Param.number("Bolt Hole Diameter", 6, { min: 1, max: 30, unit: "mm" });

// Calculate radii from diameters
const flangeRadius = flangeOD / 2;
const pipeRadius = pipeOD / 2;
const boreRadius = boreID / 2;
const boltCircleRadius = boltCircleD / 2;
const boltHoleRadius = boltHoleD / 2;

// Create bottom flange cylinder (extends from Z=0 to Z=flangeThickness)
const bottomFlange = cylinder(flangeThickness, flangeRadius);

// Create pipe wall cylinder (extends from Z=0 to Z=overallHeight)
const pipeWall = cylinder(overallHeight, pipeRadius);

// Create top flange cylinder and translate to top
const topFlange = cylinder(flangeThickness, flangeRadius)
  .translate(0, 0, overallHeight - flangeThickness);

// Union the solid body components
const solidBody = bottomFlange.union(pipeWall).union(topFlange);

// Create the central bore cutout (extends extra to avoid precision artifacts)
const boreCutout = cylinder(overallHeight + 2, boreRadius)
  .translate(0, 0, -1);

// Create four bolt holes along Z, translated to the bolt circle positions
const boltHoleHeight = overallHeight + 2;
const hole1 = cylinder(boltHoleHeight, boltHoleRadius).translate(boltCircleRadius, 0, -1);
const hole2 = cylinder(boltHoleHeight, boltHoleRadius).translate(-boltCircleRadius, 0, -1);
const hole3 = cylinder(boltHoleHeight, boltHoleRadius).translate(0, boltCircleRadius, -1);
const hole4 = cylinder(boltHoleHeight, boltHoleRadius).translate(0, -boltCircleRadius, -1);

// Subtract bore and bolt holes from the solid body
const finalShape = solidBody
  .subtract(boreCutout)
  .subtract(hole1)
  .subtract(hole2)
  .subtract(hole3)
  .subtract(hole4)
  .color("#5f87c6");

// Return the final shape
return {
  "an-upright,-symmetric-flanged-pipe-secti": finalShape
};
