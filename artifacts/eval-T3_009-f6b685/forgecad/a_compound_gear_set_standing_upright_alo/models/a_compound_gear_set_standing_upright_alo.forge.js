/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A compound gear set standing upright along the Z-axis, consisting of a central hub with an inner bore and two distinct spur gears (large and small) with star-polygon profiles at different heights.
 * Workflow ID : eval-T3_009-f6b685
 * Trace ID    : 59306829-f290-471d-a1e1-34bfefb7fcfe
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 54.0 × 54.0 × 40.0 mm
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
 *   STEP   : artifact://eval-T3_009-f6b685/step/T3_009_outer0_attempt0.step
 *   STL    : artifact://eval-T3_009-f6b685/stl/T3_009_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create the gears using star polygons (alternating outer/inner radii) extruded along Z. Ensure the central hub and both gears are unioned together before subtracting the central Z-axis bore of 8mm diameter.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Compound Gear Set
 * Standing upright along the Z-axis, centered at the origin in XY.
 * Consists of a central hub with an inner bore and two distinct spur gears (large and small).
 */

// Central Hub Parameters
const hub_diameter = Param.number("Hub Diameter", 16, { min: 10, max: 30, unit: "mm" });
const hub_length = Param.number("Hub Length", 40, { min: 20, max: 100, unit: "mm" });
const bore_diameter = Param.number("Bore Diameter", 8, { min: 4, max: 15, unit: "mm" });

// Large Gear Parameters (Z=3 to Z=13)
const lg_z_start = Param.number("Large Gear Z Start", 3, { min: 0, max: 20, unit: "mm" });
const lg_thick = Param.number("Large Gear Thickness", 10, { min: 5, max: 20, unit: "mm" });
const lg_root_diam = Param.number("Large Gear Root Diam", 44, { min: 20, max: 100, unit: "mm" });
const lg_tip_diam = Param.number("Large Gear Tip Diam", 54, { min: 25, max: 120, unit: "mm" });
const lg_tooth_width = Param.number("Large Gear Tooth Width", 4.5, { min: 1, max: 10, unit: "mm" });

// Small Gear Parameters (Z=20 to Z=30)
const sm_z_start = Param.number("Small Gear Z Start", 20, { min: 10, max: 50, unit: "mm" });
const sm_thick = Param.number("Small Gear Thickness", 10, { min: 5, max: 20, unit: "mm" });
const sm_root_diam = Param.number("Small Gear Root Diam", 26, { min: 10, max: 80, unit: "mm" });
const sm_tip_diam = Param.number("Small Gear Tip Diam", 32, { min: 15, max: 90, unit: "mm" });
const sm_tooth_width = Param.number("Small Gear Tooth Width", 3.5, { min: 1, max: 8, unit: "mm" });

// 1. Create the central hub cylinder
const central_hub = cylinder(hub_length, hub_diameter / 2).color("#7f8c8d");

// 2. Build the large spur gear (8-teeth approximation via 4 intersecting/unioned tooth blocks)
const lg_root = cylinder(lg_thick, lg_root_diam / 2).translate(0, 0, lg_z_start);
const lg_t0 = box(lg_tip_diam, lg_tooth_width, lg_thick).translate(0, 0, lg_z_start);
const lg_t1 = box(lg_tip_diam, lg_tooth_width, lg_thick).rotate([0, 0, 1], 45).translate(0, 0, lg_z_start);
const lg_t2 = box(lg_tip_diam, lg_tooth_width, lg_thick).rotate([0, 0, 1], 90).translate(0, 0, lg_z_start);
const lg_t3 = box(lg_tip_diam, lg_tooth_width, lg_thick).rotate([0, 0, 1], 135).translate(0, 0, lg_z_start);

// Union the large gear components
const large_gear = lg_root
  .union(lg_t0)
  .union(lg_t1)
  .union(lg_t2)
  .union(lg_t3)
  .color("#34495e");

// 3. Build the small spur gear (6-teeth approximation via 3 intersecting/unioned tooth blocks)
const sm_root = cylinder(sm_thick, sm_root_diam / 2).translate(0, 0, sm_z_start);
const sm_t0 = box(sm_tip_diam, sm_tooth_width, sm_thick).translate(0, 0, sm_z_start);
const sm_t1 = box(sm_tip_diam, sm_tooth_width, sm_thick).rotate([0, 0, 1], 60).translate(0, 0, sm_z_start);
const sm_t2 = box(sm_tip_diam, sm_tooth_width, sm_thick).rotate([0, 0, 1], 120).translate(0, 0, sm_z_start);

// Union the small gear components
const small_gear = sm_root
  .union(sm_t0)
  .union(sm_t1)
  .union(sm_t2)
  .color("#2c3e50");

// 4. Combine hub and both gears
const solid_set = central_hub
  .union(large_gear)
  .union(small_gear);

// 5. Create the central Z-axis bore hole (extending slightly past the hub ends for a clean cut)
const bore_hole = cylinder(hub_length + 2, bore_diameter / 2).translate(0, 0, -1);

// 6. Subtract the bore hole to get the final compound gear set
const final_gear_set = solid_set.subtract(bore_hole);

// Return the assembly mapping to the designated part name
return {
  "a-compound-gear-set-standing-upright-alo": final_gear_set,
};
