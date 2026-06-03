/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Spur gear on a stepped shaft, standing upright along Z axis, centered at origin in XY. Three-section stepped shaft with integrated 20-tooth spur gear at middle section, through bore, and keyway slot.
 * Workflow ID : eval-T3_008-08728a
 * Trace ID    : 9630b9fe-fe01-48e1-be9f-34237ccc211f
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 44.0 × 44.0 × 55.0 mm
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
 *   STEP   : artifact://eval-T3_008-08728a/step/T3_008_outer0_attempt0.step
 *   STL    : artifact://eval-T3_008-08728a/stl/T3_008_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   1. The gear tooth profile uses a star-polygon approximation: 40 vertices alternating between tip radius 22mm and root radius 18mm, evenly spaced at 9-degree angular intervals (360/40=9 degrees per vertex), creating 20 tooth tips and 20 root valleys. The polygon is extruded from Z=20 to Z=35. 2. The shaft is built as union of three cylinders; the gear profile is unioned at the middle section. 3. The through bore (cylinder D=8mm, full Z length) is subtracted from the entire assembly. 4. The keyway is a rectangular box slot: width 3mm in Y direction, centered on X axis (Y from -1.5 to +1.5), extending in X from +4mm to +7mm (radial depth 3mm outward from bore wall at R=4), and spanning Z=20 to Z=35. Subtract this box from the assembly. 5. Ensure the star-polygon gear vertices are correctly oriented so tooth tips align symmetrically; first vertex at angle=0 (along +X) at tip radius 22mm recommended. 6. Volume estimate accounts for shaft minus bore minus keyway plus gear tooth material above the gear seat cylinder baseline.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Spur Gear on Stepped Shaft
 * 20-tooth spur gear integrated at middle section of a 3-step shaft
 * with through bore and keyway slot.
 */

// --- Parameters ---
const lowerJournalDia    = Param.number("Lower Journal Diameter", 15,  { min: 5,  max: 50,  unit: "mm" });
const lowerJournalLen    = Param.number("Lower Journal Length",   20,  { min: 5,  max: 100, unit: "mm" });
const gearSeatDia        = Param.number("Gear Seat Diameter",     20,  { min: 5,  max: 100, unit: "mm" });
const gearSeatLen        = Param.number("Gear Seat Length",       15,  { min: 5,  max: 100, unit: "mm" });
const upperJournalDia    = Param.number("Upper Journal Diameter", 15,  { min: 5,  max: 50,  unit: "mm" });
const upperJournalLen    = Param.number("Upper Journal Length",   20,  { min: 5,  max: 100, unit: "mm" });
const boreDia            = Param.number("Bore Diameter",           8,  { min: 2,  max: 30,  unit: "mm" });
const gearTipRadius      = Param.number("Gear Tip Radius",        22,  { min: 10, max: 80,  unit: "mm" });
const gearRootRadius     = Param.number("Gear Root Radius",       18,  { min: 8,  max: 70,  unit: "mm" });
const keywaWidth         = Param.number("Keyway Width Y",          3,  { min: 1,  max: 10,  unit: "mm" });
const keywaInnerR        = Param.number("Keyway Inner Radius",     4,  { min: 1,  max: 20,  unit: "mm" });
const keywaOuterR        = Param.number("Keyway Outer Radius",     7,  { min: 2,  max: 25,  unit: "mm" });

// --- Derived values ---
const lowerJournalR   = lowerJournalDia / 2;
const gearSeatR       = gearSeatDia / 2;
const upperJournalR   = upperJournalDia / 2;
const boreR           = boreDia / 2;

// Z positions
const z0  = 0;
const z1  = lowerJournalLen;                           // 20
const z2  = lowerJournalLen + gearSeatLen;             // 35
const z3  = lowerJournalLen + gearSeatLen + upperJournalLen; // 55

// --- Shaft cylinders (box() centered on XY, extends +Z; translate to correct Z) ---
// Lower journal: Z=0 to Z=20
const lowerJournal = cylinder(lowerJournalLen, lowerJournalR)
    .translate(0, 0, z0 + lowerJournalLen / 2);

