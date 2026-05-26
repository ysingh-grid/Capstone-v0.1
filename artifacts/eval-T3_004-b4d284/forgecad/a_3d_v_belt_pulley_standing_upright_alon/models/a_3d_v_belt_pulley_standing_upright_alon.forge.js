/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A 3D V-belt pulley standing upright along the Z-axis, featuring a V-groove outer profile, a central 12mm bore, and a 4mm wide keyway.
 * Workflow ID : eval-T3_004-b4d284
 * Trace ID    : 89e9d621-806c-4f46-ae20-edb300e5fa80
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 60.0 × 60.0 × 20.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 12.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_004-b4d284/step/T3_004_outer0_attempt0.step
 *   STL    : artifact://eval-T3_004-b4d284/stl/T3_004_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   To model this part: 1. Create a 2D profile in the XZ plane with the vertices: (6,0) -> (30,0) -> (30,5) -> (20,10) -> (30,15) -> (30,20) -> (6,20). Close the profile back to (6,0). 2. Revolve this profile 360 degrees around the Z-axis. 3. Cut a keyway slot on the +X side of the bore. The slot is a box spanning X from 6.0 to 8.5, Y from -2.0 to 2.0, and Z from 0.0 to 20.0.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file a-3d-v-belt-pulley-standing-upright-alon.forge.js
 * @description A 3D V-belt pulley standing upright along the Z-axis, featuring a V-groove outer profile, a central 12mm bore, and a 4mm wide keyway.
 */

// Define parameters for the pulley design
const outer_diameter = Param.number("Outer Diameter", 60, { min: 20, max: 200, unit: "mm" });
const bore_diameter = Param.number("Bore Diameter", 12, { min: 5, max: 50, unit: "mm" });
const groove_root_diameter = Param.number("Groove Root Diameter", 40, { min: 10, max: 180, unit: "mm" });
const pulley_width = Param.number("Pulley Width", 20, { min: 10, max: 100, unit: "mm" });
const keyway_width = Param.number("Keyway Width", 4, { min: 1, max: 20, unit: "mm" });
const keyway_depth = Param.number("Keyway Depth", 2.5, { min: 0.5, max: 10, unit: "mm" });

// Calculate radii and segment heights
const r_outer = outer_diameter / 2;
const r_root = groove_root_diameter / 2;
const r_bore = bore_diameter / 2;
const seg_h = pulley_width / 4;

// Construct the bottom flange (Z = 0 to Z = 5)
const flange_bottom = cylinder(seg_h, r_outer);

// Construct the bottom V-groove transition cone (Z = 5 to Z = 10)
const cone_bottom = cylinder(seg_h, r_outer, r_root).translate(0, 0, seg_h);

// Construct the top V-groove transition cone (Z = 10 to Z = 15)
const cone_top = cylinder(seg_h, r_root, r_outer).translate(0, 0, seg_h * 2);

// Construct the top flange (Z = 15 to Z = 20)
const flange_top = cylinder(seg_h, r_outer).translate(0, 0, seg_h * 3);

// Union the segments to form the solid pulley outer body
const body = flange_bottom.union(cone_bottom).union(cone_top).union(flange_top);

// Create the central bore cylinder
const bore = cylinder(pulley_width, r_bore);

// Create the keyway slot box on the +X side
const keyway_box = box(keyway_depth, keyway_width, pulley_width)
  .translate(r_bore + keyway_depth / 2, 0, 0);

// Subtract the bore and keyway from the main body
const final_pulley = body.subtract(bore).subtract(keyway_box).color("#808080");

// Return the final model
return {
  "a-3d-v-belt-pulley-standing-upright-alon": final_pulley
};
