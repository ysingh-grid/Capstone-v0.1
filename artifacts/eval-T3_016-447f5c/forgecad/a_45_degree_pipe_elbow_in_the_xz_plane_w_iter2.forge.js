/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A 45-degree pipe elbow in the XZ plane with a 20mm outer diameter, 16mm inner diameter, and a 40mm bend radius.
 * Workflow ID : eval-T3_016-447f5c
 * Trace ID    : 12e1ffa4-7a0c-4951-9397-27c288f19371
 * Iteration   : 2
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 28.79 × 20.0 × 35.35 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 16.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_016-447f5c/step/T3_016_outer2_attempt0.step
 *   STL    : artifact://eval-T3_016-447f5c/stl/T3_016_outer2_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   To model this part: 1. Create a sketch on the XZ plane containing a 45-degree arc of radius 40mm, starting at (0,0,0) and ending at (11.72, 0, 28.28) with the center of the arc at (40, 0, 0). 2. Create a sketch on the XY plane containing two concentric circles of diameter 20mm and 16mm, centered at the origin (0,0,0). 3. Sweep the circular profile along the arc path to create the hollow elbow.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * A 45-degree pipe elbow in the XZ plane with custom dimensions.
 */

// Parameters
const outer_diameter = Param.number("Outer Diameter", 20, { min: 5, max: 100, unit: "mm" });
const inner_diameter = Param.number("Inner Diameter", 16, { min: 2, max: 95, unit: "mm" });
const bend_radius    = Param.number("Bend Radius", 40, { min: 10, max: 200, unit: "mm" });
const bend_angle     = Param.number("Bend Angle", 45, { min: 0, max: 90, unit: "deg" });

// Derived dimensions
const r_out = outer_diameter / 2;
const r_in = inner_diameter / 2;
const size = bend_radius * 4;

// Create the hollow tube using torus shapes
const outerTorus = torus(bend_radius, r_out);
const innerTorus = torus(bend_radius, r_in);
const pipe = outerTorus.subtract(innerTorus);

// Create cutting boxes to slice the torus to the specified angle
const cutYNeg = box(size, size, size).translate(0, -size / 2, -size / 2);
const cut45 = box(size, size, size).translate(0, size / 2, -size / 2).rotate([0, 0, 1], bend_angle);

// Slice the pipe
const segment = pipe.subtract(cutYNeg).subtract(cut45);

// Orient the segment to start at origin, heading +Z, curving towards +X in XZ plane
const finalShape = segment
  .mirror([1, 0, 0])
  .rotate([1, 0, 0], 90)
  .translate(bend_radius, 0, 0)
  .color("#5f87c6");

return {
  "a-45-degree-pipe-elbow-in-the-xz-plane-w": finalShape,
};
