/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A tall cylindrical rod with a diameter of 8mm and a length of 150mm.
 * Workflow ID : eval-T1_010-d9bd76
 * Trace ID    : c67db60e-4642-4bdd-b792-d473b76858c7
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 8.0 × 8.0 × 150.0 mm
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
 *   STEP   : artifact://eval-T1_010-d9bd76/step/T1_010_outer0_attempt0.step
 *   STL    : artifact://eval-T1_010-d9bd76/stl/T1_010_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Align the cylinder vertically along the Z-axis to represent a 'tall' rod. The base center should be positioned at (0,0,0) or the center of the cylinder at (0,0,75) for standard alignment.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file tall_cylindrical_rod.forge.js
 * @description A tall cylindrical rod with a diameter of 8mm and a length of 150mm.
 */

// Define parameters as sliders for user configuration in ForgeCAD Studio
const diameter = Param.number("Diameter", 8.0, { min: 1.0, max: 50.0, unit: "mm" });
const length = Param.number("Length", 150.0, { min: 10.0, max: 500.0, unit: "mm" });

// Calculate radius from diameter
const radius = diameter / 2;

// Create the cylindrical rod body
// The cylinder primitive has its axis along the Z-axis, extending from Z = 0 to Z = length.
const rod = cylinder(length, radius)
  .color("#5f87c6"); // Apply a clean steel blue color

// Return the final shape map matching the requested part name
return {
  "a-tall-cylindrical-rod-with-a-diameter-o": rod
};
