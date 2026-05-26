/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A thin rectangular fin: 80mm tall, 60mm long, and 2mm thick.
 * Workflow ID : eval-T1_044-7e7034
 * Trace ID    : c6ee01f5-7639-4313-8c12-c885c55ba111
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 60.0 × 2.0 × 80.0 mm
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
 *   STEP   : artifact://eval-T1_044-7e7034/step/T1_044_outer0_attempt0.step
 *   STL    : artifact://eval-T1_044-7e7034/stl/T1_044_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Align the fin so that its height (80mm) is along the Z-axis, its length (60mm) is along the X-axis, and its thickness (2mm) is along the Y-axis. Center the component on the origin for optimal symmetry.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * A thin rectangular fin model.
 * 80mm tall, 60mm long, and 2mm thick, centered on the origin.
 */

// Define parameters for live adjustment in ForgeCAD Studio
const length = Param.number("Length (X-axis)", 60, { min: 10, max: 200, unit: "mm" });
const thickness = Param.number("Thickness (Y-axis)", 2, { min: 0.5, max: 20, unit: "mm" });
const height = Param.number("Height (Z-axis)", 80, { min: 10, max: 300, unit: "mm" });

// Create the box primitive. 
// box(width, depth, height) is centered on the XY plane and extends in the +Z direction.
const rawFin = box(length, thickness, height);

// Translate the fin downwards along the Z-axis by half of its height to center it completely on the origin.
const centeredFin = rawFin.translate(0, 0, -height / 2).color("#5f87c6");

// Return the final shape map with the exact required part name
return {
  "a-thin-rectangular-fin:-80mm-tall,-60mm-": centeredFin,
};
