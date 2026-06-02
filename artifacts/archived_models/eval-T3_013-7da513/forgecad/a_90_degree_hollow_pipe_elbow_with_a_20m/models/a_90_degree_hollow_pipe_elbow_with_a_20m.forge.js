/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A 90-degree hollow pipe elbow with a 20mm outer diameter and 16mm inner diameter, swept along a 40mm radius quarter-circle arc in the XZ plane.
 * Workflow ID : eval-T3_013-7da513
 * Trace ID    : 89e7f3f1-e1a6-4da6-b8a0-290cce0d2047
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 50.0 × 20.0 × 50.0 mm
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
 *   STEP   : artifact://eval-T3_013-7da513/step/T3_013_outer0_attempt0.step
 *   STL    : artifact://eval-T3_013-7da513/stl/T3_013_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   To construct this part, first sketch the annular cross-section (two concentric circles of diameter 20mm and 16mm) on the XY plane centered at the origin. Then, sketch the sweep path on the XZ plane as a 90-degree arc of radius 40mm starting at (0,0,0) and ending at (40,0,40) with the center of the arc at (40,0,0). Finally, perform a sweep of the annular profile along the arc path.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file a-90-degree-hollow-pipe-elbow-with-a-20m.forge.js
 * @description A 90-degree hollow pipe elbow with parametric dimensions.
 */

// Define parameters for the elbow pipe
const bendRadius = Param.number("Bend Radius", 40, { min: 10, max: 200, unit: "mm" });
const outerDiameter = Param.number("Outer Diameter", 20, { min: 5, max: 100, unit: "mm" });
const innerDiameter = Param.number("Inner Diameter", 16, { min: 4, max: 95, unit: "mm" });

// Calculate radii from diameters
const rOut = outerDiameter / 2;
const rIn = innerDiameter / 2;

// Create the outer and inner toruses to form the hollow pipe body
const outerTorus = torus(bendRadius, rOut);
const innerTorus = torus(bendRadius, rIn);
const hollowTorus = outerTorus.subtract(innerTorus);

// Rotate the torus 90 degrees around the X axis to align it with the XZ plane
const rotatedTorus = hollowTorus.rotate([1, 0, 0], 90);

// Define cutter box dimensions to isolate a 90-degree quadrant (X <= 0, Z >= 0)
const boxW = (bendRadius + rOut) * 2;
const boxD = rOut * 3;
const boxH = (bendRadius + rOut) * 2;

// Create and position the cutter box
const cutter = box(boxW, boxD, boxH).translate(-boxW / 2, 0, 0);

// Intersect the rotated torus with the cutter to get the 90-degree elbow segment
const quarterElbow = rotatedTorus.intersect(cutter);

// Translate the elbow to align the start at (0, 0, 0) and end at (bendRadius, 0, bendRadius)
const finalShape = quarterElbow.translate(bendRadius, 0, 0).color("#3a7bc8");

// Return the final geometry to the ForgeCAD viewer
return {
  "a-90-degree-hollow-pipe-elbow-with-a-20m": finalShape,
};
