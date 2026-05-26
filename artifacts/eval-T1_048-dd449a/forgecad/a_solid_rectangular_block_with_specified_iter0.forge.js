/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A solid rectangular block with specified dimensions of 150mm x 50mm x 30mm.
 * Workflow ID : eval-T1_048-dd449a
 * Trace ID    : 524f30cd-a3ae-44a3-8ee3-d7ef4397bf2b
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 150.0 × 50.0 × 30.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 1.0%
 *   BBox IoU       : ≥ 0.98
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_048-dd449a/step/T1_048_outer0_attempt0.step
 *   STL    : artifact://eval-T1_048-dd449a/stl/T1_048_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Align the center of the block at the origin (0, 0, 0) for ease of symmetry and further downstream operations if needed.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file solid_rectangular_block.forge.js
 * @description A solid rectangular block with specified dimensions centered at the origin.
 */

// Define parameters with default values, min/max limits, and units
const length = Param.number("Length", 150, { min: 10, max: 500, unit: "mm" });
const width = Param.number("Width", 50, { min: 10, max: 500, unit: "mm" });
const height = Param.number("Height", 30, { min: 1, max: 200, unit: "mm" });

// Create the main block.
// box(width, depth, height) is centered on XY and extends in +Z.
// We map length to the X-axis parameter, width to the Y-axis parameter, and height to the Z-axis parameter.
const rawBlock = box(length, width, height);

// Center the block in the Z-axis to ensure it is fully centered at (0, 0, 0)
const centeredBlock = rawBlock.translate(0, 0, -height / 2);

// Apply a professional blue color
const finalShape = centeredBlock.color("#5f87c6");

// Return the final shape mapped to the requested key
return {
  "a-solid-rectangular-block-with-specified": finalShape,
};
