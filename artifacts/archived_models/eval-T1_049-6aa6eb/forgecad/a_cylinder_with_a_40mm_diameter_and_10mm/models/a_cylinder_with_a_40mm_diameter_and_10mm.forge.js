/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A cylinder with a 40mm diameter and 10mm height, resembling a hockey puck.
 * Workflow ID : eval-T1_049-6aa6eb
 * Trace ID    : 8500b388-9a08-44d8-8d6b-3c61c05e01de
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 40.0 × 40.0 × 10.0 mm
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
 *   STEP   : artifact://eval-T1_049-6aa6eb/step/T1_049_outer0_attempt0.step
 *   STL    : artifact://eval-T1_049-6aa6eb/stl/T1_049_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the cylinder is modeled with sufficient angular resolution (e.g., at least 64 or 128 segments) to appear smooth and round. Center the cylinder at the origin for optimal alignment.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Hockey puck cylinder model.
 * 40mm diameter, 10mm height, centered at origin.
 */

// Define parameters for the hockey puck
const diameter = Param.number("Diameter", 40, { min: 5, max: 200, unit: "mm" });
const height = Param.number("Height", 10, { min: 1, max: 100, unit: "mm" });

// Calculate radius from diameter
const radius = diameter / 2;

// Create the cylinder representing the puck
// We translate it by -height/2 along Z to center it completely at the origin
const puck = cylinder(height, radius)
  .translate(0, 0, -height / 2)
  .color("#1d1d1d");

// Return the final shape mapping to the requested name
return {
  "a-cylinder-with-a-40mm-diameter-and-10mm": puck,
};
