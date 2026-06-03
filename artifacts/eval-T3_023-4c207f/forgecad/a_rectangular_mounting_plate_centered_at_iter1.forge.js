/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A rectangular mounting plate centered at the origin on the XY plane, featuring a 3x2 array of six cylindrical standoff posts with M3 clearance holes passing through the entire height of the plate and posts.
 * Workflow ID : eval-T3_023-4c207f
 * Trace ID    : fae8b022-d8a8-4110-ab77-f7923c1b9c6c
 * Iteration   : 1
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 80.0 × 50.0 × 15.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 6 hole(s) of diameter 3.2 mm (×6)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_023-4c207f/step/T3_023_outer1_attempt0.step
 *   STL    : artifact://eval-T3_023-4c207f/stl/T3_023_outer1_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the model is centered at (0, 0, 0) in X and Y, with Z starting at 0 and ending at 15. The 3x2 grid of posts must be centered on the plate with columns at X = -30, 0, 30 and rows at Y = -15, 15.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Rectangular mounting plate with six standoff posts and M3 clearance holes.
 * Centered on the XY plane with Z starting at 0 and ending at 15.
 */

// Parameters
const baseWidth = Param.number("Base Width (X)", 80, { min: 10, max: 200, unit: "mm" });
const baseDepth = Param.number("Base Depth (Y)", 50, { min: 10, max: 200, unit: "mm" });
const baseThickness = Param.number("Base Thickness", 3, { min: 1, max: 10, unit: "mm" });

const gridSpacingX = Param.number("Grid Spacing X", 30, { min: 10, max: 80, unit: "mm" });
const gridSpacingY = Param.number("Grid Spacing Y", 30, { min: 10, max: 80, unit: "mm" });

const postDiameter = Param.number("Post Diameter", 8, { min: 4, max: 20, unit: "mm" });
const postHeight = Param.number("Post Height", 12, { min: 2, max: 50, unit: "mm" });

const holeDiameter = Param.number("Hole Diameter", 3.2, { min: 1, max: 10, unit: "mm" });

// Derived values
const postRadius = postDiameter / 2;
const holeRadius = holeDiameter / 2;
const totalHeight = baseThickness + postHeight;

// Create the main base plate (centered in XY, Z goes from 0 to baseThickness)
const basePlate = box(baseWidth, baseDepth, baseThickness).color("#5f87c6");

// Define standoff coordinates for 3x2 grid
const x1 = -gridSpacingX;
const x2 = 0;
const x3 = gridSpacingX;
const y1 = -gridSpacingY / 2;
const y2 = gridSpacingY / 2;

// Create standoff posts (Z starts at baseThickness)
const post1 = cylinder(postHeight, postRadius).translate(x1, y1, baseThickness);
const post2 = cylinder(postHeight, postRadius).translate(x2, y1, baseThickness);
const post3 = cylinder(postHeight, postRadius).translate(x3, y1, baseThickness);
const post4 = cylinder(postHeight, postRadius).translate(x1, y2, baseThickness);
const post5 = cylinder(postHeight, postRadius).translate(x2, y2, baseThickness);
const post6 = cylinder(postHeight, postRadius).translate(x3, y2, baseThickness);

// Union all posts to the base plate
const baseWithPosts = basePlate
  .union(post1)
  .union(post2)
  .union(post3)
  .union(post4)
  .union(post5)
  .union(post6);

// Create through-holes (Z extends slightly past boundaries to ensure clean cuts)
const holeOffsetZ = -1;
const holeHeight = totalHeight + 2;

const hole1 = cylinder(holeHeight, holeRadius).translate(x1, y1, holeOffsetZ);
const hole2 = cylinder(holeHeight, holeRadius).translate(x2, y1, holeOffsetZ);
const hole3 = cylinder(holeHeight, holeRadius).translate(x3, y1, holeOffsetZ);
const hole4 = cylinder(holeHeight, holeRadius).translate(x1, y2, holeOffsetZ);
const hole5 = cylinder(holeHeight, holeRadius).translate(x2, y2, holeOffsetZ);
const hole6 = cylinder(holeHeight, holeRadius).translate(x3, y2, holeOffsetZ);

// Subtract all through-holes from the combined solid
const finalShape = baseWithPosts
  .subtract(hole1)
  .subtract(hole2)
  .subtract(hole3)
  .subtract(hole4)
  .subtract(hole5)
  .subtract(hole6);

// Return the final mounting plate
return {
  "a-rectangular-mounting-plate-centered-at": finalShape,
};
