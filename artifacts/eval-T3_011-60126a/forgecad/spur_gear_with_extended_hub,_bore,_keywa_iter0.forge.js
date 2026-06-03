/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Spur gear with extended hub, bore, keyway, and radial set screw hole. Gear body is 10mm thick with 20-tooth star-polygon profile; hub extends 20mm above gear face along Z axis.
 * Workflow ID : eval-T3_011-60126a
 * Trace ID    : 7cede5f8-53a7-4525-b95c-91c3c7fc9aae
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 48.0 × 48.0 × 30.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_011-60126a/step/T3_011_outer0_attempt0.step
 *   STL    : artifact://eval-T3_011-60126a/stl/T3_011_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   1. Gear tooth profile: use a star-polygon (astroid) interpolation between tip radius 24mm and root radius 20mm for 20 teeth; each tooth spans 18 degrees, with tip at tooth center and root at interdental valley. A sinusoidal or trapezoidal polar profile is acceptable approximation. 2. Hub is a plain cylinder (not tapered) from Z=0 to Z=30, outer diameter 16mm, centered at origin in XY. 3. Bore is a through-cylinder of diameter 10mm (radius 5mm), centered at origin, running Z=0 to Z=30; remove from combined gear+hub solid. 4. Keyway: a rectangular slot cut on the +X side of the bore. It spans the full 30mm in Z, is 4mm wide in Y (centered on Y=0), and extends radially from bore surface (r=5mm) outward to r=7.5mm (2.5mm depth). Implement as box subtraction: X from 5mm to 7.5mm, Y from -2mm to +2mm, Z from 0 to 30. 5. Set screw hole: 4mm diameter cylinder along X axis at Z=20mm, passing fully through the hub (from X=-8mm to X=+8mm), cutting through both hub walls and the keyway region. Center of hole at (0, 0, 20). 6. Construct as: union(gear_body, hub) minus bore minus keyway minus set_screw_hole. 7. Gear body bottom and hub bottom are coplanar at Z=0. Part sits upright with Z as the primary axis.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Spur gear with extended hub, bore, keyway, and radial set screw hole.
 * 20 teeth, 48mm tip diameter, 40mm root diameter, 10mm thick gear body.
 * Hub 16mm OD extends Z=0 to Z=30. Bore 10mm dia. Keyway on +X. Set screw at Z=20.
 */

// Parameters
const tipRadius    = Param.number("Tip Radius",    24,  { min: 10, max: 100, unit: "mm" });
const rootRadius   = Param.number("Root Radius",   20,  { min: 8,  max: 90,  unit: "mm" });
const gearThick    = Param.number("Gear Thickness",10,  { min: 2,  max: 50,  unit: "mm" });
const hubOD        = Param.number("Hub OD",        16,  { min: 8,  max: 60,  unit: "mm" });
const hubHeight    = Param.number("Hub Height",    30,  { min: 5,  max: 100, unit: "mm" });
const boreDia      = Param.number("Bore Diameter", 10,  { min: 2,  max: 40,  unit: "mm" });
const keyWidth     = Param.number("Keyway Width",   4,  { min: 1,  max: 20,  unit: "mm" });
const keyDepth     = Param.number("Keyway Depth",   2.5,{ min: 0.5,max: 10,  unit: "mm" });
const setScrewDia  = Param.number("Set Screw Dia",  4,  { min: 1,  max: 20,  unit: "mm" });
const setScrewZ    = Param.number("Set Screw Z",   20,  { min: 1,  max: 29,  unit: "mm" });

// Derived values
const numTeeth     = 20;
const boreRadius   = boreDia / 2;
const hubRadius    = hubOD / 2;

// --- Gear body: approximate 20-tooth star polygon via boolean ops on cylinders + tooth boxes ---
// Base disk at root radius
const gearBase = cylinder(gearThick, rootRadius).translate(0, 0, gearThick / 2);

// Each tooth is a box approximating the tooth tip profile
// tooth spans 18 deg each; tip width approximated as arc-width at tip radius
// We use small cylinders at tip positions to create rounded tooth tips
// Tooth height = tipRadius - rootRadius = 4mm
const toothH = tipRadius - rootRadius;   // 4mm
const toothW = 2 * tipRadius * Math.sin(Math.PI / numTeeth) * 0.7; // approximate tooth width
const toothBox = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2);

// 20 teeth placed radially (explicit rotations, no loop)
const t0  = toothBox;
const t1  = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1],  18);
const t2  = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1],  36);
const t3  = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1],  54);
const t4  = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1],  72);
const t5  = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1],  90);
const t6  = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1], 108);
const t7  = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1], 126);
const t8  = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1], 144);
const t9  = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1], 162);
const t10 = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1], 180);
const t11 = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1], 198);
const t12 = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1], 216);
const t13 = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1], 234);
const t14 = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1], 252);
const t15 = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1], 270);
const t16 = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1], 288);
const t17 = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1], 306);
const t18 = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1], 324);
const t19 = box(toothW, toothH, gearThick).translate(0, rootRadius + toothH / 2, gearThick / 2).rotate([0, 0, 1], 342);

// Union teeth in groups of 4-5 to stay within op budget
const teeth_A = t0.union(t1).union(t2).union(t3);
const teeth_B = t4.union(t5).union(t6).union(t7);
const teeth_C = t8.union(t9).union(t10).union(t11);
const teeth_D = t12.union(t13).union(t14).union(t15);
const teeth_E = t16.union(t17).union(t18).union(t19);

// Combine teeth pairs to reduce op depth
const teeth_AB = teeth_A.union(teeth_B);
const teeth_CD = teeth_C.union(teeth_D);
const allTeeth = teeth_AB.union(teeth_CD).union(teeth_E);

// Full gear body = root disk + all teeth
const gearBody = gearBase.union(allTeeth);

// --- Hub: plain cylinder from Z=0 to Z=30 ---
const hub = cylinder(hubHeight, hubRadius).translate(0, 0, hubHeight / 2);

// --- Union gear body and hub ---
const gearPlusHub = gearBody.union(hub);

// --- Central bore: cylinder along Z, full hub height ---
const bore = cylinder(hubHeight + 2, boreRadius).translate(0, 0, (hubHeight + 2) / 2 - 1);

// --- Keyway slot: box on +X side of bore ---
// X: from boreRadius to boreRadius+keyDepth, Y: ±keyWidth/2, Z: full hub height
const keyXmin = boreRadius;
const keyXmax = boreRadius + keyDepth;
const keyXcen = (keyXmin + keyXmax) / 2;
const keyway = box(keyDepth, keyWidth, hubHeight + 2)
    .translate(keyXcen, 0, hubHeight / 2);

// --- Set screw hole: 4mm cylinder along X axis at Z=setScrewZ ---
const setScrewLen = hubOD + 2;
const setScrew = cylinder(setScrewLen, setScrewDia / 2)
    .rotate([0, 1, 0], 90)
    .translate(0, 0, setScrewZ);

// --- Final assembly: subtract bore, keyway, set screw hole ---
const withBore     = gearPlusHub.subtract(bore);
const withKeyway   = withBore.subtract(keyway);
const finalShape   = withKeyway.subtract(setScrew).color("#5f87c6");

return {
    "spur-gear-with-extended-hub,-bore,-keywa": finalShape,
};
