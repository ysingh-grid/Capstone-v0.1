/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A 200mm long hollow tube with a 50mm inner diameter, featuring a 100mm outer diameter flange on one end.
 * Workflow ID : design-part-f0770b2d
 * Trace ID    : f8a2836b-cba5-4ec0-82dd-4594539cd27a
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 100.0 × 100.0 × 200.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 50.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 10.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://design-part-f0770b2d/step/part_outer0_attempt0.step
 *   STL    : artifact://design-part-f0770b2d/stl/part_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The tube and flange must be concentric. The 50mm inner hole must be continuous and completely through the entire 200mm length of the part. Tube wall thickness is assumed to be 10mm (70mm OD) and flange thickness is assumed to be 15mm.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

// Define parameters for the hollow tube and flange
const tubeLength = Param.number("Tube Length", 200, { min: 50, max: 500, unit: "mm" });
const innerDiameter = Param.number("Inner Diameter", 50, { min: 10, max: 200, unit: "mm" });
const tubeOuterDiameter = Param.number("Tube Outer Diameter", 70, { min: 20, max: 250, unit: "mm" });
const flangeOuterDiameter = Param.number("Flange Outer Diameter", 100, { min: 50, max: 400, unit: "mm" });
const flangeThickness = Param.number("Flange Thickness", 15, { min: 5, max: 100, unit: "mm" });

// Calculate radii from diameters
const innerRadius = innerDiameter / 2;
const tubeOuterRadius = tubeOuterDiameter / 2;
const flangeOuterRadius = flangeOuterDiameter / 2;

// Create the main outer tube cylinder extending in +Z
const tubeOuter = cylinder(tubeLength, tubeOuterRadius);

// Create the flange cylinder at the base extending in +Z
const flange = cylinder(flangeThickness, flangeOuterRadius);

// Union the outer solid parts to form a single continuous shape
const solidBody = tubeOuter.union(flange);

// Create the central pass-through cylinder, extended slightly to ensure a clean boolean cut
const holeCutter = cylinder(tubeLength + 10, innerRadius).translate(0, 0, -5);

// Subtract the hole cutter from the solid body to finalize the hollow design
const finalShape = solidBody.subtract(holeCutter).color("#5f87c6");

// Return the final assembly under the requested part key
return {
  "a-200mm-long-hollow-tube-with-a-50mm-inn": finalShape
};
