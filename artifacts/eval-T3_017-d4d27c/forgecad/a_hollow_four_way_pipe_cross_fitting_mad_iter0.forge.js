/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A hollow four-way pipe cross fitting made of two perpendicular intersecting pipes centered at the origin.
 * Workflow ID : eval-T3_017-d4d27c
 * Trace ID    : 10796f6f-5ecd-4986-a8f7-5ebec95b2b4c
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 100.0 × 30.0 × 100.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 4 hole(s) of diameter 24.0 mm (×4)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_017-d4d27c/step/T3_017_outer0_attempt0.step
 *   STL    : artifact://eval-T3_017-d4d27c/stl/T3_017_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure that the internal bores are fully subtracted to create a continuous '+' shaped internal passage. Construct the outer shape by unioning the two outer cylinders first, then unioning the two inner cylinders, and finally subtracting the combined inner cylinders from the combined outer cylinders.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Four-way pipe cross fitting.
 * Two perpendicular hollow pipes intersecting at the origin.
 */

// Define parameters for customizer sliders
const pipeLength = Param.number("Pipe Length", 100, { min: 10, max: 500, unit: "mm" });
const outerDia = Param.number("Outer Diameter", 30, { min: 5, max: 200, unit: "mm" });
const innerDia = Param.number("Inner Diameter", 24, { min: 1, max: 190, unit: "mm" });

// Calculate radii from diameters
const rOuter = outerDia / 2;
const rInner = innerDia / 2;

// Create the outer cylinder along the X-axis, rotated and centered
const outerX = cylinder(pipeLength, rOuter)
  .rotate([0, 1, 0], 90)
  .translate([-pipeLength / 2, 0, 0]);

// Create the outer cylinder along the Z-axis, centered
const outerZ = cylinder(pipeLength, rOuter)
  .translate([0, 0, -pipeLength / 2]);

// Combine the two outer solid cylinders
const outerCombined = outerX.union(outerZ);

// Create the inner cylinder along the X-axis (extended slightly for a clean cut)
const innerX = cylinder(pipeLength + 2, rInner)
  .rotate([0, 1, 0], 90)
  .translate([-(pipeLength + 2) / 2, 0, 0]);

// Create the inner cylinder along the Z-axis (extended slightly for a clean cut)
const innerZ = cylinder(pipeLength + 2, rInner)
  .translate([0, 0, -(pipeLength + 2) / 2]);

// Combine the two inner cylinders to form the hollow passage core
const innerCombined = innerX.union(innerZ);

// Subtract the inner passages from the outer shell and apply a finish color
const finalShape = outerCombined.subtract(innerCombined).color("#5f87c6");

// Return the final fitting geometry
return {
  "a-hollow-four-way-pipe-cross-fitting-mad": finalShape,
};
