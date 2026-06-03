/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Rounded rectangular electronics enclosure body, open on top with mounting holes in the bottom face.
 * Workflow ID : eval-T3_002-c51972
 * Trace ID    : 916fd130-2a94-4609-bd9a-90ca8ff076ac
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 80.0 × 50.0 × 25.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 4 hole(s) of diameter 3.2 mm (×4)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_002-c51972/step/T3_002_outer0_attempt0.step
 *   STL    : artifact://eval-T3_002-c51972/stl/T3_002_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the shell operation preserves the 80x50x25 outer dimensions. The origin (0,0,0) is at the bottom center of the enclosure. The inner vertical fillets must automatically reduce to 6mm to maintain the 2mm wall thickness.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Rounded Rectangular Electronics Enclosure Body
 * Fully parametric enclosure with corner fillets, open top (shelled), and bottom mounting holes.
 */

// Define parameters for the studio sliders
const width = Param.number("Width", 80, { min: 10, max: 500, unit: "mm" });
const depth = Param.number("Depth", 50, { min: 10, max: 500, unit: "mm" });
const height = Param.number("Height", 25, { min: 1, max: 200, unit: "mm" });
const fillet_r = Param.number("Fillet Radius", 8, { min: 1, max: 50, unit: "mm" });
const wall_thickness = Param.number("Wall Thickness", 2, { min: 0.5, max: 10, unit: "mm" });
const hole_dia = Param.number("Hole Diameter", 3.2, { min: 1, max: 10, unit: "mm" });
const hole_pitch_x = Param.number("Hole Pitch X", 64, { min: 10, max: 480, unit: "mm" });
const hole_pitch_y = Param.number("Hole Pitch Y", 34, { min: 10, max: 480, unit: "mm" });

// Calculate geometric constants
const x_off = width / 2 - fillet_r;
const y_off = depth / 2 - fillet_r;
const inner_fillet_r = fillet_r - wall_thickness;
const safe_inner_r = inner_fillet_r < 0.1 ? 0.1 : inner_fillet_r;
const inner_height = height - wall_thickness + 5; // Extra height for clean boolean cut
const hole_r = hole_dia / 2;
const h_x = hole_pitch_x / 2;
const h_y = hole_pitch_y / 2;

// 1. Build Outer Shell
const out_cyl1 = cylinder(height, fillet_r).translate(x_off, y_off, 0);
const out_cyl2 = cylinder(height, fillet_r).translate(-x_off, y_off, 0);
const out_cyl3 = cylinder(height, fillet_r).translate(x_off, -y_off, 0);
const out_cyl4 = cylinder(height, fillet_r).translate(-x_off, -y_off, 0);
const out_box_x = box(width - 2 * fillet_r, depth, height);
const out_box_y = box(width, depth - 2 * fillet_r, height);

const outer_shape = out_box_x
  .union(out_box_y)
  .union(out_cyl1)
  .union(out_cyl2)
  .union(out_cyl3)
  .union(out_cyl4);

// 2. Build Inner Cavity Cutter
const in_cyl1 = cylinder(inner_height, safe_inner_r).translate(x_off, y_off, wall_thickness);
const in_cyl2 = cylinder(inner_height, safe_inner_r).translate(-x_off, y_off, wall_thickness);
const in_cyl3 = cylinder(inner_height, safe_inner_r).translate(x_off, -y_off, wall_thickness);
const in_cyl4 = cylinder(inner_height, safe_inner_r).translate(-x_off, -y_off, wall_thickness);
const in_box_x = box(width - 2 * fillet_r, depth - 2 * wall_thickness, inner_height).translate(0, 0, wall_thickness);
const in_box_y = box(width - 2 * wall_thickness, depth - 2 * fillet_r, inner_height).translate(0, 0, wall_thickness);

const inner_shape = in_box_x
  .union(in_box_y)
  .union(in_cyl1)
  .union(in_cyl2)
  .union(in_cyl3)
  .union(in_cyl4);

// 3. Subtract Inner Cavity to Create Shelled Box
const tray = outer_shape.subtract(inner_shape);

// 4. Create 4 Bottom Mounting Holes (extending through the base floor)
const hole_h = wall_thickness + 4;
const hole_z = -2;
const h1 = cylinder(hole_h, hole_r).translate(h_x, h_y, hole_z);
const h2 = cylinder(hole_h, hole_r).translate(-h_x, h_y, hole_z);
const h3 = cylinder(hole_h, hole_r).translate(h_x, -h_y, hole_z);
const h4 = cylinder(hole_h, hole_r).translate(-h_x, -h_y, hole_z);
const holes = h1.union(h2).union(h3).union(h4);

// 5. Final Subtraction of Holes
const final_enclosure = tray.subtract(holes).color("#2b5c8f");

// Return final CAD model
return {
  "rounded-rectangular-electronics-enclosur": final_enclosure,
};
