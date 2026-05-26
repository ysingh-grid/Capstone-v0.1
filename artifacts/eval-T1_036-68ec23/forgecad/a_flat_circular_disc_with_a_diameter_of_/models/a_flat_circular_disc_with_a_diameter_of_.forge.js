/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A flat circular disc with a diameter of 80mm and a thickness of 1mm.
 * Workflow ID : eval-T1_036-68ec23
 * Trace ID    : b4b471c1-7bec-4723-a187-0e7cf447b70e
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 80.0 × 80.0 × 1.0 mm
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
 *   STEP   : artifact://eval-T1_036-68ec23/step/T1_036_outer0_attempt0.step
 *   STL    : artifact://eval-T1_036-68ec23/stl/T1_036_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create a cylinder centered at the origin (0,0,0) with a radius of 40mm and height (thickness) of 1mm.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Flat circular disc model.
 * Part: A flat circular disc with a diameter of 80mm and a thickness of 1mm.
 */

// Define parameters as sliders
const diameter = Param.number("Diameter", 80, { min: 10, max: 200, unit: "mm" });
const thickness = Param.number("Thickness", 1, { min: 0.1, max: 20, unit: "mm" });

// Calculate radius from diameter
const radius = diameter / 2;

// Create the main circular disc using a cylinder primitive (height, radius)
const disc = cylinder(thickness, radius);

// Apply a clean blue color to the disc
const finalDisc = disc.color("#5f87c6");

// Return the final shape mapped to the requested key
return {
  "a-flat-circular-disc-with-a-diameter-of-": finalDisc
};
