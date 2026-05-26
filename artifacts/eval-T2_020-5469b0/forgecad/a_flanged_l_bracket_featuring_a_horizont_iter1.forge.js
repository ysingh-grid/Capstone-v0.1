/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A flanged L-bracket featuring a horizontal base plate with flange ears and a vertical wall, with mounting holes in both the base and the wall.
 * Workflow ID : eval-T2_020-5469b0
 * Trace ID    : 087cd748-1102-4226-9df6-461088d2e979
 * Iteration   : 1
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 60.0 × 40.0 × 34.0 mm
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
 *   STEP   : artifact://eval-T2_020-5469b0/step/T2_020_outer1_attempt0.step
 *   STL    : artifact://eval-T2_020-5469b0/stl/T2_020_outer1_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Coordinate assignments: Origin is at the center-front-bottom of the base plate's footprint if centered, but based on the prompt: Base is X from -30 to +30, Y from 0 to 40, Z from 0 to 4. Vertical wall is X from -20 to +20, Y from 0 to 4, Z from 4 to 34 (rising 30mm from the Z=4 surface). Base holes are at (X=25, Y=20) and (X=-25, Y=20) drilled through Z. Wall holes are at (X=12, Z=19) and (X=-12, Z=19) drilled through Y. Ensure the boolean subtraction for the holes is clean.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Flanged L-Bracket Model
 * A parametric flanged bracket with base plate, vertical wall, and mounting holes.
 */

// Define parameters for the bracket base
const baseWidth = Param.number("Base Width", 60, { min: 10, max: 200, unit: "mm" });
const baseDepth = Param.number("Base Depth", 40, { min: 10, max: 200, unit: "mm" });
const baseThickness = Param.number("Base Thickness", 4, { min: 1, max: 20, unit: "mm" });

// Define parameters for the vertical wall
const wallWidth = Param.number("Wall Width", 40, { min: 10, max: 200, unit: "mm" });
const wallHeight = Param.number("Wall Height", 30, { min: 5, max: 150, unit: "mm" });
const wallThickness = Param.number("Wall Thickness", 4, { min: 1, max: 20, unit: "mm" });

// Define parameters for the mounting holes
const baseHoleDia = Param.number("Base Hole Diameter", 6, { min: 1, max: 15, unit: "mm" });
const baseHoleX = Param.number("Base Hole X Offset", 25, { min: 0, max: 90, unit: "mm" });
const wallHoleDia = Param.number("Wall Hole Diameter", 5, { min: 1, max: 15, unit: "mm" });
const wallHoleX = Param.number("Wall Hole X Offset", 12, { min: 0, max: 90, unit: "mm" });
const wallHoleZ = Param.number("Wall Hole Z Height", 19, { min: 1, max: 150, unit: "mm" });

// 1. Create the base plate (centered on XY, sitting on Z=0)
const basePlate = box(baseWidth, baseDepth, baseThickness);

// 2. Create the vertical wall
// Centered in X, positioned at the negative Y edge of the base, sitting on top of the base plate (Z = baseThickness)
const wallYPosition = -baseDepth / 2 + wallThickness / 2;
const verticalWall = box(wallWidth, wallThickness, wallHeight)
  .translate(0, wallYPosition, baseThickness);

// 3. Union the base and the wall to form the solid bracket structure
const bracketBody = basePlate.union(verticalWall);

// 4. Create base mounting holes (cylinders along Z, taller than base thickness for a clean cut)
const baseHoleCutDepth = baseThickness + 4;
const baseHoleLeft = cylinder(baseHoleCutDepth, baseHoleDia / 2)
  .translate(-baseHoleX, 0, -2);
const baseHoleRight = cylinder(baseHoleCutDepth, baseHoleDia / 2)
  .translate(baseHoleX, 0, -2);

// 5. Create wall mounting holes (cylinders rotated 90 deg around X-axis to align along Y-axis)
const wallHoleCutDepth = wallThickness + 4;
const wallHoleLeft = cylinder(wallHoleCutDepth, wallHoleDia / 2)
  .rotate([1, 0, 0], 90)
  .translate(-wallHoleX, wallYPosition, wallHoleZ);
const wallHoleRight = cylinder(wallHoleCutDepth, wallHoleDia / 2)
  .rotate([1, 0, 0], 90)
  .translate(wallHoleX, wallYPosition, wallHoleZ);

// 6. Subtract the mounting holes from the bracket body
const finalBracket = bracketBody
  .subtract(baseHoleLeft)
  .subtract(baseHoleRight)
  .subtract(wallHoleLeft)
  .subtract(wallHoleRight)
  .color("#5f87c6");

// Return the final shape mapped to the required part name
return {
  "a-flanged-l-bracket-featuring-a-horizont": finalBracket,
};
