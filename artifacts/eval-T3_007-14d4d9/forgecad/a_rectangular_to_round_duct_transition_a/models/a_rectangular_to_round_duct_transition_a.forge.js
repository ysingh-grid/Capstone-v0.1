/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A rectangular-to-round duct transition adapter standing upright along the Z-axis, consisting of a rectangular flange at the bottom, a lofted transition section, and a cylindrical neck at the top.
 * Workflow ID : eval-T3_007-14d4d9
 * Trace ID    : 210f1e80-14a6-4bb6-af7b-589957102645
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 70.0 × 50.0 × 63.0 mm
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
 *   STEP   : artifact://eval-T3_007-14d4d9/step/T3_007_outer0_attempt0.step
 *   STL    : artifact://eval-T3_007-14d4d9/stl/T3_007_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The adapter is designed as a solid. The loft section transitions from a 60x40mm rectangle at Z=3 to a 30mm diameter circle at Z=53. Ensure all sections are perfectly centered at (0, 0) in the XY plane.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file Rectangular-to-round duct transition adapter.
 */

// Define parameters for the flange
const flange_width = Param.number("Flange Width", 70, { min: 10, max: 500, unit: "mm" });
const flange_depth = Param.number("Flange Depth", 50, { min: 10, max: 500, unit: "mm" });
const flange_thickness = Param.number("Flange Thickness", 3, { min: 1, max: 200, unit: "mm" });

// Define parameters for the transition section
const loft_base_width = Param.number("Loft Base Width", 60, { min: 10, max: 500, unit: "mm" });
const loft_base_depth = Param.number("Loft Base Depth", 40, { min: 10, max: 500, unit: "mm" });
const loft_height = Param.number("Loft Height", 50, { min: 1, max: 500, unit: "mm" });
const loft_top_diameter = Param.number("Loft Top Diameter", 30, { min: 5, max: 500, unit: "mm" });

// Define parameters for the top cylindrical neck
const neck_height = Param.number("Neck Height", 10, { min: 1, max: 200, unit: "mm" });
const neck_diameter = Param.number("Neck Diameter", 30, { min: 5, max: 500, unit: "mm" });

// Construct the rectangular mounting flange at the base
const flange = box(flange_width, flange_depth, flange_thickness);

// Construct the cone component for the transition section
const transition_cone = cone(loft_height, loft_base_width / 2, loft_top_diameter / 2)
  .translate(0, 0, flange_thickness);

// Construct the box component for the transition section
const transition_box = box(loft_base_width, loft_base_depth, loft_height)
  .translate(0, 0, flange_thickness);

// Intersect the cone and box to create the rectangular-to-round transition shape
const transition = transition_cone.intersect(transition_box);

// Construct the cylindrical neck at the top of the transition
const neck = cylinder(neck_height, neck_diameter / 2)
  .translate(0, 0, flange_thickness + loft_height);

// Combine all three sections into a single solid body
const finalShape = flange.union(transition).union(neck);

// Return the final assembled part
return {
  "a-rectangular-to-round-duct-transition-a": finalShape,
};
