/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A solid rectangular box measuring 35mm in length, 35mm in width, and 50mm in height.
 * Workflow ID : eval-T1_035-b51be2
 * Trace ID    : aaf141ef-85c0-46e2-9c77-81cf6ecacfc7
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 35.0 × 35.0 × 50.0 mm
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
 *   STEP   : artifact://eval-T1_035-b51be2/step/T1_035_outer0_attempt0.step
 *   STL    : artifact://eval-T1_035-b51be2/stl/T1_035_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create a simple solid cuboid. Center the cuboid at the origin (0,0,0) for best symmetry, or align the bottom face with the XY plane (z=0 to z=50) according to standard modeling preferences.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * A solid rectangular box measuring 35mm in length, 35mm in width, and 50mm in height.
 */

// Define parameters for length, width, and height
const length = Param.number("Length", 35, { min: 5, max: 200, unit: "mm" });
const width = Param.number("Width", 35, { min: 5, max: 200, unit: "mm" });
const height = Param.number("Height", 50, { min: 5, max: 300, unit: "mm" });

// Create the main box geometry (centered on XY, extends in +Z)
const mainBody = box(length, width, height).color("#5f87c6");

// Return the final shape mapping to the required part name
return {
  "a-solid-rectangular-box-measuring-35mm-i": mainBody,
};
