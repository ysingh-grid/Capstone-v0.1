/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A hollow rectangular tube centered at the origin, with a YZ cross-section extruded along the X-axis.
 * Workflow ID : eval-T2_014-d0a965
 * Trace ID    : 9c32c2e8-a004-410d-a968-a6284a389758
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 80.0 × 30.0 × 40.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 1.0%
 *   BBox IoU       : ≥ 0.99
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T2_014-d0a965/step/T2_014_outer0_attempt0.step
 *   STL    : artifact://eval-T2_014-d0a965/stl/T2_014_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The tube must be centered at the origin, meaning X bounds are [-40, 40], Y bounds are [-15, 15], and Z bounds are [-20, 20]. This can be constructed by defining a 2D hollow profile in the YZ plane and extruding along X, or by subtracting an inner box from an outer box.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Hollow Rectangular Tube
 * Centered at the origin, open along X axis.
 */

// User adjustable parameters
const length_x = Param.number("Tube Length (X)", 80, { min: 10, max: 500, unit: "mm" });
const outer_width_y = Param.number("Outer Width (Y)", 30, { min: 5, max: 200, unit: "mm" });
const outer_height_z = Param.number("Outer Height (Z)", 40, { min: 5, max: 200, unit: "mm" });
const wall_thickness = Param.number("Wall Thickness", 2, { min: 0.5, max: 20, unit: "mm" });

// Calculate inner dimensions based on wall thickness
const inner_width_y = outer_width_y - (wall_thickness * 2);
const inner_height_z = outer_height_z - (wall_thickness * 2);
// Ensure the cutting tool is slightly longer to avoid face-coincidence rendering issues
const inner_length_x = length_x + 10;

// Create the outer rectangular solid and center it on the Z-axis (X and Y are already centered by default)
const outerBox = box(length_x, outer_width_y, outer_height_z)
  .translate(0, 0, -outer_height_z / 2);

// Create the inner cutting box and center it along the Z-axis
const innerBox = box(inner_length_x, inner_width_y, inner_height_z)
  .translate(0, 0, -inner_height_z / 2);

// Subtract the inner solid from the outer solid to produce the hollow tube
const finalTube = outerBox.subtract(innerBox).color("#4A90E2");

// Return the completed part mapped to the requested key
return {
  "a-hollow-rectangular-tube-centered-at-th": finalTube
};
