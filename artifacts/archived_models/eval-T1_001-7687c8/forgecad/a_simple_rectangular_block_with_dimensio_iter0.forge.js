/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A simple rectangular block with dimensions 50mm x 30mm x 20mm.
 * Workflow ID : eval-T1_001-7687c8
 * Trace ID    : 59f2c409-452f-42cb-96b5-ef838382a5c6
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 50.0 × 30.0 × 20.0 mm
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
 *   STEP   : artifact://eval-T1_001-7687c8/step/T1_001_outer0_attempt0.step
 *   STL    : artifact://eval-T1_001-7687c8/stl/T1_001_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create a solid 3D cuboid with the specified dimensions. Center the block at the origin (0,0,0) for ease of reference.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Simple Rectangular Block
 * Dimensions: 50mm x 30mm x 20mm
 */

// Define parameters for the block dimensions
const length = Param.number("Length", 50, { min: 1, max: 500, unit: "mm" });
const width = Param.number("Width", 30, { min: 1, max: 500, unit: "mm" });
const height = Param.number("Height", 20, { min: 1, max: 500, unit: "mm" });

// Create the rectangular block.
// In ForgeCAD, box(w, d, h) creates a box of size w x d x h centered on the XY plane, extending up in +Z.
const block = box(length, width, height).color("#5f87c6");

// Return the final shape map as required by ForgeCAD
return {
  "a-simple-rectangular-block-with-dimensio": block,
};
