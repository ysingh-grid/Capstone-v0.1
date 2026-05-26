/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A 30mm cube with 2mm chamfers on all 12 edges.
 * Workflow ID : eval-T1_024-e388d0
 * Trace ID    : 35938bba-c588-4a36-97ec-4eee0be60277
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 30.0 × 30.0 × 30.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.98
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_024-e388d0/step/T1_024_outer0_attempt0.step
 *   STL    : artifact://eval-T1_024-e388d0/stl/T1_024_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create a 30x30x30 mm box centered at the origin. Apply a 2mm chamfer to all 12 edges. Ensure the coordinate system is centered to preserve symmetry.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file a-30mm-cube-with-2mm-chamfers-on-all-12-.forge.js
 * @description A parametric 30mm cube with 2mm chamfers on all 12 edges, constructed using highly efficient CSG intersections.
 */

// Define the design parameters
const side = Param.number("Side Length", 30, { min: 5, max: 200, unit: "mm" });
const chamfer = Param.number("Chamfer Size", 2, { min: 0.1, max: 20, unit: "mm" });

// Calculate helper dimensions for the octagonal cutters
// The distance from origin to the chamfer plane is (side - chamfer) / sqrt(2)
// Therefore, the width of the 45-degree rotated cutter box is sqrt(2) * (side - chamfer)
const w2 = Math.sqrt(2) * (side - chamfer);
const l = side * 1.5; // Ensure cutters are sufficiently long to avoid boundary artifacts

// Create the main cube, centered at the origin
const cube = box(side, side, side).translate(0, 0, -side / 2);

// Create the octagonal cutter along the Z-axis
const cutterZ = box(w2, w2, l).translate(0, 0, -l / 2).rotate([0, 0, 1], 45);

// Rotate the Z-cutter to align with X and Y axes
const cutterX = cutterZ.rotate([0, 1, 0], 90);
const cutterY = cutterZ.rotate([1, 0, 0], 90);

// Intersect the base cube with all three orthogonal cutters to produce chamfered edges and corners
const finalShape = cube
  .intersect(cutterZ)
  .intersect(cutterX)
  .intersect(cutterY)
  .color("#c0c0c0");

// Return the final shape
return {
  "a-30mm-cube-with-2mm-chamfers-on-all-12-": finalShape,
};
