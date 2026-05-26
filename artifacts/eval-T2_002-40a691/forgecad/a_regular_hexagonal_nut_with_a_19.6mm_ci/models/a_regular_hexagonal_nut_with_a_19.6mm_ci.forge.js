/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A regular hexagonal nut with a 19.6mm circumscribed circle diameter (17mm across flats), 8mm tall, featuring a central 10mm through-hole aligned along the Z-axis, centered at the origin and resting on the XY plane.
 * Workflow ID : eval-T2_002-40a691
 * Trace ID    : e9891481-e91e-4468-bbf9-366a89c78598
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 19.6 × 16.97 × 8.0 mm
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
 *   STEP   : artifact://eval-T2_002-40a691/step/T2_002_outer0_attempt0.step
 *   STL    : artifact://eval-T2_002-40a691/stl/T2_002_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the hexagon is generated using a regular polygon approach with a circumscribed radius of 9.8mm (diameter 19.6mm). The base of the nut must lie exactly on Z=0, and the through-hole must completely penetrate the body from Z=0 to Z=8.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file Hexagonal Nut
 * @description A regular hexagonal nut with a 19.6mm circumscribed circle diameter,
 * 8mm tall, and a 10mm central through-hole aligned along the Z-axis.
 */

// Define parameters for the hexagonal nut
const circDia = Param.number("Circumscribed Diameter", 19.6, { min: 10, max: 100, unit: "mm" });
const height = Param.number("Height", 8.0, { min: 1, max: 50, unit: "mm" });
const holeDia = Param.number("Hole Diameter", 10.0, { min: 1, max: 40, unit: "mm" });

// Calculate across-flats distance for a regular hexagon
const acrossFlats = circDia * Math.cos(Math.PI / 6);

// Create the three intersecting boxes to form the hexagonal prism
const boxLength = circDia * 2.0; // Ensure the box is long enough to cover the corners
const b1 = box(acrossFlats, boxLength, height);
const b2 = box(acrossFlats, boxLength, height).rotate([0, 0, 1], 60);
const b3 = box(acrossFlats, boxLength, height).rotate([0, 0, 1], 120);

// Intersect the three boxes to create the hexagonal outer body
const hexBody = b1.intersect(b2).intersect(b3);

// Create the central through-hole cylinder (slightly taller to ensure a clean cut)
const hole = cylinder(height + 2, holeDia / 2).translate(0, 0, -1);

// Subtract the hole from the hexagonal body
const finalNut = hexBody.subtract(hole).color("#c0c0c0");

// Return the final assembly
return {
  "a-regular-hexagonal-nut-with-a-19.6mm-ci": finalNut
};
