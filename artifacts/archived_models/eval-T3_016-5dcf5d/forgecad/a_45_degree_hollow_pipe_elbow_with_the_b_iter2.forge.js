/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A 45-degree hollow pipe elbow with the bend in the XZ plane, featuring a 20mm outer diameter, 16mm inner diameter, and a 40mm centerline bend radius.
 * Workflow ID : eval-T3_016-5dcf5d
 * Trace ID    : 7e5e018d-d609-4934-b258-73cf25596b5b
 * Iteration   : 2
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 28.8 × 20.0 × 35.4 mm
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
 *   STEP   : artifact://eval-T3_016-5dcf5d/step/T3_016_outer2_attempt0.step
 *   STL    : artifact://eval-T3_016-5dcf5d/stl/T3_016_outer2_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create the pipe cross-section (donut shape with OD=20mm, ID=16mm) on the XY plane centered at the origin. Sweep this sketch along a 45-degree arc in the XZ plane. The arc must start at (0,0,0) tangent to the Z-axis (heading +Z) and curve toward the +X direction with a radius of 40mm, ending at approximately (11.72, 0, 28.28).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: 45-Degree Hollow Pipe Elbow
 * A parametric 45-degree pipe elbow in the XZ plane.
 * Follows a 40mm centerline bend radius, 20mm outer diameter, 16mm inner diameter.
 */

// Key design parameters
const bendRadius = Param.number("Bend Radius", 40, { min: 10, max: 200, unit: "mm" });
const outerDiameter = Param.number("Outer Diameter", 20, { min: 5, max: 100, unit: "mm" });
const innerDiameter = Param.number("Inner Diameter", 16, { min: 2, max: 95, unit: "mm" });
const bendAngle = Param.number("Bend Angle", 45, { min: 10, max: 180, unit: "deg" });

// Derived dimensions
const rOut = outerDiameter / 2;
const rIn = innerDiameter / 2;

// Create the outer torus and rotate to XZ plane, then translate to match the bend origin
const outerTorus = torus(bendRadius, rOut)
  .rotate([1, 0, 0], 90)
  .translate(bendRadius, 0, 0);

// Create the inner torus for the hollow path, rotated and translated identically
const innerTorus = torus(bendRadius, rIn)
  .rotate([1, 0, 0], 90)
  .translate(bendRadius, 0, 0);

// Subtract the inner torus to create the hollow pipe structure
const hollowTorus = outerTorus.subtract(innerTorus);

// Define dynamic box size for clean cutting boundaries
const boxSize = bendRadius * 6;
const halfBox = boxSize / 2;

// First cutter: Removes everything below Z=0 (start of the bend)
const cutStart = box(boxSize, boxSize, boxSize)
  .translate(bendRadius, 0, -halfBox);

// Second cutter: Removes everything beyond the specified bend angle
const cutEnd = box(boxSize, boxSize, boxSize)
  .translate(halfBox, 0, halfBox)
  .rotate([0, 1, 0], -bendAngle)
  .translate(bendRadius, 0, 0);

// Apply the cuts to isolate the precise angle segment
const finalShape = hollowTorus
  .subtract(cutStart)
  .subtract(cutEnd)
  .color("#5f87c6");

// Return the final assembly map
return {
  "a-45-degree-hollow-pipe-elbow-with-the-b": finalShape
};
