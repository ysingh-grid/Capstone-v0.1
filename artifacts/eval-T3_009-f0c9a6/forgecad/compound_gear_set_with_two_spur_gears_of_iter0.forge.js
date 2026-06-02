/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Compound gear set with two spur gears of different sizes mounted on a shared cylindrical hub, oriented along the Z axis, centered at the origin in XY. Includes a central bore through the full hub length.
 * Workflow ID : eval-T3_009-f0c9a6
 * Trace ID    : 6d59fd2d-74bf-4e27-8c94-409e091e132e
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 54.0 × 54.0 × 40.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 8 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_009-f0c9a6/step/T3_009_outer0_attempt0.step
 *   STL    : artifact://eval-T3_009-f0c9a6/stl/T3_009_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Use star-polygon (involute-approximation) tooth profiles for both gears: each tooth is modeled by alternating between tip radius and root radius points at evenly spaced angular intervals (one tip point per tooth, one root valley between teeth). Large gear: 24 teeth => 48 polygon points (alternating r=27mm at tooth tip, r=22mm at tooth root), angular spacing = 360/48 = 7.5 degrees per point. Small gear: 14 teeth => 28 polygon points (alternating r=16mm at tooth tip, r=13mm at tooth root), angular spacing = 360/28 = ~12.857 degrees per point. Each gear body should be extruded from its Z start to Z end, unioned with the hub cylinder. The 8mm bore should be subtracted (cut) through the full length of the hub (Z=0 to Z=40) along the Z axis. All geometry is centered at X=0, Y=0. Ensure the hub cylinder (r=8mm) fully connects both gears. The bore must cleanly pass through hub and both gear bodies.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Compound Gear Set - Two spur gears on a shared hub with central bore
 * Large gear: 24 teeth, tip r=27mm, root r=22mm, Z=3 to Z=13
 * Small gear: 14 teeth, tip r=16mm, root r=13mm, Z=20 to Z=30
 * Hub: 16mm diameter, Z=0 to Z=40, bore 8mm diameter
 */

// Parameters
const hubDiameter    = Param.number("Hub Diameter",    16,  { min: 8,   max: 40,  unit: "mm" });
const hubLength      = Param.number("Hub Length",      40,  { min: 20,  max: 80,  unit: "mm" });
const boreDiameter   = Param.number("Bore Diameter",   8,   { min: 2,   max: 14,  unit: "mm" });

const lgTipR         = Param.number("Large Tip Radius",   27,  { min: 15,  max: 50,  unit: "mm" });
const lgRootR        = Param.number("Large Root Radius",  22,  { min: 10,  max: 45,  unit: "mm" });
const lgFaceWidth    = Param.number("Large Face Width",   10,  { min: 4,   max: 30,  unit: "mm" });
const lgZStart       = Param.number("Large Gear Z Start", 3,   { min: 0,   max: 20,  unit: "mm" });

const smTipR         = Param.number("Small Tip Radius",   16,  { min: 8,   max: 30,  unit: "mm" });
const smRootR        = Param.number("Small Root Radius",  13,  { min: 6,   max: 25,  unit: "mm" });
const smFaceWidth    = Param.number("Small Face Width",   10,  { min: 4,   max: 30,  unit: "mm" });
const smZStart       = Param.number("Small Gear Z Start", 20,  { min: 10,  max: 35,  unit: "mm" });

// Hub cylinder: centered on XY, height=hubLength, then translate to sit Z=0..hubLength
const hubCyl = cylinder(hubLength, hubDiameter / 2)
    .translate(0, 0, hubLength / 2);

// Large gear approximation using 12 cylinders at tooth tips (24 teeth / 2 = 12 pairs)
// Each tooth modeled as a small cylinder at tip radius position
// Tooth body = cylinder at root radius (gear disk) + tip bumps

// Large gear root disk (22mm root radius, 10mm face)
const lgRootDisk = cylinder(lgFaceWidth, lgRootR)
    .translate(0, 0, lgZStart + lgFaceWidth / 2);

// Large gear: 24 tooth-tip cylinders arranged radially
// Each tip bump: small cylinder placed at tip radius, angular spacing = 360/24 = 15 deg
const lgToothR  = (lgTipR - lgRootR) / 2;   // radial height of tooth / 2 => bump radius
const lgBumpOffset = lgRootR + lgToothR;     // center of bump from origin

const lgT0  = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2);
const lgT1  = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 15);
const lgT2  = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 30);
const lgT3  = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 45);
const lgT4  = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 60);
const lgT5  = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 75);
const lgT6  = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 90);
const lgT7  = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 105);
const lgT8  = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 120);
const lgT9  = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 135);
const lgT10 = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 150);
const lgT11 = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 165);
const lgT12 = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 180);
const lgT13 = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 195);
const lgT14 = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 210);
const lgT15 = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 225);
const lgT16 = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 240);
const lgT17 = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 255);
const lgT18 = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 270);
const lgT19 = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 285);
const lgT20 = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 300);
const lgT21 = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 315);
const lgT22 = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 330);
const lgT23 = cylinder(lgFaceWidth, lgToothR).translate(lgBumpOffset, 0, lgZStart + lgFaceWidth / 2).rotate([0,0,1], 345);

