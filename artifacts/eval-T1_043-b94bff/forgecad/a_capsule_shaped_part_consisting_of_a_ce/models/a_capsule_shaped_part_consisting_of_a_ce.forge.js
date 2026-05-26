/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A capsule-shaped part consisting of a central cylinder capped with hemispheres on both ends.
 * Workflow ID : eval-T1_043-b94bff
 * Trace ID    : 307e79f5-771b-4b3e-9be8-430f149fdb51
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 30.0 × 30.0 × 80.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_043-b94bff/step/T1_043_outer0_attempt0.step
 *   STL    : artifact://eval-T1_043-b94bff/stl/T1_043_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the hemispheres are perfectly tangent to the cylinder ends. The cylinder height is 50mm, and each hemispherical cap adds 15mm to the height, resulting in a total height of 80mm.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file capsule.forge.js
 * @description A capsule-shaped part consisting of a central cylinder capped with hemispheres on both ends.
 */

// Define parameters for the capsule
const diameter = Param.number("Cylinder Diameter", 30, { min: 1, max: 200, unit: "mm" });
const height = Param.number("Cylinder Height", 50, { min: 1, max: 500, unit: "mm" });

// Derive radius from diameter
const radius = diameter / 2;

// Create the central cylinder (extends from Z=0 to Z=height)
const centralCylinder = cylinder(height, radius);

// Create the bottom sphere (centered at origin, forming the bottom hemispherical cap)
const bottomCap = sphere(radius);

// Create the top sphere (translated to the top of the cylinder)
const topCap = sphere(radius).translate(0, 0, height);

// Combine all parts into a single capsule shape using union operations
const capsule = centralCylinder.union(bottomCap).union(topCap).color("#5f87c6");

// Return the final shape map as specified
return {
  "a-capsule-shaped-part-consisting-of-a-ce": capsule,
};
