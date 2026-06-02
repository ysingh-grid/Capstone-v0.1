/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A hollow cylindrical tube with a specified outer diameter, inner diameter, and length.
 * Workflow ID : eval-T1_026-5ba29e
 * Trace ID    : 75e79120-37f2-481e-b77b-0b7988f292b5
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 30.0 × 30.0 × 80.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 24.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_026-5ba29e/step/T1_026_outer0_attempt0.step
 *   STL    : artifact://eval-T1_026-5ba29e/stl/T1_026_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create the tube aligned along the Z-axis. Solid is created by extruding a ring (concentric circles of diameter 30mm and 24mm) by 80mm, or by subtracting an inner cylinder of diameter 24mm from an outer cylinder of diameter 30mm.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Hollow Cylindrical Tube
 * A cylindrical tube aligned along the Z-axis, with adjustable outer diameter, inner diameter, and length.
 */

// Define parameters for the hollow tube
const outerDiameter = Param.number("Outer Diameter", 30, { min: 5, max: 200, unit: "mm" });
const innerDiameter = Param.number("Inner Diameter", 24, { min: 1, max: 190, unit: "mm" });
const length = Param.number("Length", 80, { min: 10, max: 500, unit: "mm" });

// Calculate the radii from the diameters
const outerRadius = outerDiameter / 2;
const innerRadius = innerDiameter / 2;

// Create the outer solid cylinder along the Z-axis
const outerCylinder = cylinder(length, outerRadius);

// Create the inner cylinder to be subtracted
const innerCylinder = cylinder(length, innerRadius);

// Subtract the inner cylinder from the outer cylinder to create the hollow tube
const hollowTube = outerCylinder.subtract(innerCylinder);

// Color the final tube with a clean metallic steel color
const finalShape = hollowTube.color("#8a95a5");

// Return the final shape
return {
  "a-hollow-cylindrical-tube-with-a-specifi": finalShape,
};
