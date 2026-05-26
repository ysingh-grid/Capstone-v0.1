/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A square-based pyramid with 40mm base sides and a height of 50mm.
 * Workflow ID : eval-T1_037-19efdf
 * Trace ID    : 97c972ae-5f1e-4a3a-aeec-a0d9b9ab8ccd
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 40.0 × 40.0 × 50.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 2.0%
 *   BBox IoU       : ≥ 0.98
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_037-19efdf/step/T1_037_outer0_attempt0.step
 *   STL    : artifact://eval-T1_037-19efdf/stl/T1_037_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The base should be centered at the origin (0, 0, 0) in the XY plane, with the apex located precisely at (0, 0, 50). Can be modeled using a loft from a 40x40mm sketch to a point, or using a primitive/polyhedron definition.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * A square-based pyramid with 40mm base sides and a height of 50mm.
 */

// Define design parameters
const baseSide = Param.number("Base Side", 40.0, { min: 10, max: 200, unit: "mm" });
const height = Param.number("Height", 50.0, { min: 10, max: 200, unit: "mm" });

// Calculate half base side
const halfBase = baseSide / 2;

// Calculate the angle to tilt the cutting planes (in degrees)
const alpha = Math.atan(halfBase / height) * 180 / Math.PI;

// Create the main box to cut from (centered on XY, extends from Z=0 to Z=height)
const mainBox = box(baseSide, baseSide, height);

// Create the first cutting tool for the +X side
// We position it, shift its pivot to the origin, rotate, and shift back to the apex at (0, 0, height)
const toolX = box(baseSide * 2, baseSide * 2, height * 2)
  .translate(baseSide, 0, -height)
  .rotate([0, 1, 0], -alpha)
  .translate(0, 0, height);

// Create the other 3 cutting tools by rotating the first one around the Z-axis (apex is invariant)
const toolY = toolX.rotate([0, 0, 1], 90);
const toolMinusX = toolX.rotate([0, 0, 1], 180);
const toolMinusY = toolX.rotate([0, 0, 1], 270);

// Subtract the tools from the main box to form the pyramid
const pyramid = mainBox
  .subtract(toolX)
  .subtract(toolY)
  .subtract(toolMinusX)
  .subtract(toolMinusY)
  .color("#5f87c6");

// Return the final shape
return {
  "a-square-based-pyramid-with-40mm-base-si": pyramid,
};
