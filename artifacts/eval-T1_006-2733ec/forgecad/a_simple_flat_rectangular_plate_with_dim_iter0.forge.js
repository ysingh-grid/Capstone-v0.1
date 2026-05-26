/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A simple flat rectangular plate with dimensions 100mm by 60mm and a thickness of 3mm.
 * Workflow ID : eval-T1_006-2733ec
 * Trace ID    : a360c8b1-b375-4054-9ea7-c9bd63613858
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 100.0 × 60.0 × 3.0 mm
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
 *   STEP   : artifact://eval-T1_006-2733ec/step/T1_006_outer0_attempt0.step
 *   STL    : artifact://eval-T1_006-2733ec/stl/T1_006_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The part is highly simplistic. Center the plate at the origin (0,0) on the XY plane and extrude upwards along the Z-axis by 3mm. Ensure no filleting or chamfering is applied unless specified.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Flat Rectangular Plate
 * Dimensions: 100mm x 60mm x 3mm
 */

// Define parameters for the plate dimensions
const length = Param.number("Length", 100, { min: 10, max: 500, unit: "mm" });
const width = Param.number("Width", 60, { min: 10, max: 500, unit: "mm" });
const thickness = Param.number("Thickness", 3, { min: 1, max: 100, unit: "mm" });

// Create the flat rectangular base centered on XY and extending in +Z
const plate = box(length, width, thickness).color("#5f87c6");

// Return the final shape mapping
return {
  "a-simple-flat-rectangular-plate-with-dim": plate,
};
