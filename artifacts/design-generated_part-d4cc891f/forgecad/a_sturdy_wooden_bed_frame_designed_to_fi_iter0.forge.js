/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A sturdy wooden bed frame designed to fit a 6.5 x 6.5 ft (78 x 78 inches) square mattress, with the top of the frame standing exactly 2 feet (24 inches) above the ground.
 * Workflow ID : design-generated_part-d4cc891f
 * Trace ID    : f234855d-64e6-4c66-a065-52a64cb4d8fb
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 2060.0 × 2060.0 × 610.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 10.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://design-generated_part-d4cc891f/step/generated_part_outer0_attempt3.step
 *   STL    : artifact://design-generated_part-d4cc891f/stl/generated_part_outer0_attempt3.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The mattress dimensions are 1981.2 mm x 1981.2 mm (6.5 x 6.5 ft). The frame inner cavity is designed at 1990 mm x 1990 mm to allow a 4.4 mm clearance tolerance on all sides. Outer frame thickness uses standard nominal 2-by lumber (38 mm actual thickness). The top surface of the frame is flush at 610 mm (2 ft) height.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Wooden Bed Frame (6.5 x 6.5 ft Mattress Size)
 * Designed with a height of 2 feet (610 mm) above the ground.
 */

// --- Parameters ---
const cavitySize = Param.number("Mattress Cavity Size", 1990, { min: 1000, max: 2500, unit: "mm" });
const bedHeight = Param.number("Bed Height", 610, { min: 300, max: 1000, unit: "mm" });
const legSize = Param.number("Leg Post Size", 89, { min: 50, max: 150, unit: "mm" });
const railHeight = Param.number("Rail Height", 140, { min: 80, max: 250, unit: "mm" });
const railThickness = Param.number("Rail Thickness", 38, { min: 15, max: 50, unit: "mm" });
const slatThickness = Param.number("Slat Thickness", 19, { min: 10, max: 30, unit: "mm" });
const slatWidth = Param.number("Slat Width", 90, { min: 50, max: 150, unit: "mm" });
const mattressDrop = Param.number("Mattress Drop Depth", 30, { min: 10, max: 100, unit: "mm" });

// --- Calculated Positions ---
const outerSize = cavitySize + 2 * railThickness;
const legOffset = (outerSize - legSize) / 2;
const railZ = bedHeight - railHeight;
const slatZ = railZ + railHeight - mattressDrop - slatThickness;

// --- Corner Leg Posts ---
const legMaster = box(legSize, legSize, bedHeight);
const leg1 = legMaster.translate(-legOffset, -legOffset, 0);
const leg2 = legMaster.translate(legOffset, -legOffset, 0);
const leg3 = legMaster.translate(-legOffset, legOffset, 0);
const leg4 = legMaster.translate(legOffset, legOffset, 0);
const legs = leg1.union(leg2).union(leg3).union(leg4);

// --- Side, Head, and Foot Rails ---
const sideRailMaster = box(railThickness, outerSize, railHeight);
const railLeft = sideRailMaster.translate(-(cavitySize + railThickness) / 2, 0, railZ);
const railRight = sideRailMaster.translate((cavitySize + railThickness) / 2, 0, railZ);

const endRailMaster = box(cavitySize, railThickness, railHeight);
const railHead = endRailMaster.translate(0, (cavitySize + railThickness) / 2, railZ);
const railFoot = endRailMaster.translate(0, -(cavitySize + railThickness) / 2, railZ);

const outerFrame = railLeft.union(railRight).union(railHead).union(railFoot);

// --- Slat Support Cleats (Ledges inside side rails) ---
const cleatSize = 38;
const cleatZ = slatZ - cleatSize;
const cleatMaster = box(cleatSize, cavitySize, cleatSize);
const cleatLeft = cleatMaster.translate(-(cavitySize / 2 - cleatSize / 2), 0, cleatZ);
const cleatRight = cleatMaster.translate(cavitySize / 2 - cleatSize / 2, 0, cleatZ);
const cleats = cleatLeft.union(cleatRight);

// --- Support Slats ---
const slatMaster = box(cavitySize, slatWidth, slatThickness);
const slatSpacing = cavitySize / 6;
const slat1 = slatMaster.translate(0, -2 * slatSpacing, slatZ);
const slat2 = slatMaster.translate(0, -1 * slatSpacing, slatZ);
const slat3 = slatMaster.translate(0, 0, slatZ);
const slat4 = slatMaster.translate(0, 1 * slatSpacing, slatZ);
const slat5 = slatMaster.translate(0, 2 * slatSpacing, slatZ);
const slats = slat1.union(slat2).union(slat3).union(slat4).union(slat5);

// --- Center Support Rail & Legs ---
const centerRailHeight = 70;
const centerRailZ = slatZ - centerRailHeight;
const centerRail = box(38, cavitySize, centerRailHeight).translate(0, 0, centerRailZ);

const centerLegMaster = box(70, 70, centerRailZ);
const centerLeg1 = centerLegMaster.translate(0, -cavitySize / 4, 0);
const centerLeg2 = centerLegMaster.translate(0, cavitySize / 4, 0);
const centerLegs = centerLeg1.union(centerLeg2);

// --- Assembly ---
const bedFrame = legs
  .union(outerFrame)
  .union(cleats)
  .union(slats)
  .union(centerRail)
  .union(centerLegs)
  .color("#b58a63"); // Warm wood tone

// --- Return Final Part ---
return {
  "a-sturdy-wooden-bed-frame-designed-to-fi": bedFrame,
};
