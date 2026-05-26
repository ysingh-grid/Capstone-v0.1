/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A dome-shaped part consisting of a flat circular base topped by a matching hemisphere, centered at the origin on the XY plane.
 * Workflow ID : eval-T1_028-b2ee4f
 * Trace ID    : 3a7dacc4-c9e0-401b-87ed-e635ca36ca6e
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 40.0 × 40.0 × 23.0 mm
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
 *   STEP   : artifact://eval-T1_028-b2ee4f/step/T1_028_outer0_attempt0.step
 *   STL    : artifact://eval-T1_028-b2ee4f/stl/T1_028_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The part is centered at (0, 0, 0) on the XY plane. The base occupies Z=0 to Z=3. The hemisphere is centered at (0, 0, 3) and extends to Z=23. Ensure a seamless union between the base cylinder and the top hemisphere.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * A dome-shaped part consisting of a flat circular base topped by a matching hemisphere,
 * centered at the origin on the XY plane.
 */

// Parameters
const diameter = Param.number("Base Diameter", 40, { min: 5, max: 200, unit: "mm" });
const base_thickness = Param.number("Base Thickness", 3, { min: 0.5, max: 50, unit: "mm" });

// Derived dimensions
const radius = diameter / 2;

// Create the flat circular base cylinder (extends from Z=0 to Z=base_thickness)
const base = cylinder(base_thickness, radius);

// Create the sphere for the top dome, positioned at the top of the base
const sph = sphere(radius).translate(0, 0, base_thickness);

// Create a box cutter to extract the top hemisphere (slightly oversized to ensure clean intersection)
const cutter = box(diameter * 1.2, diameter * 1.2, radius * 1.2).translate(0, 0, base_thickness);

// Intersect the sphere with the upper box cutter to create the hemisphere
const hemisphere = sph.intersect(cutter);

// Union the base and the hemisphere into a single seamless part
const finalShape = base.union(hemisphere).color("#5f87c6");

// Export the final model
return {
  "a-dome-shaped-part-consisting-of-a-flat-": finalShape
};
