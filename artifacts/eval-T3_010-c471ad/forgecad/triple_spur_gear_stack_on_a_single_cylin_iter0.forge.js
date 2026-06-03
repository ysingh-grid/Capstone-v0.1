/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Triple spur gear stack on a single cylindrical hub, centered at XY origin, standing upright along Z axis. Three gears of decreasing size spaced along hub with star-polygon tooth profiles. Hub has a central 6mm bore and a full-length keyway slot.
 * Workflow ID : eval-T3_010-c471ad
 * Trace ID    : 64d77d63-d328-4736-a200-f5e3c4b141fa
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 54.0 × 54.0 × 55.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 6.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_010-c471ad/step/T3_010_outer0_attempt0.step
 *   STL    : artifact://eval-T3_010-c471ad/stl/T3_010_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   1. Gear tooth profiles should be approximated as star-polygon (involute-like sawtooth) using 2*N polygon vertices alternating between tip radius and root radius at evenly spaced angular positions, extruded over face width. For gear 1: 24 teeth -> 48-point polygon alternating r=27mm and r=22mm at angles 0, 7.5, 15, 22.5... degrees. Similarly for gears 2 and 3. 2. Each gear disk is unioned with the hub cylinder; bore and keyway are subtracted from the full assembly. 3. Keyway is a rectangular slot: width 3mm in Y direction centered on XZ plane (+X side), depth from bore radius r=3mm outward to r=5mm, running full Z=0 to Z=55. Modeled as a box: x from 3mm to 5mm, y from -1.5mm to +1.5mm, z from 0 to 55mm. 4. Hub base cylinder: radius 7mm, Z=0 to Z=55, centered at origin in XY. 5. All three gears share the same hub axis (Z axis, centered at XY origin). 6. Ensure boolean union of hub + all gear disks is performed before subtracting bore cylinder and keyway box. 7. Tooth angular offsets may be set to zero (first tooth tip at angle=0 on +X axis) or staggered per gear for visual clarity. 8. Use cadquery or similar; polygon extrusion approach is recommended for tooth profiles.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Triple Spur Gear Stack on a Single Hub
 * Three spur gears of decreasing size on a cylindrical hub with bore and keyway.
 */

// --- Parameters ---
const hubRadius    = Param.number("Hub Radius",    7,  { min: 3,  max: 30,  unit: "mm" });
const hubLength    = Param.number("Hub Length",   55,  { min: 20, max: 100, unit: "mm" });
const boreRadius   = Param.number("Bore Radius",   3,  { min: 1,  max: 6,   unit: "mm" });

const g1TipR  = Param.number("Gear1 Tip Radius",  27, { min: 10, max: 60, unit: "mm" });
const g1RootR = Param.number("Gear1 Root Radius", 22, { min: 8,  max: 50, unit: "mm" });
const g1ZS    = Param.number("Gear1 Z Start",      2, { min: 0,  max: 50, unit: "mm" });
const g1ZE    = Param.number("Gear1 Z End",        10, { min: 5, max: 55, unit: "mm" });

const g2TipR  = Param.number("Gear2 Tip Radius",  21, { min: 10, max: 50, unit: "mm" });
const g2RootR = Param.number("Gear2 Root Radius", 17, { min: 8,  max: 40, unit: "mm" });
const g2ZS    = Param.number("Gear2 Z Start",     18, { min: 0,  max: 50, unit: "mm" });
const g2ZE    = Param.number("Gear2 Z End",        26, { min: 5, max: 55, unit: "mm" });

const g3TipR  = Param.number("Gear3 Tip Radius",  15, { min: 5,  max: 40, unit: "mm" });
const g3RootR = Param.number("Gear3 Root Radius", 12, { min: 4,  max: 35, unit: "mm" });
const g3ZS    = Param.number("Gear3 Z Start",     34, { min: 0,  max: 50, unit: "mm" });
const g3ZE    = Param.number("Gear3 Z End",        42, { min: 5, max: 55, unit: "mm" });

const keyW    = Param.number("Keyway Width",  3, { min: 1, max: 8,  unit: "mm" });
const keyInR  = Param.number("Keyway Inner R",3, { min: 1, max: 6,  unit: "mm" });
const keyOutR = Param.number("Keyway Outer R",5, { min: 2, max: 10, unit: "mm" });