// Union large gear teeth in groups to stay under boolean op limit
const lgTeethA = lgRootDisk.union(lgT0).union(lgT1).union(lgT2).union(lgT3)
    .union(lgT4).union(lgT5);
const lgTeethB = lgT6.union(lgT7).union(lgT8).union(lgT9).union(lgT10).union(lgT11);
const lgTeethC = lgT12.union(lgT13).union(lgT14).union(lgT15).union(lgT16).union(lgT17);
const lgTeethD = lgT18.union(lgT19).union(lgT20).union(lgT21).union(lgT22).union(lgT23);
const lgGear   = lgTeethA.union(lgTeethB).union(lgTeethC).union(lgTeethD);

// Small gear root disk (13mm root radius, 10mm face)
const smRootDisk = cylinder(smFaceWidth, smRootR)
    .translate(0, 0, smZStart + smFaceWidth / 2);

// Small gear: 14 tooth-tip cylinders, angular spacing = 360/14 ≈ 25.714 deg
const smToothR      = (smTipR - smRootR) / 2;
const smBumpOffset  = smRootR + smToothR;
const smStep        = 360 / 14;

const smT0  = cylinder(smFaceWidth, smToothR).translate(smBumpOffset, 0, smZStart + smFaceWidth / 2);
const smT1  = cylinder(smFaceWidth, smToothR).translate(smBumpOffset, 0, smZStart + smFaceWidth / 2).rotate([0,0,1], smStep * 1);
const smT2  = cylinder(smFaceWidth, smToothR).translate(smBumpOffset, 0, smZStart + smFaceWidth / 2).rotate([0,0,1], smStep * 2);
const smT3  = cylinder(smFaceWidth, smToothR).translate(smBumpOffset, 0, smZStart + smFaceWidth / 2).rotate([0,0,1], smStep * 3);
const smT4  = cylinder(smFaceWidth, smToothR).translate(smBumpOffset, 0, smZStart + smFaceWidth / 2).rotate([0,0,1], smStep * 4);
const smT5  = cylinder(smFaceWidth, smToothR).translate(smBumpOffset, 0, smZStart + smFaceWidth / 2).rotate([0,0,1], smStep * 5);
const smT6  = cylinder(smFaceWidth, smToothR).translate(smBumpOffset, 0, smZStart + smFaceWidth / 2).rotate([0,0,1], smStep * 6);
const smT7  = cylinder(smFaceWidth, smToothR).translate(smBumpOffset, 0, smZStart + smFaceWidth / 2).rotate([0,0,1], smStep * 7);
const smT8  = cylinder(smFaceWidth, smToothR).translate(smBumpOffset, 0, smZStart + smFaceWidth / 2).rotate([0,0,1], smStep * 8);
const smT9  = cylinder(smFaceWidth, smToothR).translate(smBumpOffset, 0, smZStart + smFaceWidth / 2).rotate([0,0,1], smStep * 9);
const smT10 = cylinder(smFaceWidth, smToothR).translate(smBumpOffset, 0, smZStart + smFaceWidth / 2).rotate([0,0,1], smStep * 10);
const smT11 = cylinder(smFaceWidth, smToothR).translate(smBumpOffset, 0, smZStart + smFaceWidth / 2).rotate([0,0,1], smStep * 11);
const smT12 = cylinder(smFaceWidth, smToothR).translate(smBumpOffset, 0, smZStart + smFaceWidth / 2).rotate([0,0,1], smStep * 12);
const smT13 = cylinder(smFaceWidth, smToothR).translate(smBumpOffset, 0, smZStart + smFaceWidth / 2).rotate([0,0,1], smStep * 13);

// Union small gear teeth in groups
const smTeethA = smRootDisk.union(smT0).union(smT1).union(smT2).union(smT3);
const smTeethB = smT4.union(smT5).union(smT6).union(smT7);
const smTeethC = smT8.union(smT9).union(smT10).union(smT11);
const smTeethD = smT12.union(smT13);
const smGear   = smTeethA.union(smTeethB).union(smTeethC).union(smTeethD);

// Combine hub with both gears
const gearBody = hubCyl.union(lgGear).union(smGear);

// Subtract central bore through full hub length
const bore = cylinder(hubLength + 2, boreDiameter / 2)
    .translate(0, 0, hubLength / 2);
const finalShape = gearBody.subtract(bore)
    .color("#7a9cbf");

return {
    "compound-gear-set-with-two-spur-gears-of": finalShape,
};
