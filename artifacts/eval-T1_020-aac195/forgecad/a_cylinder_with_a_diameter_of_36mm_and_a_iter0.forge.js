/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A cylinder with a diameter of 36mm and a height of 60mm, centered at the origin on the XY plane.
 * Workflow ID : eval-T1_020-aac195
 * Trace ID    : 1a4aeb38-8aff-43ac-bfca-60eefd91a0f1
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 36.0 × 36.0 × 60.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 2.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_020-aac195/step/T1_020_outer0_attempt0.step
 *   STL    : artifact://eval-T1_020-aac195/stl/T1_020_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the cylinder is perfectly centered at the origin (0,0,0) across all axes. The Z-coordinates should span from -30.0 to +30.0 mm.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * A cylinder with a diameter of 36mm and a height of 60mm,
 * centered at the origin across all axes (including Z).
 */

// Define the dimensions as adjustable parameters
const diameter = Param.number("Diameter", 36, { min: 1, max: 200, unit: "mm" });
const height = Param.number("Height", 60, { min: 1, max: 500, unit: "mm" });

// Calculate radius from diameter
const radius = diameter / 2;

// Create the cylinder (by default, centered on XY and extending from Z=0 to Z=height)
const rawCylinder = cylinder(height, radius);

// Translate the cylinder along Z by half its height in the negative direction to center it at Z=0
const centeredCylinder = rawCylinder.translate(0, 0, -height / 2);

// Apply a clean blue color to the body
const coloredCylinder = centeredCylinder.color("#5f87c6");

// Return the final assembly under the specified key
return {
  "a-cylinder-with-a-diameter-of-36mm-and-a": coloredCylinder,
};