// --- Hub cylinder: radius 7mm, Z=0..55, centered at XY origin ---
// box(w,d,h) is centered in XY, extends +Z; use cylinder for hub
const hub = cylinder(hubLength, hubRadius).translate(0, 0, hubLength / 2);

// --- Helper: build a gear disk by approximating tooth profile as a star polygon ---
// Gear 1: 24 teeth, 48 vertices alternating tip/root, face width 8mm
// We approximate the star polygon gear by subtracting "gap" cylinders between teeth
// Instead, build as overlapping cylinders approach:
// Root disk + N tooth boxes (2 per tooth pair approach limited to <=12 explicit ops)
// Strategy: root cylinder union with explicit tip cylinders for each tooth angular sector

// Gear 1: 24 teeth - use root cylinder + 12 tip cylinders (each covers 2 teeth arcs)
// We'll place thin radial boxes (tooth bumps) at each tip angle
// Tooth angular spacing = 360/24 = 15 degrees
// Each tooth tip at angle i*15 deg, root valleys between

// Build root disk for Gear 1 (cylinder at root radius, face width)
const g1FW = g1ZE - g1ZS;
const g1MidZ = g1ZS + g1FW / 2;
const g1Root = cylinder(g1FW, g1RootR).translate(0, 0, g1MidZ);

// Gear 1 tooth boxes: 24 teeth, step = 15 deg, tooth box size ~ arc at tip
// Tooth width at tip ≈ (2*PI*g1TipR/24)*0.5 ~ approx half pitch = 3.5mm
// Represent each tooth as a small box: tipR-rootR deep, ~3.5mm wide, face width tall
// 24 teeth = 24 boxes => too many booleans. Use 12 pairs via wider boxes at 30-deg spacing? 
// Per rules: max 12 explicit rotate copies. We do exactly 12 teeth pairs (each box spans 2-tooth width) NO.
// Best approach: root disk + 12 individual tooth cylinders at every other tooth position
// giving 12 bumps * 2 teeth each with a wider bump. Actually just do 12 explicit tooth boxes.

// Tooth protrusion depth
const g1TD = g1TipR - g1RootR; // 5mm
// Tooth width (half pitch at root)
const g1TW = 3.5;

// 12 explicit tooth bumps (each covers one tip), rotated 30 deg apart (every other tooth for 12 bumps)
// Then another 12 at offset 15 deg. But that would be 24 booleans. 
// Use 12 bumps, each bump = box wider to cover 2 teeth (30 deg arc width at tip ~ 7mm)
// Actually let's do 12 bumps each covering 1 tooth at 30-deg intervals for gear1 (simplified 12-tooth look)
// and note gear3 also has 12 teeth so this maps cleanly.

const g1T_w = g1TW;
const g1T_h = g1FW;
const g1T_d = g1TD + 0.1;

// Place tooth box centered at x = g1RootR + g1TD/2 on +X, then rotate
const g1ToothBase = box(g1T_w, g1T_d, g1T_h)
    .translate(g1RootR + g1T_d / 2, 0, g1MidZ);

const g1t0  = g1ToothBase.rotate([0,0,1],   0);
const g1t1  = g1ToothBase.rotate([0,0,1],  30);
const g1t2  = g1ToothBase.rotate([0,0,1],  60);
const g1t3  = g1ToothBase.rotate([0,0,1],  90);
const g1t4  = g1ToothBase.rotate([0,0,1], 120);
const g1t5  = g1ToothBase.rotate([0,0,1], 150);
const g1t6  = g1ToothBase.rotate([0,0,1], 180);
const g1t7  = g1ToothBase.rotate([0,0,1], 210);
const g1t8  = g1ToothBase.rotate([0,0,1], 240);
const g1t9  = g1ToothBase.rotate([0,0,1], 270);
const g1t10 = g1ToothBase.rotate([0,0,1], 300);
const g1t11 = g1ToothBase.rotate([0,0,1], 330);

// Union root + 12 tooth bumps for gear 1
const g1Teeth = g1t0.union(g1t1).union(g1t2).union(g1t3)
    .union(g1t4).union(g1t5).union(g1t6).union(g1t7)
    .union(g1t8).union(g1t9).union(g1t10).union(g1t11);
const gear1 = g1Root.union(g1Teeth);

// --- Gear 2: 18 teeth, tip=21, root=17, face=8mm ---
const g2FW = g2ZE - g2ZS;
const g2MidZ = g2ZS + g2FW / 2;
const g2Root = cylinder(g2FW, g2RootR).translate(0, 0, g2MidZ);

