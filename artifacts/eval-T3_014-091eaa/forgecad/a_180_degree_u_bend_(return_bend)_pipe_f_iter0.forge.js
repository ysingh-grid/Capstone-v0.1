/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A 180-degree U-bend (return bend) pipe fitting with a 20mm outer diameter and 16mm inner diameter, curving in the XZ plane with a centerline radius of 35mm.
 * Workflow ID : eval-T3_014-091eaa
 * Trace ID    : 294e80a0-8c83-4c1b-a708-8088cb3f801e
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 90.0 × 20.0 × 45.0 mm
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
 *   STEP   : artifact://eval-T3_014-091eaa/step/T3_014_outer0_attempt0.step
 *   STL    : artifact://eval-T3_014-091eaa/stl/T3_014_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The part should be constructed by sweeping a hollow pipe cross-section (concentric circles of OD 20mm and ID 16mm) along a 180-degree semicircular arc of radius 35mm on the XZ plane. The path starts at (0,0,0) and ends at (70,0,0) with the apex of the curve reaching Z=35.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 180-degree U-bend (return bend) pipe fitting
 * Follows a semicircular arc of 35mm radius in the XZ plane.
 */

// Define parameters
const bendRadius = Param.number("Bend Radius", 35, { min: 10, max: 200, unit: "mm" });
const outerDiameter = Param.number("Outer Diameter", 20, { min: 5, max: 100, unit: "mm" });
const innerDiameter = Param.number("Inner Diameter", 16, { min: 4, max: 95, unit: "mm" });

// Calculate minor radii for the torus
const outerMinorRadius = outerDiameter / 2;
const innerMinorRadius = innerDiameter / 2;

// Create the outer solid torus
const outerTorus = torus(bendRadius, outerMinorRadius);

// Create the inner solid torus for hollowing
const innerTorus = torus(bendRadius, innerMinorRadius);

// Subtract inner torus from outer torus to make a hollow pipe
const hollowTorus = outerTorus.subtract(innerTorus);

// Create a box to cut the torus in half (keeping Y >= 0)
const boxSize = (bendRadius + outerMinorRadius) * 2.5;
const boxW = boxSize;
const boxD = boxSize / 2;
const boxH = boxSize;

// Position the cutter box to span Y from 0 to boxD, and Z from -boxH/2 to boxH/2
const cutter = box(boxW, boxD, boxH).translate(0, boxD / 2, -boxH / 2);

// Intersect to get the 180-degree bend
const halfTorus = hollowTorus.intersect(cutter);

// Rotate the bend from XY plane to XZ plane (apex at +Z)
const rotatedBend = halfTorus.rotate([1, 0, 0], 90);

// Translate the bend so it starts at (0,0,0) and ends at (2*bendRadius, 0, 0)
const finalShape = rotatedBend.translate(bendRadius, 0, 0).color("#c87533");

// Return the final assembly
return {
  "a-180-degree-u-bend-(return-bend)-pipe-f": finalShape,
};
