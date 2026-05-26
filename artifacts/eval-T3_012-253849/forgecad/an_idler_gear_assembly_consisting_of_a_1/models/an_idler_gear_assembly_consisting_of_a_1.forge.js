/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : An idler gear assembly consisting of a 16-tooth spur gear mounted on a stepped post rising from a square base plate with a central through-bore and four mounting holes.
 * Workflow ID : eval-T3_012-253849
 * Trace ID    : ce3070a3-ed2c-4b57-9be2-d11f241c4ed7
 * Iteration   : 1
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 60.0 × 60.0 × 40.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 5 hole(s) of diameter 8.0 mm (×5)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_012-253849/step/T3_012_outer1_attempt0.step
 *   STL    : artifact://eval-T3_012-253849/stl/T3_012_outer1_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Model the 16-tooth spur gear with a star-polygon tooth profile alternating between root radius (16mm) and tip radius (20mm). Ensure the central bore of 8mm cuts entirely through the assembly (Z=0 to Z=40). The four 6mm mounting holes must be centered at coordinates (+-22, +-22) in the XY plane and cut only through the base plate (Z=0 to Z=5).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: Idler Gear Assembly
 * 
 * An idler gear assembly consisting of a 16-tooth spur gear mounted on a stepped post 
 * rising from a square base plate with a central through-bore and four mounting holes.
 */

// Design Parameters
const basePlateLength = Param.number("Base Plate Length", 60, { min: 10, max: 200, unit: "mm" });
const basePlateThickness = Param.number("Base Plate Thickness", 5, { min: 1, max: 50, unit: "mm" });
const postLowerDia = Param.number("Post Lower Diameter", 20, { min: 5, max: 100, unit: "mm" });
const postLowerHeight = Param.number("Post Lower Height", 13, { min: 5, max: 100, unit: "mm" });
const postUpperDia = Param.number("Post Upper Diameter", 14, { min: 5, max: 100, unit: "mm" });
const postUpperHeight = Param.number("Post Upper Height", 22, { min: 5, max: 100, unit: "mm" });
const centralBoreDia = Param.number("Central Bore Diameter", 8, { min: 2, max: 50, unit: "mm" });
const mountingHoleDia = Param.number("Mounting Hole Diameter", 6, { min: 2, max: 20, unit: "mm" });
const mountingHolePitch = Param.number("Mounting Hole Pitch", 44, { min: 10, max: 180, unit: "mm" });

const gearTipDia = Param.number("Gear Tip Diameter", 40, { min: 10, max: 150, unit: "mm" });
const gearRootDia = Param.number("Gear Root Diameter", 32, { min: 8, max: 140, unit: "mm" });
const gearHeight = Param.number("Gear Height", 8, { min: 2, max: 50, unit: "mm" });
const gearZStart = Param.number("Gear Z Start", 10, { min: 0, max: 100, unit: "mm" });
const toothThickness = Param.number("Tooth Thickness", 3.5, { min: 1, max: 10, unit: "mm" });

// Base Plate (Z = 0 to 5)
const base = box(basePlateLength, basePlateLength, basePlateThickness).color("#5f87c6");

// Lower Post (Z = 5 to 18)
const lowerPost = cylinder(postLowerHeight, postLowerDia / 2)
  .translate(0, 0, basePlateThickness)
  .color("#8fa8d1");

// Upper Post (Z = 18 to 40)
const upperPost = cylinder(postUpperHeight, postUpperDia / 2)
  .translate(0, 0, basePlateThickness + postLowerHeight)
  .color("#8fa8d1");

// Gear Hub (Z = 10 to 18)
const gearHub = cylinder(gearHeight, gearRootDia / 2)
  .translate(0, 0, gearZStart)
  .color("#f7a85e");

// Gear Teeth (8 crossed boxes to form a 16-tooth star polygon)
const toothBase = box(gearTipDia, toothThickness, gearHeight)
  .translate(0, 0, gearZStart)
  .color("#f7a85e");

const t0 = toothBase;
const t1 = toothBase.rotate([0, 0, 1], 22.5);
const t2 = toothBase.rotate([0, 0, 1], 45.0);
const t3 = toothBase.rotate([0, 0, 1], 67.5);
const t4 = toothBase.rotate([0, 0, 1], 90.0);
const t5 = toothBase.rotate([0, 0, 1], 112.5);
const t6 = toothBase.rotate([0, 0, 1], 135.0);
const t7 = toothBase.rotate([0, 0, 1], 157.5);

// Union all gear elements safely (maximum 8 operations)
const gear = gearHub
  .union(t0)
  .union(t1)
  .union(t2)
  .union(t3)
  .union(t4)
  .union(t5)
  .union(t6)
  .union(t7);

// Merge all solid components
const assembly = base
  .union(lowerPost)
  .union(upperPost)
  .union(gear);

// Create the central vertical through-bore
const bore = cylinder(50, centralBoreDia / 2).translate(0, 0, -5);

// Create the four corner mounting holes
const holeOffset = mountingHolePitch / 2;
const h1 = cylinder(15, mountingHoleDia / 2).translate(holeOffset, holeOffset, -5);
const h2 = cylinder(15, mountingHoleDia / 2).translate(-holeOffset, holeOffset, -5);
const h3 = cylinder(15, mountingHoleDia / 2).translate(holeOffset, -holeOffset, -5);
const h4 = cylinder(15, mountingHoleDia / 2).translate(-holeOffset, -holeOffset, -5);

// Subtract the holes to finish the model
const finalShape = assembly
  .subtract(bore)
  .subtract(h1)
  .subtract(h2)
  .subtract(h3)
  .subtract(h4);

// Return the final geometry mapping
return {
  "an-idler-gear-assembly-consisting-of-a-1": finalShape
};