// Middle gear seat: Z=20 to Z=35
const gearSeat = cylinder(gearSeatLen, gearSeatR)
    .translate(0, 0, z1 + gearSeatLen / 2);

// Upper journal: Z=35 to Z=55
const upperJournal = cylinder(upperJournalLen, upperJournalR)
    .translate(0, 0, z2 + upperJournalLen / 2);

// --- Union shaft sections ---
const shaft = lowerJournal.union(gearSeat).union(upperJournal);

// --- Spur gear star-polygon teeth (20 teeth, 40 vertices alternating tip/root) ---
// Each vertex at 9-degree increments; even indices at tipRadius, odd at rootRadius
// We approximate the extruded star polygon as explicit tooth boxes to stay within
// boolean-op budget. 20 teeth: use 20 individual thin box-like tooth protrusions.
// Each tooth: a small box at tip radius, rotated around Z by tooth_angle * i.
// Tooth geometry: approximate each tooth as a radially-oriented box.

// Tooth box dimensions approximation from star polygon geometry:
// Arc length between tip vertices = 2*pi*tipR/20 ~= 6.91mm; tooth width ~half that ~3.5mm
// Tooth height = tipR - rootR = 4mm
// Face width = gearSeatLen = 15mm

const toothHeight  = gearTipRadius - gearRootRadius;          // 4 mm radial
const toothWidth   = 2 * gearTipRadius * Math.sin(Math.PI / 20); // chord width at tip
const toothLen     = gearSeatLen;                              // 15 mm face

// Center of each tooth box sits at (gearRootRadius + toothHeight/2) from axis
const toothCenterR = gearRootRadius + toothHeight / 2;
const gearFaceZ    = z1 + gearSeatLen / 2;

// Create 20 tooth boxes — explicit rotate calls (no loops)
const toothBase = box(toothWidth, toothLen, toothHeight)
    .translate(toothCenterR, 0, gearFaceZ);

const t0  = toothBase;
const t1  = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 18);
const t2  = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 36);
const t3  = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 54);
const t4  = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 72);
const t5  = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 90);
const t6  = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 108);
const t7  = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 126);
const t8  = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 144);
const t9  = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 162);
const t10 = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 180);
const t11 = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 198);
const t12 = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 216);
const t13 = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 234);
const t14 = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 252);
const t15 = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 270);
const t16 = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 288);
const t17 = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 306);
const t18 = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 324);
const t19 = box(toothWidth, toothLen, toothHeight).translate(toothCenterR, 0, gearFaceZ).rotate([0, 0, 1], 342);

// Union teeth in balanced groups to stay within boolean budget
const teeth_a = t0.union(t1).union(t2).union(t3);
const teeth_b = t4.union(t5).union(t6).union(t7);
const teeth_c = t8.union(t9).union(t10).union(t11);
const teeth_d = t12.union(t13).union(t14).union(t15);
const teeth_e = t16.union(t17).union(t18).union(t19);
const allTeeth = teeth_a.union(teeth_b).union(teeth_c).union(teeth_d).union(teeth_e);

// --- Union shaft + teeth ---
const shaftWithGear = shaft.union(allTeeth);

// --- Through bore: D=8mm, full length Z=0 to Z=55 ---
const totalLen = z3;
const bore = cylinder(totalLen, boreR)
    .translate(0, 0, totalLen / 2);

// --- Keyway slot: 3mm wide (Y), from X=+4 to X=+7, Z=20 to Z=35 ---
const keywaXLen  = keywaOuterR - keywaInnerR;   // 3mm radial depth
const keywaCtrX  = keywaInnerR + keywaXLen / 2; // center X = 5.5mm
const keywaCtrZ  = z1 + gearSeatLen / 2;        // center Z = 27.5mm

const keyway = box(keywaXLen, keywaWidth, gearSeatLen)
    .translate(keywaCtrX, 0, keywaCtrZ);

// --- Subtract bore and keyway ---
const finalShape = shaftWithGear
    .subtract(bore)
    .subtract(keyway)
    .color("#7a9fc2");

return {
    "spur-gear-on-a-stepped-shaft,-standing-u": finalShape,
};
