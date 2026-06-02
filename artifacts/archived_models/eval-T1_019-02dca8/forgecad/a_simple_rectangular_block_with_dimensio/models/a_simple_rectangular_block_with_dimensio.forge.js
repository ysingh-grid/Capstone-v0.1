/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A simple rectangular block with dimensions 120mm by 45mm by 15mm.
 * Workflow ID : eval-T1_019-02dca8
 * Trace ID    : e3d9385e-1940-4c46-b7d8-e6c8c3671644
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 120.0 × 45.0 × 15.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 1.0%
 *   BBox IoU       : ≥ 0.99
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_019-02dca8/step/T1_019_outer0_attempt0.step
 *   STL    : artifact://eval-T1_019-02dca8/stl/T1_019_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create a basic solid box. Center the box at the coordinate origin (0, 0, 0) for ease of reference, with length along the X-axis, width along the Y-axis, and height along the Z-axis.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file a-simple-rectangular-block-with-dimensio.forge.js
 * @description A simple rectangular block with dimensions 120mm by 45mm by 15mm, centered at the origin.
 */

// Define dimensions as parameters to enable UI sliders in ForgeCAD Studio
const length = Param.number("Length", 120, { min: 10, max: 500, unit: "mm" });
const width = Param.number("Width", 45, { min: 10, max: 500, unit: "mm" });
const height = Param.number("Height", 15, { min: 1, max: 200, unit: "mm" });

// Create the base box using ForgeCAD's built-in box primitive.
// The primitive box(width, depth, height) is centered on the XY plane and extends along +Z.
const baseBox = box(length, width, height);

// Translate the box along the Z-axis by -height/2 to center it perfectly at (0, 0, 0).
const centeredBlock = baseBox.translate(0, 0, -height / 2).color("#5f87c6");

// Return the final geometry mapping to the requested part name
return {
  "a-simple-rectangular-block-with-dimensio": centeredBlock,
};
