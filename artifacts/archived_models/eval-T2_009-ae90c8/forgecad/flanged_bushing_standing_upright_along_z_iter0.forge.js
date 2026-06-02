/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Flanged bushing standing upright along Z, centered at the origin in XY. The bottom flange is 30mm in diameter and 3mm thick. The cylindrical body extends from Z=3 to Z=33 with a 20mm diameter. A 10mm diameter central bore runs through the entire 33mm length.
 * Workflow ID : eval-T2_009-ae90c8
 * Trace ID    : 6a6f5b30-ba26-464d-b7cf-49905478c21e
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 30.0 × 30.0 × 33.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 10.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T2_009-ae90c8/step/T2_009_outer0_attempt0.step
 *   STL    : artifact://eval-T2_009-ae90c8/stl/T2_009_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Position the base of the flange at Z=0, centered at (0,0) in XY. Use a boolean subtraction to create the central through-bore from Z=0 to Z=33.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Flanged Bushing
 * Centered at the origin, standing upright along Z.
 */

// Define parameters for the flanged bushing
const flangeOD = Param.number("Flange Outer Diameter", 30, { min: 10, max: 100, unit: "mm" });
const flangeThickness = Param.number("Flange Thickness", 3, { min: 1, max: 20, unit: "mm" });
const bodyOD = Param.number("Body Outer Diameter", 20, { min: 5, max: 80, unit: "mm" });
const bodyLength = Param.number("Body Length", 30, { min: 5, max: 200, unit: "mm" });
const boreDiameter = Param.number("Bore Diameter", 10, { min: 2, max: 50, unit: "mm" });

// Calculate radii from diameters
const flangeRadius = flangeOD / 2;
const bodyRadius = bodyOD / 2;
const boreRadius = boreDiameter / 2;

// Create the bottom flange at Z = 0
const flange = cylinder(flangeThickness, flangeRadius);

// Create the cylindrical body, translated to sit on top of the flange
const body = cylinder(bodyLength, bodyRadius).translate(0, 0, flangeThickness);

// Combine flange and body into a single solid
const solidBody = flange.union(body);

// Create the central bore cylinder, slightly taller to ensure a clean through-cut
const totalHeight = flangeThickness + bodyLength;
const bore = cylinder(totalHeight + 2, boreRadius).translate(0, 0, -1);

// Subtract the bore from the solid body to create the final flanged bushing
const finalShape = solidBody.subtract(bore).color("#5f87c6");

// Return the final shape
return {
  "flanged-bushing-standing-upright-along-z": finalShape
};
