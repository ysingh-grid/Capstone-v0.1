/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A simple square plate with a side length of 80mm and a thickness of 5mm.
 * Workflow ID : eval-T1_017-b8fc6b
 * Trace ID    : 9985c871-2e3d-48b6-98af-fe604c811e59
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 80.0 × 80.0 × 5.0 mm
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
 *   STEP   : artifact://eval-T1_017-b8fc6b/step/T1_017_outer0_attempt0.step
 *   STL    : artifact://eval-T1_017-b8fc6b/stl/T1_017_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The part should be centered at the origin (0,0,0) with the Z-axis representing the thickness. Ensure sharp edges unless standard chamfers/fillets are implied, but since none are specified, keep it a sharp solid box.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file a-simple-square-plate-with-a-side-length.forge.js
 * @description A simple square plate with a side length of 80mm and a thickness of 5mm.
 */

// Define parameters for the square plate
const sideLength = Param.number("Side Length", 80, { min: 10, max: 500, unit: "mm" });
const thickness = Param.number("Thickness", 5, { min: 1, max: 100, unit: "mm" });

// Create the square plate using the box primitive
// The box is centered on XY and extends in +Z
const plate = box(sideLength, sideLength, thickness).color("#5f87c6");

// Return the final geometry
return {
  "a-simple-square-plate-with-a-side-length": plate,
};
