/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : An idler gear assembly consisting of a square base plate, a central stepped post with a retaining shoulder, an integrated 16-tooth spur gear, a central through-bore, and four mounting holes.
 * Workflow ID : eval-T3_012-af6dfe
 * Trace ID    : 3d43e66a-1ac4-413b-b7fd-3c0d78b92bca
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 60.0 × 60.0 × 40.0 mm
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
 *   STEP   : artifact://eval-T3_012-af6dfe/step/T3_012_outer0_attempt0.step
 *   STL    : artifact://eval-T3_012-af6dfe/stl/T3_012_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the spur gear is modeled co-axially with the stepped post. The gear profile should be generated using a 16-point star polygon (or equivalent 16-tooth simplified profile) alternating between the root radius (16mm) and tip radius (20mm). The central 8mm bore must go cleanly through the entire 40mm height of the assembly.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Idler Gear Assembly
 * A parametric CAD model of an idler gear mounted on a stepped post rising from a base plate.
 */

// Define parameters for live sliders in ForgeCAD Studio
const baseWidth = Param.number("Base Width", 60, { min: 10, max: 200, unit: "mm" });
const baseThickness = Param.number("Base Thickness", 5, { min: 1, max: 50, unit: "mm" });
const lowerPostDiam = Param.number("Lower Post Diameter", 20, { min: 5, max: 100, unit: "mm" });
const lowerPostHeight = Param.number("Lower Post Height", 13, { min: 5, max: 100, unit: "mm" });
const upperShoulderDiam = Param.number("Upper Shoulder Diameter", 14, { min: 5, max: 100, unit: "mm" });
const upperShoulderHeight = Param.number("Upper Shoulder Height", 22, { min: 5, max: 100, unit: "mm" });
const gearZStart = Param.number("Gear Z Start", 10, { min: 5, max: 100, unit: "mm" });
const gearHeight = Param.number("Gear Height", 8, { min: 2, max: 50, unit: "mm" });
const gearTipDiam = Param.number("Gear Tip Diameter", 40, { min: 10, max: 150, unit: "mm" });
const gearRootDiam = Param.number("Gear Root Diameter", 32, { min: 10, max: 150, unit: "mm" });
const gearToothWidth = Param.number("Gear Tooth Width", 3.14, { min: 0.5, max: 10, unit: "mm" });
const boreDiam = Param.number("Bore Diameter", 8, { min: 2, max: 50, unit: "mm" });
const holeDiam = Param.number("Mounting Hole Diameter", 6, { min: 1, max: 20, unit: "mm" });
const holeOffset = Param.number("Mounting Hole Offset", 22, { min: 5, max: 90, unit: "mm" });

// Derived geometric calculations
const lowerPostRadius = lowerPostDiam / 2;
const upperShoulderRadius = upperShoulderDiam / 2;
const gearRootRadius = gearRootDiam / 2;
const boreRadius = boreDiam / 2;
const holeRadius = holeDiam / 2;
const totalHeight = baseThickness + lowerPostHeight + upperShoulderHeight;

// 1. Create the square base plate
const basePlate = box(baseWidth, baseWidth, baseThickness).color("#5f87c6");

// 2. Create the lower section of the central post
const lowerPost = cylinder(lowerPostHeight, lowerPostRadius)
  .translate(0, 0, baseThickness)
  .color("#a0a0a0");

// 3. Create the upper retaining shoulder of the central post
const upperShoulder = cylinder(upperShoulderHeight, upperShoulderRadius)
  .translate(0, 0, baseThickness + lowerPostHeight)
  .color("#808080");

// 4. Construct a 16-tooth spur gear using a star profile of intersecting/unioned bars
const rootCyl = cylinder(gearHeight, gearRootRadius);
const t0 = box(gearTipDiam, gearToothWidth, gearHeight);
const t1 = box(gearTipDiam, gearToothWidth, gearHeight).rotate([0, 0, 1], 22.5);
const t2 = box(gearTipDiam, gearToothWidth, gearHeight).rotate([0, 0, 1], 45.0);
const t3 = box(gearTipDiam, gearToothWidth, gearHeight).rotate([0, 0, 1], 67.5);
const t4 = box(gearTipDiam, gearToothWidth, gearHeight).rotate([0, 0, 1], 90.0);
const t5 = box(gearTipDiam, gearToothWidth, gearHeight).rotate([0, 0, 1], 112.5);
const t6 = box(gearTipDiam, gearToothWidth, gearHeight).rotate([0, 0, 1], 135.0);
const t7 = box(gearTipDiam, gearToothWidth, gearHeight).rotate([0, 0, 1], 157.5);

// Union the star profiles to create the complete gear shape
const gear = rootCyl
  .union(t0)
  .union(t1)
  .union(t2)
  .union(t3)
  .union(t4)
  .union(t5)
  .union(t6)
  .union(t7)
  .translate(0, 0, gearZStart)
  .color("#ffd700");

// 5. Combine all positive solid features
const solidAssembly = basePlate
  .union(lowerPost)
  .union(upperShoulder)
  .union(gear);

// 6. Define the subtractive features (central bore and mounting holes)
// Note: We add a small Z-extension (+2 height, -1 offset) to guarantee a clean cut through surfaces
const centralBore = cylinder(totalHeight + 2, boreRadius).translate(0, 0, -1);
const h1 = cylinder(baseThickness + 2, holeRadius).translate(holeOffset, holeOffset, -1);
const h2 = cylinder(baseThickness + 2, holeRadius).translate(-holeOffset, holeOffset, -1);
const h3 = cylinder(baseThickness + 2, holeRadius).translate(holeOffset, -holeOffset, -1);
const h4 = cylinder(baseThickness + 2, holeRadius).translate(-holeOffset, -holeOffset, -1);

// 7. Perform subtraction to complete the idler gear assembly
const finalAssembly = solidAssembly
  .subtract(centralBore)
  .subtract(h1)
  .subtract(h2)
  .subtract(h3)
  .subtract(h4);

// Return the final shape mapped to the requested name
return {
  "an-idler-gear-assembly-consisting-of-a-s": finalAssembly,
};
