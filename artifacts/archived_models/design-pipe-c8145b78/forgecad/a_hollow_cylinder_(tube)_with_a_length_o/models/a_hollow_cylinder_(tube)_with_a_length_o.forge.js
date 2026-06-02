/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A hollow cylinder (tube) with a length of 200mm, an inner diameter of 50mm, and a coaxial 100mm diameter flange at one end.
 * Workflow ID : design-pipe-c8145b78
 * Trace ID    : aa8436a2-e3bd-41ec-88fe-96e33a407a6b
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 100.0 × 100.0 × 200.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 50.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://design-pipe-c8145b78/step/pipe_outer0_attempt0.step
 *   STL    : artifact://design-pipe-c8145b78/stl/pipe_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Assume a tube wall thickness of 5mm (making the tube outer diameter 60mm). Assume the flange is 10mm thick, located at one end of the 200mm long tube, and shares the 50mm inner through-hole. The entire part should be aligned along the Z-axis.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

// Parameters for the hollow tube and flange
const tubeLength = Param.number("Tube Length", 200, { min: 10, max: 500, unit: "mm" });
const innerDiameter = Param.number("Inner Diameter", 50, { min: 5, max: 200, unit: "mm" });
const tubeOuterDiameter = Param.number("Tube Outer Diameter", 60, { min: 10, max: 250, unit: "mm" });
const flangeOuterDiameter = Param.number("Flange Outer Diameter", 100, { min: 20, max: 400, unit: "mm" });
const flangeThickness = Param.number("Flange Thickness", 10, { min: 1, max: 100, unit: "mm" });

// Calculate radii from diameters
const innerRadius = innerDiameter / 2;
const tubeOuterRadius = tubeOuterDiameter / 2;
const flangeOuterRadius = flangeOuterDiameter / 2;

// Create the outer cylindrical tube extending in +Z
const tube = cylinder(tubeLength, tubeOuterRadius);

// Create the coaxial flange at the bottom end of the tube
const flange = cylinder(flangeThickness, flangeOuterRadius);

// Create the inner core cylinder for the hollow through-hole (offset to avoid coplanar face issues)
const hole = cylinder(tubeLength + 2, innerRadius).translate(0, 0, -1);

// Merge the outer bodies and subtract the inner hole to make it hollow
const finalShape = tube.union(flange).subtract(hole).color("#5f87c6");

// Export the final part under the requested name
return {
  "a-hollow-cylinder-(tube)-with-a-length-o": finalShape
};
