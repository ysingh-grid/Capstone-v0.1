/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Rectangular electronics enclosure body with 2mm walls, 4mm vertical edge fillets, and four internal screw bosses with 3mm through-holes.
 * Workflow ID : eval-T3_003-566f41
 * Trace ID    : 53fea9cf-7078-434c-95b3-3fce9f2e31c5
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 70.0 × 50.0 × 30.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 4 hole(s) of diameter 3.0 mm (×4)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_003-566f41/step/T3_003_outer0_attempt0.step
 *   STL    : artifact://eval-T3_003-566f41/stl/T3_003_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The outer box is centered at (0,0,15) so the base is at Z=0. Shelling is done inward, removing only the top (+Z) face. The four screw bosses must extend from Z=2 to Z=30 and merge with the inner floor/walls. The 3mm holes must go completely through the bosses and the 2mm base floor (from Z=30 down to Z=0).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: Rectangular Electronics Enclosure Body
 * A parametric electronics enclosure with filleted corners, internal screw bosses, and through-holes.
 */

// Define design parameters
const width = Param.number("Width", 70, { min: 10, max: 200, unit: "mm" });
const depth = Param.number("Depth", 50, { min: 10, max: 200, unit: "mm" });
const height = Param.number("Height", 30, { min: 10, max: 100, unit: "mm" });
const filletRadius = Param.number("Fillet Radius", 4, { min: 0.5, max: 10, unit: "mm" });
const wallThickness = Param.number("Wall Thickness", 2, { min: 1, max: 5, unit: "mm" });
const bossDia = Param.number("Boss Diameter", 8, { min: 4, max: 15, unit: "mm" });
const bossHoleDia = Param.number("Boss Hole Diameter", 3, { min: 1, max: 8, unit: "mm" });
const bossX = Param.number("Boss X Position", 27, { min: 5, max: 90, unit: "mm" });
const bossY = Param.number("Boss Y Position", 17, { min: 5, max: 90, unit: "mm" });

// Calculate safe inner fillet radius to prevent negative values
const innerFilletRadius = Math.max(0.1, filletRadius - wallThickness);

// Outer Solid: Centered on XY, extending from Z=0 to Z=height
const outerBoxX = box(width - 2 * filletRadius, depth, height);
const outerBoxY = box(width, depth - 2 * filletRadius, height);
const oc1 = cylinder(height, filletRadius).translate(width / 2 - filletRadius, depth / 2 - filletRadius, 0);
const oc2 = cylinder(height, filletRadius).translate(-(width / 2 - filletRadius), depth / 2 - filletRadius, 0);
const oc3 = cylinder(height, filletRadius).translate(width / 2 - filletRadius, -(depth / 2 - filletRadius), 0);
const oc4 = cylinder(height, filletRadius).translate(-(width / 2 - filletRadius), -(depth / 2 - filletRadius), 0);

const outerSolid = outerBoxX
  .union(outerBoxY)
  .union(oc1)
  .union(oc2)
  .union(oc3)
  .union(oc4);

// Inner Void: Used to hollow out the container, open at the top (Z = height)
const innerWidth = width - 2 * wallThickness;
const innerDepth = depth - 2 * wallThickness;
const innerHeight = height - wallThickness + 5; // Extra height for a clean cut at the top open face

const innerBoxX = box(innerWidth - 2 * innerFilletRadius, innerDepth, innerHeight);
const innerBoxY = box(innerWidth, innerDepth - 2 * innerFilletRadius, innerHeight);
const ic1 = cylinder(innerHeight, innerFilletRadius).translate(innerWidth / 2 - innerFilletRadius, innerDepth / 2 - innerFilletRadius, 0);
const ic2 = cylinder(innerHeight, innerFilletRadius).translate(-(innerWidth / 2 - innerFilletRadius), innerDepth / 2 - innerFilletRadius, 0);
const ic3 = cylinder(innerHeight, innerFilletRadius).translate(innerWidth / 2 - innerFilletRadius, -(innerDepth / 2 - innerFilletRadius), 0);
const ic4 = cylinder(innerHeight, innerFilletRadius).translate(-(innerWidth / 2 - innerFilletRadius), -(innerDepth / 2 - innerFilletRadius), 0);

const innerSolid = innerBoxX
  .union(innerBoxY)
  .union(ic1)
  .union(ic2)
  .union(ic3)
  .union(ic4)
  .translate(0, 0, wallThickness);

// Subtract inner void from outer solid to create the open shell
const shell = outerSolid.subtract(innerSolid);

// Create four internal screw bosses extending from the floor (Z = wallThickness) to the rim (Z = height)
const bossR = bossDia / 2;
const bossH = height - wallThickness;
const b1 = cylinder(bossH, bossR).translate(bossX, bossY, wallThickness);
const b2 = cylinder(bossH, bossR).translate(-bossX, bossY, wallThickness);
const b3 = cylinder(bossH, bossR).translate(bossX, -bossY, wallThickness);
const b4 = cylinder(bossH, bossR).translate(-bossX, -bossY, wallThickness);

const shellWithBosses = shell
  .union(b1)
  .union(b2)
  .union(b3)
  .union(b4);

// Create four vertical through-holes running completely through the bosses and base floor (Z = -1 to height + 1)
const holeR = bossHoleDia / 2;
const holeH = height + 2;
const h1 = cylinder(holeH, holeR).translate(bossX, bossY, -1);
const h2 = cylinder(holeH, holeR).translate(-bossX, bossY, -1);
const h3 = cylinder(holeH, holeR).translate(bossX, -bossY, -1);
const h4 = cylinder(holeH, holeR).translate(-bossX, -bossY, -1);

// Subtract the holes to get the final enclosure body
const finalEnclosure = shellWithBosses
  .subtract(h1)
  .subtract(h2)
  .subtract(h3)
  .subtract(h4)
  .color("#5f87c6");

// Return the final component
return {
  "rectangular-electronics-enclosure-body-w": finalEnclosure
};
