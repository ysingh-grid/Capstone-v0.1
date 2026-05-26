/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A stepped shaft oriented along the Z-axis with an integrated 20-tooth spur gear (star-polygon profile), a central through-bore, and an internal keyway slot in the gear section.
 * Workflow ID : eval-T3_008-3a8302
 * Trace ID    : 2e881d8c-7eb9-446d-a600-ffe965cf99c9
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 44.0 × 44.0 × 55.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 8.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_008-3a8302/step/T3_008_outer0_attempt0.step
 *   STL    : artifact://eval-T3_008-3a8302/stl/T3_008_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The gear teeth have a star-polygon shape alternating between tip radius 22mm and root radius 18mm (40 vertices total). The keyway is cut from the bore surface (radius 4mm) to radius 7mm (+X side), spanning only Z=20 to Z=35. Ensure correct boolean subtraction order: define the main shaft and gear solid, then subtract the central bore and keyway.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file stepped_shaft_gear.forge.js
 * @description A stepped shaft oriented along the Z-axis with an integrated 20-tooth spur gear,
 * a central through-bore, and an internal keyway slot in the gear section.
 */

// --- Parameters ---
const bottom_journal_dia = Param.number("Bottom Journal Diameter", 15, { min: 5, max: 100, unit: "mm" });
const bottom_journal_len = Param.number("Bottom Journal Length", 20, { min: 5, max: 200, unit: "mm" });
const top_journal_dia = Param.number("Top Journal Diameter", 15, { min: 5, max: 100, unit: "mm" });
const top_journal_len = Param.number("Top Journal Length", 20, { min: 5, max: 200, unit: "mm" });
const gear_face_width = Param.number("Gear Face Width", 15, { min: 5, max: 100, unit: "mm" });
const gear_root_rad = Param.number("Gear Root Radius", 18, { min: 5, max: 100, unit: "mm" });
const gear_tip_rad = Param.number("Gear Tip Radius", 22, { min: 5, max: 100, unit: "mm" });
const tooth_thickness = Param.number("Tooth Thickness", 3.14, { min: 1, max: 10, unit: "mm" });
const bore_dia = Param.number("Bore Diameter", 8, { min: 2, max: 50, unit: "mm" });
const keyway_width = Param.number("Keyway Width", 3, { min: 1, max: 20, unit: "mm" });
const keyway_depth = Param.number("Keyway Depth", 3, { min: 1, max: 20, unit: "mm" });

// --- Derived Dimensions ---
const bottom_journal_rad = bottom_journal_dia / 2;
const top_journal_rad = top_journal_dia / 2;
const bore_rad = bore_dia / 2;
const gear_seat_z_start = bottom_journal_len;
const gear_seat_z_end = bottom_journal_len + gear_face_width;
const total_length = bottom_journal_len + gear_face_width + top_journal_len;
const tooth_len = gear_tip_rad * 2;

// --- Components ---

// Bottom Journal
const bottom_journal = cylinder(bottom_journal_len, bottom_journal_rad);

// Top Journal
const top_journal = cylinder(top_journal_len, top_journal_rad).translate(0, 0, gear_seat_z_end);

// Gear Teeth (10 crossed boxes rotated at 18-deg increments to make 20 teeth)
const t0 = box(tooth_len, tooth_thickness, gear_face_width).translate(0, 0, gear_seat_z_start);
const t1 = t0.rotate([0, 0, 1], 18);
const t2 = t0.rotate([0, 0, 1], 36);
const t3 = t0.rotate([0, 0, 1], 54);
const t4 = t0.rotate([0, 0, 1], 72);
const t5 = t0.rotate([0, 0, 1], 90);
const t6 = t0.rotate([0, 0, 1], 108);
const t7 = t0.rotate([0, 0, 1], 126);
const t8 = t0.rotate([0, 0, 1], 144);
const t9 = t0.rotate([0, 0, 1], 162);

// Tree union of teeth to minimize boolean cascade depth
const u0 = t0.union(t1);
const u1 = t2.union(t3);
const u2 = t4.union(t5);
const u3 = t6.union(t7);
const u4 = t8.union(t9);

const u01 = u0.union(u1);
const u23 = u2.union(u3);

const teeth = u01.union(u23).union(u4);

// Gear Core
const gear_core = cylinder(gear_face_width, gear_root_rad).translate(0, 0, gear_seat_z_start);

// Combined Gear Section
const gear_section = gear_core.union(teeth);

// Combine Shaft and Gear Solid
const shaft_solid = bottom_journal.union(gear_section).union(top_journal);

// Central Through-Bore
const bore = cylinder(total_length, bore_rad);

// Internal Keyway Slot (centered on +X side, spanning only the gear section)
const keyway_x_pos = bore_rad + (keyway_depth / 2);
const keyway = box(keyway_depth, keyway_width, gear_face_width).translate(keyway_x_pos, 0, gear_seat_z_start);

// Final Shape Subtractions
const final_shape = shaft_solid.subtract(bore).subtract(keyway).color("#90a4ae");

// Return final part
return {
  "a-stepped-shaft-oriented-along-the-z-axi": final_shape
};
