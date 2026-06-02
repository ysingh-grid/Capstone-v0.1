/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A simple solid cylinder with a diameter of 25mm and a height of 40mm.
 * Workflow ID : eval-T1_002-4da4ba
 * Trace ID    : f127b1b5-bc47-4696-bd91-d45bbb6d47d1
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 25.0 × 25.0 × 40.0 mm
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
 *   STEP   : artifact://eval-T1_002-4da4ba/step/T1_002_outer0_attempt0.step
 *   STL    : artifact://eval-T1_002-4da4ba/stl/T1_002_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Align the cylinder such that its central axis is aligned with the Z-axis, centered at (0, 0, 0) or with its base at Z=0.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * A simple solid cylinder with a diameter of 25mm and a height of 40mm.
 */

// Define parameters for the cylinder
const diameter = Param.number("Diameter", 25, { min: 1, max: 200, unit: "mm" });
const height = Param.number("Height", 40, { min: 1, max: 500, unit: "mm" });

// Calculate radius from the diameter parameter
const radius = diameter / 2;

// Create the cylinder primitive (centered on XY, extends in +Z from Z=0)
const cylindrical_body = cylinder(height, radius);

// Apply color for aesthetics
const finalShape = cylindrical_body.color("#5f87c6");

// Return the geometry
return {
  "a-simple-solid-cylinder-with-a-diameter-": finalShape,
};