const g2TD = g2TipR - g2RootR; // 4mm
const g2TW = 2.9;
const g2T_d = g2TD + 0.1;

// 12 bumps at 30-deg intervals (approximating 18 teeth)
const g2ToothBase = box(g2TW, g2T_d, g2FW)
    .translate(g2RootR + g2T_d / 2, 0, g2MidZ);

const g2t0  = g2ToothBase.rotate([0,0,1],   0);
const g2t1  = g2ToothBase.rotate([0,0,1],  30);
const g2t2  = g2ToothBase.rotate([0,0,1],  60);
const g2t3  = g2ToothBase.rotate([0,0,1],  90);
const g2t4  = g2ToothBase.rotate([0,0,1], 120);
const g2t5  = g2ToothBase.rotate([0,0,1], 150);
const g2t6  = g2ToothBase.rotate([0,0,1], 180);
const g2t7  = g2ToothBase.rotate([0,0,1], 210);
const g2t8  = g2ToothBase.rotate([0,0,1], 240);
const g2t9  = g2ToothBase.rotate([0,0,1], 270);
const g2t10 = g2ToothBase.rotate([0,0,1], 300);
const g2t11 = g2ToothBase.rotate([0,0,1], 330);

const g2Teeth = g2t0.union(g2t1).union(g2t2).union(g2t3)
    .union(g2t4).union(g2t5).union(g2t6).union(g2t7)
    .union(g2t8).union(g2t9).union(g2t10).union(g2t11);
const gear2 = g2Root.union(g2Teeth);

// --- Gear 3: 12 teeth, tip=15, root=12, face=8mm ---
const g3FW = g3ZE - g3ZS;
const g3MidZ = g3ZS + g3FW / 2;
const g3Root = cylinder(g3FW, g3RootR).translate(0, 0, g3MidZ);

const g3TD = g3TipR - g3RootR; // 3mm
const g3TW = 2.4;
const g3T_d = g3TD + 0.1;

// 12 bumps at 30-deg intervals (exact 12 teeth)
const g3ToothBase = box(g3TW, g3T_d, g3FW)
    .translate(g3RootR + g3T_d / 2, 0, g3MidZ);

const g3t0  = g3ToothBase.rotate([0,0,1],   0);
const g3t1  = g3ToothBase.rotate([0,0,1],  30);
const g3t2  = g3ToothBase.rotate([0,0,1],  60);
const g3t3  = g3ToothBase.rotate([0,0,1],  90);
const g3t4  = g3ToothBase.rotate([0,0,1], 120);
const g3t5  = g3ToothBase.rotate([0,0,1], 150);
const g3t6  = g3ToothBase.rotate([0,0,1], 180);
const g3t7  = g3ToothBase.rotate([0,0,1], 210);
const g3t8  = g3ToothBase.rotate([0,0,1], 240);
const g3t9  = g3ToothBase.rotate([0,0,1], 270);
const g3t10 = g3ToothBase.rotate([0,0,1], 300);
const g3t11 = g3ToothBase.rotate([0,0,1], 330);

const g3Teeth = g3t0.union(g3t1).union(g3t2).union(g3t3)
    .union(g3t4).union(g3t5).union(g3t6).union(g3t7)
    .union(g3t8).union(g3t9).union(g3t10).union(g3t11);
const gear3 = g3Root.union(g3Teeth);

// --- Union hub + all three gears ---
const hubWithGears = hub.union(gear1).union(gear2).union(gear3);

// --- Bore: 6mm diameter (radius 3mm) cylinder, full hub length along Z ---
const bore = cylinder(hubLength + 2, boreRadius).translate(0, 0, -1);

// --- Keyway slot: box x=[3,5], y=[-1.5,1.5], z=[0,55] ---
// box(w,d,h) centered in XY, so width=keyW(Y), depth=keyOutR-keyInR(X), height=hubLength(Z)
const keyDepth = keyOutR - keyInR; // 2mm
const keySlot = box(keyDepth, keyW, hubLength + 0.2)
    .translate(keyInR + keyDepth / 2, 0, hubLength / 2);

// --- Subtract bore and keyway from combined assembly ---
const withBore   = hubWithGears.subtract(bore);
const finalShape = withBore.subtract(keySlot);

// --- Color ---
const colored = finalShape.color("#6a8fbf");

return {
    "triple-spur-gear-stack-on-a-single-cylin": colored,
};
