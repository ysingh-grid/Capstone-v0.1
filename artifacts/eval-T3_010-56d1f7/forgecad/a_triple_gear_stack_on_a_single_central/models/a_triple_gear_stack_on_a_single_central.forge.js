/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A triple gear stack on a single central hub with an internal keyway, aligned along the Z-axis.
 * Workflow ID : eval-T3_010-56d1f7
 * Trace ID    : ea1437f9-77fa-484e-83d2-753d0e3205d8
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
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_010-56d1f7/step/T3_010_outer0_attempt1.step
 *   STL    : artifact://eval-T3_010-56d1f7/stl/T3_010_outer0_attempt1.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   To model the star-polygon gears, construct a 2D wire of 2N vertices alternating between the tip radius and root radius. Extrude each gear individually, union them with the main hub, and finally perform a single subtraction for the central bore and the keyway to ensure clean internal cuts. The keyway slot spans from X=3 to X=5, and Y=-1.5 to Y=1.5.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file triple_gear_stack.forge.js
 * @description A triple gear stack on a single central hub with an internal keyway, aligned along the Z-axis.
 */

// --- Design Parameters ---
const hubDia = Param.number("Hub Diameter", 14, { min: 10, max: 30, unit: "mm" });
const hubLen = Param.number("Hub Length", 55, { min: 40, max: 100, unit: "mm" });
const boreDia = Param.number("Bore Diameter", 6, { min: 4, max: 15, unit: "mm" });
const gearWidth = Param.number("Gear Face Width", 8, { min: 4, max: 15, unit: "mm" });

const keyWidth = Param.number("Keyway Width", 3, { min: 1, max: 6, unit: "mm" });
const keyDepth = Param.number("Keyway Depth", 2, { min: 1, max: 5, unit: "mm" });

const g1Tip = Param.number("Gear 1 Tip Dia", 54, { min: 40, max: 80, unit: "mm" });
const g1Root = Param.number("Gear 1 Root Dia", 44, { min: 30, max: 70, unit: "mm" });

const g2Tip = Param.number("Gear 2 Tip Dia", 42, { min: 30, max: 60, unit: "mm" });
const g2Root = Param.number("Gear 2 Root Dia", 34, { min: 20, max: 50, unit: "mm" });

const g3Tip = Param.number("Gear 3 Tip Dia", 30, { min: 20, max: 40, unit: "mm" });
const g3Root = Param.number("Gear 3 Root Dia", 24, { min: 15, max: 30, unit: "mm" });

// --- Calculated Dimensions ---
const hubRad = hubDia / 2;
const boreRad = boreDia / 2;

// --- Component 1: Central Hub ---
const hub = cylinder(hubLen, hubRad).color("#cccccc");

// --- Component 2: Gear 1 (Z = 2 to 10) ---
const g1Base = cylinder(gearWidth, g1Root / 2);
const g1T1 = box(g1Tip, 6, gearWidth);
const g1T2 = g1T1.rotate([0, 0, 1], 60);
const g1T3 = g1T1.rotate([0, 0, 1], 120);
const gear1 = g1Base.union(g1T1).union(g1T2).union(g1T3).translate(0, 0, 2).color("#5f87c6");

// --- Component 3: Gear 2 (Z = 18 to 26) ---
const g2Base = cylinder(gearWidth, g2Root / 2);
const g2T1 = box(g2Tip, 5, gearWidth);
const g2T2 = g2T1.rotate([0, 0, 1], 60);
const g2T3 = g2T1.rotate([0, 0, 1], 120);
const gear2 = g2Base.union(g2T1).union(g2T2).union(g2T3).translate(0, 0, 18).color("#4a6fa5");

// --- Component 4: Gear 3 (Z = 34 to 42) ---
const g3Base = cylinder(gearWidth, g3Root / 2);
const g3T1 = box(g3Tip, 4, gearWidth);
const g3T2 = g3T1.rotate([0, 0, 1], 60);
const g3T3 = g3T1.rotate([0, 0, 1], 120);
const gear3 = g3Base.union(g3T1).union(g3T2).union(g3T3).translate(0, 0, 34).color("#35587a");

// --- Component 5: Central Bore ---
const bore = cylinder(hubLen, boreRad);

// --- Component 6: Internal Keyway ---
const keyX = boreRad + (keyDepth / 2);
const keyway = box(keyDepth, keyWidth, hubLen).translate(keyX, 0, 0);

// --- Assembly & Final Cuts ---
const rawAssembly = hub.union(gear1).union(gear2).union(gear3);
const finalShape = rawAssembly.subtract(bore).subtract(keyway);

// --- Return Output ---
return {
  "a-triple-gear-stack-on-a-single-central-": finalShape,
};
