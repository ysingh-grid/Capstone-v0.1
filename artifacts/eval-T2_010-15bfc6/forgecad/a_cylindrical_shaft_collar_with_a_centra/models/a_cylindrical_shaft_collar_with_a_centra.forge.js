/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A cylindrical shaft collar with a central bore and a single radial set screw hole through the wall.
 * Workflow ID : eval-T2_010-15bfc6
 * Trace ID    : e95d53d5-8385-4099-aafe-646fc821d333
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 25.0 × 25.0 × 12.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 2 hole(s) of diameter 5.0 mm (×2)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T2_010-15bfc6/step/T2_010_outer0_attempt1.step
 *   STL    : artifact://eval-T2_010-15bfc6/stl/T2_010_outer0_attempt1.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The prompt specifies 'Centered at the origin' but also 'mid-height (Z=6mm)'. To align with standard conventions: if the collar is centered at the origin, the Z-range should be -6 to 6 mm, and the set screw hole should be at Z=0. If the base of the collar is at Z=0, then the mid-height is indeed Z=6mm. The Coder should prioritize centering the entire bounding box at the origin (X: [-12.5, 12.5], Y: [-12.5, 12.5], Z: [-6, 6]), which puts the radial hole at Z=0 along the X-axis.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * A cylindrical shaft collar with a central bore and a single radial set screw hole.
 */

// Define parameters for the shaft collar
const outerDiameter = Param.number("Outer Diameter", 25.0, { min: 5, max: 100, unit: "mm" });
const innerDiameter = Param.number("Inner Diameter", 15.0, { min: 2, max: 90, unit: "mm" });
const height = Param.number("Height", 12.0, { min: 2, max: 100, unit: "mm" });
const setScrewDiameter = Param.number("Set Screw Diameter", 5.0, { min: 1, max: 20, unit: "mm" });

// Derive radii from diameters
const outerRadius = outerDiameter / 2;
const innerRadius = innerDiameter / 2;
const screwRadius = setScrewDiameter / 2;

// Create the main outer cylindrical body centered at Z=0
const outerCyl = cylinder(height, outerRadius)
  .translate(0, 0, -height / 2);

// Create the coaxial inner bore cylinder (slightly taller for clean subtraction)
const boreCyl = cylinder(height + 2, innerRadius)
  .translate(0, 0, -(height + 2) / 2);

// Obtain the hollow ring by subtracting the inner bore
const ring = outerCyl.subtract(boreCyl);

// Create a radial set screw hole cylinder, rotated to lie along the X-axis, positioned to drill through one wall
const screwHoleLength = outerRadius + 5;
const screwHole = cylinder(screwHoleLength, screwRadius)
  .rotate([0, 1, 0], 90)
  .translate(-2, 0, 0); // Offset slightly to guarantee a clean cut from the inner wall to the exterior

// Subtract the set screw hole from the ring body
const finalCollar = ring.subtract(screwHole).color("#5f87c6");

// Return the final geometry
return {
  "a-cylindrical-shaft-collar-with-a-centra": finalCollar
};
