/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A simple solid cube with 40mm sides.
 * Workflow ID : eval-T1_005-4745d6
 * Trace ID    : 3a0add33-3164-45d0-a2f9-8edb54140767
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 40.0 × 40.0 × 40.0 mm
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
 *   STEP   : artifact://eval-T1_005-4745d6/step/T1_005_outer0_attempt0.step
 *   STL    : artifact://eval-T1_005-4745d6/stl/T1_005_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create a basic 3D box utility. Centering the cube at (0, 0, 0) is recommended for optimal alignment and symmetry.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * A simple solid cube with 40mm sides, centered on the origin.
 */

// Define the side length of the cube as a parametric slider
const side = Param.number("Side Length", 40, { min: 10, max: 200, unit: "mm" });

// Create the basic box shape (centered on XY, extending in +Z)
const baseBox = box(side, side, side);

// Translate the box in Z by half its height to center it at (0, 0, 0)
const centeredCube = baseBox.translate(0, 0, -side / 2).color("#5f87c6");

// Return the final shape mapping
return {
  "a-simple-solid-cube-with-40mm-sides.": centeredCube,
};
