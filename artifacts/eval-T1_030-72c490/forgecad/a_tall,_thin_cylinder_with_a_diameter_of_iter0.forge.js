/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A tall, thin cylinder with a diameter of 12mm and a height of 100mm, featuring 1mm chamfers on both the top and bottom circular edges.
 * Workflow ID : eval-T1_030-72c490
 * Trace ID    : 6f942be3-3fc3-49f5-905a-d3f617e1f0bc
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 12.0 × 12.0 × 100.0 mm
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
 *   STEP   : artifact://eval-T1_030-72c490/step/T1_030_outer0_attempt0.step
 *   STL    : artifact://eval-T1_030-72c490/stl/T1_030_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create a cylinder of radius 6mm and height 100mm centered on the Z-axis (from Z=0 to Z=100 or centered at origin). Apply a 1mm x 1mm (or 45-degree 1mm) chamfer on both of the circular end-cap edges. Ensure the final bounding box is exactly 12x12x100mm.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Tall, thin cylinder with chamfered circular edges.
 */

// Parameters
const diameter = Param.number("Diameter", 12, { min: 2, max: 100, unit: "mm" });
const height = Param.number("Height", 100, { min: 10, max: 500, unit: "mm" });
const chamferSize = Param.number("Chamfer Size", 1, { min: 0.1, max: 5, unit: "mm" });

// Calculate radius from diameter
const radius = diameter / 2;

// Create the base cylinder along the Z-axis
const baseCylinder = cylinder(height, radius);

// Apply the chamfer to both top and bottom circular edges
const finalShape = baseCylinder.chamfer(chamferSize).color("#5f87c6");

// Return the final assembly
return {
  "a-tall,-thin-cylinder-with-a-diameter-of": finalShape,
};
