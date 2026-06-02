/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A heat sink base plate with 5 parallel cooling fins, centered at the origin, with specified dimensions and spacing.
 * Workflow ID : eval-T2_021-f06042
 * Trace ID    : d2910808-eee9-4f83-81d6-d10435a845e8
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 60.0 × 40.0 × 18.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T2_021-f06042/step/T2_021_outer0_attempt0.step
 *   STL    : artifact://eval-T2_021-f06042/stl/T2_021_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the base plate's bottom face is exactly at Z=0. The fins must start on the top face of the base plate (Z=3) and extend to Z=18. The X coordinates of the fin centers must be exactly -24, -12, 0, 12, and 24.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file heatsink.forge.js
 * @description A heat sink base plate with 5 parallel cooling fins, centered at the origin.
 */

// Design parameters for the heat sink
const baseLengthX = Param.number("Base Length X", 60, { min: 10, max: 200, unit: "mm" });
const baseWidthY = Param.number("Base Width Y", 40, { min: 10, max: 200, unit: "mm" });
const baseThicknessZ = Param.number("Base Thickness Z", 3, { min: 1, max: 20, unit: "mm" });

const finThicknessX = Param.number("Fin Thickness X", 2, { min: 0.5, max: 10, unit: "mm" });
const finWidthY = Param.number("Fin Width Y", 40, { min: 10, max: 200, unit: "mm" });
const finHeightZ = Param.number("Fin Height Z", 15, { min: 5, max: 100, unit: "mm" });
const finSpacingX = Param.number("Fin Spacing X", 12, { min: 2, max: 50, unit: "mm" });

// Base plate centered on XY, starting at Z=0
const basePlate = box(baseLengthX, baseWidthY, baseThicknessZ).color("#7f8c8d");

// Template for a single fin, to be translated and unioned
const finTemplate = box(finThicknessX, finWidthY, finHeightZ).color("#95a5a6");

// Create five individual fins at specified parametric offsets along X
const fin1 = finTemplate.translate(-2 * finSpacingX, 0, baseThicknessZ);
const fin2 = finTemplate.translate(-1 * finSpacingX, 0, baseThicknessZ);
const fin3 = finTemplate.translate(0, 0, baseThicknessZ);
const fin4 = finTemplate.translate(1 * finSpacingX, 0, baseThicknessZ);
const fin5 = finTemplate.translate(2 * finSpacingX, 0, baseThicknessZ);

// Union all components together into the final heatsink geometry
const finalHeatsink = basePlate
  .union(fin1)
  .union(fin2)
  .union(fin3)
  .union(fin4)
  .union(fin5);

// Return the constructed part
return {
  "a-heat-sink-base-plate-with-5-parallel-c": finalHeatsink,
};
