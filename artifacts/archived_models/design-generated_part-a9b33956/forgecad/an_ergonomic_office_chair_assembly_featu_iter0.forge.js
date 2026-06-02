/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : An ergonomic office chair assembly featuring a 5-spoke star base, central support column, contoured seat pan, and a tilted backrest connected via a steel bracket.
 * Workflow ID : design-generated_part-a9b33956
 * Trace ID    : 01d02c45-7633-4376-a169-6a88e158793a
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 600.0 × 665.0 × 1100.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 10.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://design-generated_part-a9b33956/step/generated_part_outer0_attempt1.step
 *   STL    : artifact://design-generated_part-a9b33956/stl/generated_part_outer0_attempt1.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the 5 spokes of the base are radially distributed at 72-degree intervals. The seat contour should be a smooth, subtle subtraction from the top surface. The backrest bracket should mount flush to the rear bottom of the seat pan and tilt the backrest backward by 15 degrees from the vertical Z-axis.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

// Parameters for the Office Chair Assembly
const base_cyl_diam = Param.number("Base Cylinder Diameter", 50, { min: 20, max: 200, unit: "mm" });
const base_cyl_height = Param.number("Base Cylinder Height", 50, { min: 20, max: 100, unit: "mm" });
const spoke_diam = Param.number("Spoke Diameter", 40, { min: 10, max: 100, unit: "mm" });
const spoke_length = Param.number("Spoke Length", 275, { min: 100, max: 500, unit: "mm" });

const column_height = Param.number("Support Column Height", 400, { min: 100, max: 800, unit: "mm" });
const column_diam = Param.number("Support Column Diameter", 50, { min: 20, max: 100, unit: "mm" });

const seat_width = Param.number("Seat Width", 450, { min: 200, max: 800, unit: "mm" });
const seat_length = Param.number("Seat Length", 450, { min: 200, max: 800, unit: "mm" });
const seat_thickness = Param.number("Seat Thickness", 30, { min: 10, max: 100, unit: "mm" });
const seat_corner_r = Param.number("Seat Corner Radius", 50, { min: 0, max: 150, unit: "mm" });
const seat_dip = Param.number("Seat Dip", 5, { min: 0, max: 20, unit: "mm" });

const bracket_width = Param.number("Bracket Width", 50, { min: 10, max: 200, unit: "mm" });
const bracket_thickness = Param.number("Bracket Thickness", 10, { min: 5, max: 50, unit: "mm" });
const bracket_height = Param.number("Bracket Height", 150, { min: 50, max: 300, unit: "mm" });

const backrest_width = Param.number("Backrest Width", 400, { min: 200, max: 800, unit: "mm" });
const backrest_height = Param.number("Backrest Height", 500, { min: 200, max: 1000, unit: "mm" });
const backrest_thickness = Param.number("Backrest Thickness", 20, { min: 10, max: 100, unit: "mm" });
const backrest_angle = Param.number("Backrest Angle", 15, { min: 0, max: 45, unit: "deg" });

// 1. Base Hub (Central Cylinder)
const hub = cylinder(base_cyl_height, base_cyl_diam / 2);

// 2. 5-Spoke Star Pattern
const spoke_r = spoke_diam / 2;
const single_spoke = cylinder(spoke_length, spoke_r)
  .rotate([0, 1, 0], 90) // Lay cylinder flat along X-axis
  .translate(base_cyl_diam / 2, 0, base_cyl_height / 2); // Position radiating outward from hub

let spokes = single_spoke;
for (let i = 1; i < 5; i++) {
  const angle = i * 72; // 5-spokes distributed evenly at 72 degrees
  spokes = spokes.union(single_spoke.rotate([0, 0, 1], angle));
}
const base = hub.union(spokes).color("#222222");

// 3. Central Support Column
const column = cylinder(column_height, column_diam / 2)
  .translate(0, 0, base_cyl_height)
  .color("#cccccc");

// 4. Seat Pan (Rounded Plate with Ergonomic Dip)
const bx = box(seat_width - 2 * seat_corner_r, seat_length, seat_thickness);
const by = box(seat_width, seat_length - 2 * seat_corner_r, seat_thickness);
let seat_plate = bx.union(by);

// Add rounded corners to the seat plate
const cx = seat_width / 2 - seat_corner_r;
const cy = seat_length / 2 - seat_corner_r;
const c1 = cylinder(seat_thickness, seat_corner_r).translate(cx, cy, 0);
const c2 = cylinder(seat_thickness, seat_corner_r).translate(-cx, cy, 0);
const c3 = cylinder(seat_thickness, seat_corner_r).translate(cx, -cy, 0);
const c4 = cylinder(seat_thickness, seat_corner_r).translate(-cx, -cy, 0);
seat_plate = seat_plate.union(c1).union(c2).union(c3).union(c4);

// Create ergonomic scoop contour using a large horizontal cylinder cutter
const dip_cyl_len = seat_width + 100;
const dip_cyl_r = 2000;
const dip_cutter = cylinder(dip_cyl_len, dip_cyl_r)
  .rotate([0, 1, 0], 90)
  .translate(-dip_cyl_len / 2, 0, seat_thickness + dip_cyl_r - seat_dip);
const seat_contoured = seat_plate.subtract(dip_cutter);

// Position seat pan on top of support column
const seat_z = base_cyl_height + column_height;
const seat = seat_contoured.translate(0, 0, seat_z).color("#3a2d28");

// 5. Vertical Steel Bracket
const bracket_z_start = seat_z - 50; // Overlaps with seat pan structure for secure mounting
const bracket = box(bracket_width, bracket_thickness, bracket_height)
  .translate(0, -seat_length / 2 + bracket_thickness / 2, bracket_z_start)
  .color("#555555");

// 6. Tilted Backrest
const back_plate = box(backrest_width, backrest_thickness, backrest_height);
const tilted_back = back_plate.rotate([1, 0, 0], -backrest_angle); // Tilt backward relative to vertical Z-axis

// Position backrest at top of mounting bracket
const bracket_top_z = bracket_z_start + bracket_height;
const backrest = tilted_back
  .translate(0, -seat_length / 2 + bracket_thickness / 2, bracket_top_z)
  .color("#3a2d28");

// Assembly Union
const finalShape = base
  .union(column)
  .union(seat)
  .union(bracket)
  .union(backrest);

return {
  "an-ergonomic-office-chair-assembly-featu": finalShape,
};
