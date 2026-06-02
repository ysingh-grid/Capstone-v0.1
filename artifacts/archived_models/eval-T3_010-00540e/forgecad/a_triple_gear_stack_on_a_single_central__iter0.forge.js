/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A triple gear stack on a single central hub with a keywayed bore running through its length, designed with star-polygon tooth profiles for the three gears of decreasing sizes along the Z-axis.
 * Workflow ID : eval-T3_010-00540e
 * Trace ID    : a88e4ef9-a5e0-41e1-8e80-f6001cd70bf4
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
 *   STEP   : artifact://eval-T3_010-00540e/step/T3_010_outer0_attempt0.step
 *   STL    : artifact://eval-T3_010-00540e/stl/T3_010_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create the central hub cylinder first, then construct each of the three gears using star-polygon patterns (outer tip radius and inner root radius) extruded along Z for their respective intervals. Combine these, then subtract the central bore cylinder (radius 3mm) and the keyway box (spanning X from 3 to 5, Y from -1.5 to 1.5, Z from 0 to 55) to complete the part.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Triple gear stack on a single central hub with a keywayed bore.
 * Designed with star-polygon tooth profiles for three gears of decreasing sizes along the Z-axis.
 */

// Central Hub parameters
const hubDiameter = Param.number("Hub Diameter", 14, { min: 5, max: 30, unit: "mm" });
const hubLength = Param.number("Hub Length", 55, { min: 10, max: 100, unit: "mm" });

// Bore and Keyway parameters
const boreDiameter = Param.number("Bore Diameter", 6, { min: 2, max: 20, unit: "mm" });
const keywayWidth = Param.number("Keyway Width", 3, { min: 1, max: 10, unit: "mm" });
const keywayDepth = Param.number("Keyway Depth", 2, { min: 0.5, max: 5, unit: "mm" });

// Bottom Gear (Gear 1, 24 teeth simplified)
const g1ZStart = Param.number("Gear 1 Z Start", 2, { min: 0, max: 50, unit: "mm" });
const g1Face = Param.number("Gear 1 Face Width", 8, { min: 2, max: 20, unit: "mm" });
const g1RootRad = Param.number("Gear 1 Root Radius", 22, { min: 5, max: 50, unit: "mm" });
const g1TipRad = Param.number("Gear 1 Tip Radius", 27, { min: 5, max: 60, unit: "mm" });

// Middle Gear (Gear 2, 18 teeth simplified)
const g2ZStart = Param.number("Gear 2 Z Start", 18, { min: 0, max: 50, unit: "mm" });
const g2Face = Param.number("Gear 2 Face Width", 8, { min: 2, max: 20, unit: "mm" });
const g2RootRad = Param.number("Gear 2 Root Radius", 17, { min: 5, max: 50, unit: "mm" });
const g2TipRad = Param.number("Gear 2 Tip Radius", 21, { min: 5, max: 50, unit: "mm" });

// Top Gear (Gear 3, 12 teeth simplified)
const g3ZStart = Param.number("Gear 3 Z Start", 34, { min: 0, max: 50, unit: "mm" });
const g3Face = Param.number("Gear 3 Face Width", 8, { min: 2, max: 20, unit: "mm" });
const g3RootRad = Param.number("Gear 3 Root Radius", 12, { min: 5, max: 50, unit: "mm" });
const g3TipRad = Param.number("Gear 3 Tip Radius", 15, { min: 5, max: 40, unit: "mm" });

// Derived values
const hubRadius = hubDiameter / 2;
const boreRadius = boreDiameter / 2;

// Central Hub Base
const hub = cylinder(hubLength, hubRadius);

// Gear 1: Base cylinder unioned with 4 rotated slot boxes representing teeth
let gear1 = cylinder(g1Face, g1RootRad);
const g1ToothW = 3.5;
const t1_1 = box(g1TipRad * 2, g1ToothW, g1Face);
const t1_2 = box(g1TipRad * 2, g1ToothW, g1Face).rotate([0, 0, 1], 45);
const t1_3 = box(g1TipRad * 2, g1ToothW, g1Face).rotate([0, 0, 1], 90);
const t1_4 = box(g1TipRad * 2, g1ToothW, g1Face).rotate([0, 0, 1], 135);
gear1 = gear1.union(t1_1).union(t1_2).union(t1_3).union(t1_4).translate(0, 0, g1ZStart);

// Gear 2: Base cylinder unioned with 3 rotated slot boxes representing teeth
let gear2 = cylinder(g2Face, g2RootRad);
const g2ToothW = 3.0;
const t2_1 = box(g2TipRad * 2, g2ToothW, g2Face);
const t2_2 = box(g2TipRad * 2, g2ToothW, g2Face).rotate([0, 0, 1], 60);
const t2_3 = box(g2TipRad * 2, g2ToothW, g2Face).rotate([0, 0, 1], 120);
gear2 = gear2.union(t2_1).union(t2_2).union(t2_3).translate(0, 0, g2ZStart);

// Gear 3: Base cylinder unioned with 2 rotated slot boxes representing teeth
let gear3 = cylinder(g3Face, g3RootRad);
const g3ToothW = 2.5;
const t3_1 = box(g3TipRad * 2, g3ToothW, g3Face);
const t3_2 = box(g3TipRad * 2, g3ToothW, g3Face).rotate([0, 0, 1], 90);
gear3 = gear3.union(t3_1).union(t3_2).translate(0, 0, g3ZStart);

// Combine hub and gears into a solid body
const combinedBody = hub.union(gear1).union(gear2).union(gear3);

// Internal features: central bore and keyway
const bore = cylinder(hubLength, boreRadius);
const keywayXCenter = boreRadius + (keywayDepth / 2);
const keyway = box(keywayDepth, keywayWidth, hubLength).translate(keywayXCenter, 0, 0);

// Final cut operations to produce finished gear stack
const finalPart = combinedBody.subtract(bore).subtract(keyway).color("#5c8fc2");

return {
  "a-triple-gear-stack-on-a-single-central-": finalPart
};
