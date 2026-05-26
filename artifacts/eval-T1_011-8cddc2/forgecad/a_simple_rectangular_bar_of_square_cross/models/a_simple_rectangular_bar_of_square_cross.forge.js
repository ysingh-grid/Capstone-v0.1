/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A simple rectangular bar of square cross-section (10mm x 10mm) and 200mm length.
 * Workflow ID : eval-T1_011-8cddc2
 * Trace ID    : 716afdff-9033-473a-a9ef-0111436ca44a
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 10.0 × 200.0 × 10.0 mm
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
 *   STEP   : artifact://eval-T1_011-8cddc2/step/T1_011_outer0_attempt0.step
 *   STL    : artifact://eval-T1_011-8cddc2/stl/T1_011_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Model this as a single box or an extruded 10x10 square sketch. Center it at the origin for maximum symmetry.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Simple Rectangular Bar Model
 * 10mm x 10mm x 200mm
 */

// Define parameters for customizability in the ForgeCAD Studio
const width = Param.number("Width", 10.0, { min: 1, max: 100, unit: "mm" });
const length = Param.number("Length", 200.0, { min: 10, max: 1000, unit: "mm" });
const height = Param.number("Height", 10.0, { min: 1, max: 100, unit: "mm" });

// Create the basic box shape
// box(width, depth, height) is centered on XY, extends in +Z
const bar = box(width, length, height);

// Center the bar along the Z axis to achieve bilateral symmetry
const centeredBar = bar.translate(0, 0, -height / 2);

// Apply a professional color
const finalShape = centeredBar.color("#5f87c6");

// Return the final shape
return {
  "a-simple-rectangular-bar-of-square-cross": finalShape,
};
