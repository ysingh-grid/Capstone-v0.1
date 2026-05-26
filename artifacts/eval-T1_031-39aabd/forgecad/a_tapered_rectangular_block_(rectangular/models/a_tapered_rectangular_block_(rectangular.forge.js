/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A tapered rectangular block (rectangular frustum) with a larger bottom base and a smaller top face, centered and symmetric.
 * Workflow ID : eval-T1_031-39aabd
 * Trace ID    : b8ac0057-5122-4928-a41a-6fd844160581
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 50.0 × 30.0 × 40.0 mm
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
 *   STEP   : artifact://eval-T1_031-39aabd/step/T1_031_outer0_attempt0.step
 *   STL    : artifact://eval-T1_031-39aabd/stl/T1_031_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create the rectangular frustum using a loft between two centered rectangles at Z=0 and Z=40, or by using a draft angle calculation. A loft is highly recommended for precision.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file tapered-rectangular-block.forge.js
 * @description A tapered rectangular block (rectangular frustum) with a larger bottom base and a smaller top face, centered and symmetric.
 */

// Define parameters with default values and ranges
const baseX = Param.number("Base X", 50, { min: 10, max: 500, unit: "mm" });
const baseY = Param.number("Base Y", 30, { min: 10, max: 500, unit: "mm" });
const topX = Param.number("Top X", 30, { min: 5, max: 500, unit: "mm" });
const topY = Param.number("Top Y", 15, { min: 5, max: 500, unit: "mm" });
const height = Param.number("Height", 40, { min: 5, max: 500, unit: "mm" });

// Calculate taper angles in degrees
const angleX = Math.atan((baseX - topX) / (2 * height)) * 180 / Math.PI;
const angleY = Math.atan((baseY - topY) / (2 * height)) * 180 / Math.PI;

// Define a safe cutter size based on maximum dimensions to ensure complete trimming
const cutSize = Math.max(baseX, baseY, height) * 2 + 50;

// Create the main solid block to be tapered
const mainBlock = box(baseX, baseY, height);

// Create the +X cutter: shift, tilt, and position at the base edge
const cutterPX = box(cutSize, cutSize, cutSize)
  .translate(cutSize / 2, 0, 0)
  .rotate([0, 1, 0], -angleX)
  .translate(baseX / 2, 0, 0);

// Create the -X cutter: shift, tilt, and position at the base edge
const cutterMX = box(cutSize, cutSize, cutSize)
  .translate(-cutSize / 2, 0, 0)
  .rotate([0, 1, 0], angleX)
  .translate(-baseX / 2, 0, 0);

// Create the +Y cutter: shift, tilt, and position at the base edge
const cutterPY = box(cutSize, cutSize, cutSize)
  .translate(0, cutSize / 2, 0)
  .rotate([1, 0, 0], angleY)
  .translate(0, baseY / 2, 0);

// Create the -Y cutter: shift, tilt, and position at the base edge
const cutterMY = box(cutSize, cutSize, cutSize)
  .translate(0, -cutSize / 2, 0)
  .rotate([1, 0, 0], -angleY)
  .translate(0, -baseY / 2, 0);

// Subtract the four angled cutters to produce the symmetric rectangular frustum
const finalShape = mainBlock
  .subtract(cutterPX)
  .subtract(cutterMX)
  .subtract(cutterPY)
  .subtract(cutterMY)
  .color("#5f87c6");

// Return the final shape using the specified part name
return {
  "a-tapered-rectangular-block-(rectangular": finalShape,
};
