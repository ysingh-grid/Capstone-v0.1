/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A spoked handwheel centered at the origin on the XY plane, featuring a raised central hub with a through-bore, an outer rim, and four rectangular spokes.
 * Workflow ID : eval-T3_022-965df3
 * Trace ID    : bb82b9ad-a972-47cf-80b5-2e0446096981
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 100.0 × 100.0 × 12.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 14.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_022-965df3/step/T3_022_outer0_attempt0.step
 *   STL    : artifact://eval-T3_022-965df3/stl/T3_022_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Spokes should be modeled to bridge the gap from R=15mm to R=44mm. It is recommended to slightly overlap the spokes into the hub and rim before performing a union operation to prevent any zero-thickness or gap issues. The 14mm center bore must go entirely through the 12mm height of the hub.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Spoked Handwheel Model
 * Centered at origin, lying flat on XY plane.
 */

// --- PARAMETERS ---
const hub_diameter = Param.number("Hub Diameter", 30, { min: 10, max: 100, unit: "mm" });
const hub_height = Param.number("Hub Height", 12, { min: 2, max: 50, unit: "mm" });
const bore_diameter = Param.number("Bore Diameter", 14, { min: 5, max: 50, unit: "mm" });
const rim_outer_diameter = Param.number("Rim Outer Diameter", 100, { min: 50, max: 300, unit: "mm" });
const rim_inner_diameter = Param.number("Rim Inner Diameter", 88, { min: 40, max: 280, unit: "mm" });
const rim_height = Param.number("Rim Height", 8, { min: 2, max: 50, unit: "mm" });
const spoke_width = Param.number("Spoke Width", 8, { min: 2, max: 30, unit: "mm" });
const spoke_height = Param.number("Spoke Height", 8, { min: 2, max: 50, unit: "mm" });

// --- GEOMETRY GENERATION ---

// 1. Create the central hub solid
const hub_outer = cylinder(hub_height, hub_diameter / 2);

// 2. Create the outer rim by subtracting the inner cylinder from the outer cylinder
const rim_outer_cyl = cylinder(rim_height, rim_outer_diameter / 2);
const rim_inner_cyl = cylinder(rim_height + 2, rim_inner_diameter / 2).translate(0, 0, -1);
const rim = rim_outer_cyl.subtract(rim_inner_cyl);

// 3. Create the spokes.
// We use a safe overlap by extending the spokes to the midpoint of the rim's radial thickness.
const spoke_overlap_diameter = (rim_outer_diameter + rim_inner_diameter) / 2;
const spoke_x = box(spoke_overlap_diameter, spoke_width, spoke_height);
const spoke_y = box(spoke_width, spoke_overlap_diameter, spoke_height);
const spokes = spoke_x.union(spoke_y);

// 4. Combine the hub, rim, and spokes into a single solid wheel structure
const wheel_solid = hub_outer.union(rim).union(spokes);

// 5. Create the center bore and subtract it from the solid wheel
const bore = cylinder(hub_height + 2, bore_diameter / 2).translate(0, 0, -1);
const final_wheel = wheel_solid.subtract(bore).color("#5f87c6");

// --- RETURN THE PART ---
return {
  "a-spoked-handwheel-centered-at-the-origi": final_wheel
};
