/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Rectangular mounting plate centered at the origin (XY plane, Z=0 to Z=15) with six standoff posts in a 3x2 array, featuring concentric thru-holes.
 * Workflow ID : eval-T3_023-c6bc37
 * Trace ID    : 3af84ed2-82e6-4e9e-a3ff-859ceeb362a9
 * Iteration   : 0
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
 *   STEP   : artifact://eval-T3_023-c6bc37/step/T3_023_outer0_attempt0.step
 *   STL    : artifact://eval-T3_023-c6bc37/stl/T3_023_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The part must lie on the XY plane with the bottom face at Z=0. The 3x2 post array is centered on the plate: X-coordinates of posts are at -30, 0, and 30; Y-coordinates are at -15 and 15. The 3.2mm holes must go entirely through the 15mm thickness (from Z=15 to Z=0).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file rectangular-mounting-plate-centered-at-t.forge.js
 * @description A rectangular mounting plate centered at the origin with six standoff posts and concentric thru-holes.
 */

// Define parametric inputs for the studio sliders
const plateLength = Param.number("Plate Length", 80, { min: 10, max: 500, unit: "mm" });
const plateWidth = Param.number("Plate Width", 50, { min: 10, max: 500, unit: "mm" });
const plateThickness = Param.number("Plate Thickness", 3, { min: 1, max: 20, unit: "mm" });
const postDiameter = Param.number("Post Diameter", 8, { min: 2, max: 30, unit: "mm" });
const postHeight = Param.number("Post Height", 12, { min: 1, max: 100, unit: "mm" });
const holeDiameter = Param.number("Hole Diameter", 3.2, { min: 1, max: 20, unit: "mm" });
const spacingX = Param.number("Spacing X", 30, { min: 5, max: 200, unit: "mm" });
const spacingY = Param.number("Spacing Y", 30, { min: 5, max: 200, unit: "mm" });

// Calculate radii and total height
const postRadius = postDiameter / 2;
const holeRadius = holeDiameter / 2;
const totalHeight = plateThickness + postHeight;

// Create the main rectangular base plate (centered on XY, Z from 0 to plateThickness)
const base = box(plateLength, plateWidth, plateThickness);

// Create the 6 individual standoff posts positioned at their respective coordinates
const post1 = cylinder(postHeight, postRadius).translate(-spacingX, -spacingY / 2, plateThickness);
const post2 = cylinder(postHeight, postRadius).translate(0, -spacingY / 2, plateThickness);
const post3 = cylinder(postHeight, postRadius).translate(spacingX, -spacingY / 2, plateThickness);
const post4 = cylinder(postHeight, postRadius).translate(-spacingX, spacingY / 2, plateThickness);
const post5 = cylinder(postHeight, postRadius).translate(0, spacingY / 2, plateThickness);
const post6 = cylinder(postHeight, postRadius).translate(spacingX, spacingY / 2, plateThickness);

// Union the base plate with all 6 posts
const solidPlate = base
  .union(post1)
  .union(post2)
  .union(post3)
  .union(post4)
  .union(post5)
  .union(post6);

// Create the 6 pilot hole cutting cylinders, slightly oversized along Z for clean cuts
const cutHeight = totalHeight + 2;
const hole1 = cylinder(cutHeight, holeRadius).translate(-spacingX, -spacingY / 2, -1);
const hole2 = cylinder(cutHeight, holeRadius).translate(0, -spacingY / 2, -1);
const hole3 = cylinder(cutHeight, holeRadius).translate(spacingX, -spacingY / 2, -1);
const hole4 = cylinder(cutHeight, holeRadius).translate(-spacingX, spacingY / 2, -1);
const hole5 = cylinder(cutHeight, holeRadius).translate(0, spacingY / 2, -1);
const hole6 = cylinder(cutHeight, holeRadius).translate(spacingX, spacingY / 2, -1);

// Subtract the pilot holes from the solid plate assembly
const finalPlate = solidPlate
  .subtract(hole1)
  .subtract(hole2)
  .subtract(hole3)
  .subtract(hole4)
  .subtract(hole5)
  .subtract(hole6)
  .color("#5f87c6");

// Return the completed plate geometry
return {
  "rectangular-mounting-plate-centered-at-t": finalPlate,
};
