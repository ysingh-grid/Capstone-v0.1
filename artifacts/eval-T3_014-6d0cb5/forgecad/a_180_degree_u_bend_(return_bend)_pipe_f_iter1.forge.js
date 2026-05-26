/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A 180-degree U-bend (return bend) pipe fitting with a 20mm outer diameter and 16mm inner diameter, formed by sweeping a circular profile along a 35mm radius semicircular path in the XZ plane.
 * Workflow ID : eval-T3_014-6d0cb5
 * Trace ID    : e29e19d8-08ce-4e47-9b41-12f2e2febde8
 * Iteration   : 1
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 90.0 × 20.0 × 45.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 2 hole(s) of diameter 16.0 mm (×2)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_014-6d0cb5/step/T3_014_outer1_attempt0.step
 *   STL    : artifact://eval-T3_014-6d0cb5/stl/T3_014_outer1_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   To model this, first define the path in the XZ plane as a 180-degree arc from (0,0,0) to (70,0,0) with a radius of 35mm centered at (35,0,0). Then, define the profile in the XY plane (perpendicular to the path start) as two concentric circles with diameters 20mm and 16mm centered at (0,0,0). Sweep the profile along the path to generate the hollow U-bend.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: 180-Degree U-Bend Pipe Fitting
 * 
 * A 180-degree U-bend (return bend) pipe fitting with a 20mm outer diameter
 * and 16mm inner diameter, formed by a 35mm radius semicircular path in the XZ plane.
 */

// Define parameters for the U-bend pipe fitting
const bendRadius = Param.number("Bend Radius", 35, { min: 10, max: 200, unit: "mm" });
const outerDiameter = Param.number("Outer Diameter", 20, { min: 5, max: 100, unit: "mm" });
const innerDiameter = Param.number("Inner Diameter", 16, { min: 4, max: 95, unit: "mm" });

// Calculate outer and inner radii of the pipe profile
const rOuter = outerDiameter / 2;
const rInner = innerDiameter / 2;

// Create the outer and inner tori to form the pipe volume
const outerTorus = torus(bendRadius, rOuter);
const innerTorus = torus(bendRadius, rInner);

// Hollow out the torus to create the pipe structure
const fullPipeTorus = outerTorus.subtract(innerTorus);

// Rotate the torus from the XY plane to the XZ plane (rotate 90 degrees around X-axis)
const rotatedBend = fullPipeTorus.rotate([1, 0, 0], 90);

// Translate the bend so that the starting point of the centerline is at (0, 0, 0)
// and the ending point is at (2 * bendRadius, 0, 0)
const translatedBend = rotatedBend.translate(bendRadius, 0, 0);

// Create a cutting box to remove the bottom half (Z < 0) of the translated torus, leaving only the 180-degree bend
// The box is centered on XY and extends in +Z, so we translate it downwards to cover Z < 0.
const cutBox = box(200, 200, 200).translate(bendRadius, 0, -200);
const finalShape = translatedBend.subtract(cutBox).color("#5f87c6");

// Return the final assembly map containing the U-bend pipe fitting
return {
  "a-180-degree-u-bend-(return-bend)-pipe-f": finalShape
};
