/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A thin circular disc with a diameter of 50mm and a thickness of 2mm.
 * Workflow ID : eval-T1_009-ae7cd3
 * Trace ID    : 2603e790-4cf5-4037-87a5-cd873904486e
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 50.0 × 50.0 × 2.0 mm
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
 *   STEP   : artifact://eval-T1_009-ae7cd3/step/T1_009_outer0_attempt0.step
 *   STL    : artifact://eval-T1_009-ae7cd3/stl/T1_009_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create a cylinder with a radius of 25mm and height of 2mm. Position it centered on the XY plane for optimal symmetry.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * A thin circular disc with a diameter of 50mm and a thickness of 2mm.
 */

// Define parameters for the disc
const diameter = Param.number("Diameter", 50, { min: 10, max: 200, unit: "mm" });
const thickness = Param.number("Thickness", 2, { min: 0.5, max: 50, unit: "mm" });

// Calculate radius from diameter
const radius = diameter / 2;

// Create the disc cylinder, centered on the XY plane, extending in +Z
const discBody = cylinder(thickness, radius).color("#5f87c6");

// Return the final shape
return {
  "a-thin-circular-disc-with-a-diameter-of-": discBody,
};
