/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A solid concentric ring with an outer diameter of 40mm, inner diameter of 30mm, and a height of 12mm.
 * Workflow ID : eval-T1_041-e9f177
 * Trace ID    : 70ec0238-ccd5-41b5-b9f0-290ed4589216
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 40.0 × 40.0 × 12.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 30.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_041-e9f177/step/T1_041_outer0_attempt0.step
 *   STL    : artifact://eval-T1_041-e9f177/stl/T1_041_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The part should be modeled as a subtraction of an inner cylinder (diameter 30mm) from an outer cylinder (diameter 40mm), both centered at the origin. Ensure high mesh resolution (e.g., fn=100 in OpenSCAD or equivalent) to maintain roundness.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Solid concentric ring model
 * Generates a ring with user-defined height, outer diameter, and inner diameter.
 */

// Define dimensions as interactive parameters
const height = Param.number("Height", 12, { min: 1, max: 200, unit: "mm" });
const outerDiameter = Param.number("Outer Diameter", 40, { min: 10, max: 500, unit: "mm" });
const innerDiameter = Param.number("Inner Diameter", 30, { min: 5, max: 490, unit: "mm" });

// Calculate radii from diameters
const outerRadius = outerDiameter / 2;
const innerRadius = innerDiameter / 2;

// Create the outer cylinder
const outerCylinder = cylinder(height, outerRadius);

// Create the inner cylinder used for cutting the hole
const innerCylinder = cylinder(height, innerRadius);

// Subtract the inner cylinder from the outer cylinder to create the ring body
const ring = outerCylinder.subtract(innerCylinder).color("#4a90e2");

// Return the final shape
return {
  "a-solid-concentric-ring-with-an-outer-di": ring
};
