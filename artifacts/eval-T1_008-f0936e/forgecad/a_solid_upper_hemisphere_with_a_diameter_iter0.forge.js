/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A solid upper hemisphere with a diameter of 50mm, flat face on the XY plane, dome rising in the +Z direction, and centered at the origin.
 * Workflow ID : eval-T1_008-f0936e
 * Trace ID    : 8d7d50d0-df06-4592-b19b-c2af298af44b
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 50.0 × 50.0 × 25.0 mm
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
 *   STEP   : artifact://eval-T1_008-f0936e/step/T1_008_outer0_attempt0.step
 *   STL    : artifact://eval-T1_008-f0936e/stl/T1_008_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   To model this, you can create a sphere of radius 25mm centered at (0,0,0) and cut it at the Z=0 plane to keep the positive Z half, or sketch a quarter-circle of radius 25mm on the XZ plane (from X=0 to 25, Z=0 to 25) and revolve it 360 degrees around the Z-axis.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file hemisphere.forge.js
 * @description A solid upper hemisphere with a parametric diameter, flat on the XY plane, rising in +Z.
 */

// Define the diameter parameter
const diameter = Param.number("Diameter", 50, { min: 1, max: 500, unit: "mm" });

// Calculate the radius
const radius = diameter / 2;

// Create the base sphere centered at the origin
const fullSphere = sphere(radius);

// Create a bounding box for the upper half (centered on XY, extends in +Z)
const upperBox = box(diameter, diameter, radius);

// Intersect the sphere with the upper box to get the upper hemisphere
const hemisphere = fullSphere.intersect(upperBox).color("#5f87c6");

// Return the final shape
return {
  "a-solid-upper-hemisphere-with-a-diameter": hemisphere
};
