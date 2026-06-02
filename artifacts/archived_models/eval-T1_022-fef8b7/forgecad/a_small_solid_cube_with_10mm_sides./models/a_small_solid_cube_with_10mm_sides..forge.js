/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A small solid cube with 10mm sides.
 * Workflow ID : eval-T1_022-fef8b7
 * Trace ID    : 43d8af3b-8fa2-490f-956a-f2b4eabfe989
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 10.0 × 10.0 × 10.0 mm
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
 *   STEP   : artifact://eval-T1_022-fef8b7/step/T1_022_outer0_attempt0.step
 *   STL    : artifact://eval-T1_022-fef8b7/stl/T1_022_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The part is a basic 10x10x10 mm cube. Ensure it is centered at the origin (0,0,0) or positioned with one corner at the origin depending on standard CAD practices, but centering is preferred.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: A small solid cube with 10mm sides.
 * Centered at the origin.
 */

// Define parameters for the cube dimensions
const sideLength = Param.number("Side Length", 10, { min: 1, max: 100, unit: "mm" });

// Create the main box primitive (centered on XY, extending in +Z)
const rawCube = box(sideLength, sideLength, sideLength);

// Center the cube along the Z axis as well (origin at center of volume)
const centeredCube = rawCube.translate(0, 0, -sideLength / 2);

// Apply a nice visual color
const coloredCube = centeredCube.color("#4a90e2");

// Return the final shape
return {
  "a-small-solid-cube-with-10mm-sides.": coloredCube
};
