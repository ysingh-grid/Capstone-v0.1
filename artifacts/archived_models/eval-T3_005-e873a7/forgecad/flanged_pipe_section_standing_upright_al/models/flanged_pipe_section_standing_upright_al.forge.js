/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Flanged pipe section standing upright along the Z axis, with bottom and top flanges, an inner bore, and four bolt holes on a 40mm bolt circle.
 * Workflow ID : eval-T3_005-e873a7
 * Trace ID    : e05f46c4-c9fb-4276-9349-358ed95d7425
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
 *   STEP   : artifact://eval-T3_005-e873a7/step/T3_005_outer0_attempt0.step
 *   STL    : artifact://eval-T3_005-e873a7/stl/T3_005_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure proper union of the three concentric cylinders (bottom flange, pipe wall, and top flange) before performing the difference operations for the bore and bolt holes. Use pushPoints or similar polar-to-cartesian coordinate generation for the 4 bolt holes at (20, 0), (0, 20), (-20, 0), and (0, -20) in XY.
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
 * Standing upright along the Z axis, centered at the origin in XY.
 */

// Parameters
const overallHeight = Param.number("Overall Height", 50, { min: 10, max: 200, unit: "mm" });
const flangeOD = Param.number("Flange Outer Diameter", 50, { min: 20, max: 200, unit: "mm" });
const flangeThickness = Param.number("Flange Thickness", 5, { min: 1, max: 30, unit: "mm" });
const pipeOD = Param.number("Pipe Outer Diameter", 30, { min: 10, max: 150, unit: "mm" });
const boreDia = Param.number("Bore Diameter", 20, { min: 5, max: 100, unit: "mm" });
const boltCircleDia = Param.number("Bolt Circle Diameter", 40, { min: 15, max: 180, unit: "mm" });
const boltHoleDia = Param.number("Bolt Hole Diameter", 6, { min: 1, max: 20, unit: "mm" });

// Radii and offsets
const flangeRad = flangeOD / 2;
const pipeRad = pipeOD / 2;
const boreRad = boreDia / 2;
const boltRad = boltHoleDia / 2;
const boltDist = boltCircleDia / 2;

// Create bottom flange
const bottomFlange = cylinder(flangeThickness, flangeRad);

// Create pipe wall cylinder
const pipeWall = cylinder(overallHeight, pipeRad);

// Create top flange and translate to the top
const topFlangeTranslationZ = overallHeight - flangeThickness;
const topFlange = cylinder(flangeThickness, flangeRad).translate(0, 0, topFlangeTranslationZ);

// Union the solid body components
const solidBody = bottomFlange.union(pipeWall).union(topFlange);

// Center bore cut (oversized along Z to ensure clean cut)
const boreCut = cylinder(overallHeight + 10, boreRad).translate(0, 0, -5);

// Subtract the bore
const boredBody = solidBody.subtract(boreCut);

// Create the four bolt holes (oversized along Z to ensure clean cut through both flanges)
const holeHeight = overallHeight + 10;
const holeZOffset = -5;
const h1 = cylinder(holeHeight, boltRad).translate(boltDist, 0, holeZOffset);
const h2 = cylinder(holeHeight, boltRad).translate(0, boltDist, holeZOffset);
const h3 = cylinder(holeHeight, boltRad).translate(-boltDist, 0, holeZOffset);
const h4 = cylinder(holeHeight, boltRad).translate(0, -boltDist, holeZOffset);

// Subtract the bolt holes
const finalShape = boredBody
  .subtract(h1)
  .subtract(h2)
  .subtract(h3)
  .subtract(h4)
  .color("#5f87c6");

// Return the final assembly
return {
  "flanged-pipe-section-standing-upright-al": finalShape,
};
