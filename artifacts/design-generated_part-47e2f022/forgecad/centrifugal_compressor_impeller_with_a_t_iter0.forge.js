/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Centrifugal compressor impeller with a truncated cone hub, central bore hole, and 7 aerodynamically swept and twisted blades.
 * Workflow ID : design-generated_part-47e2f022
 * Trace ID    : 581a1fa9-14ce-4650-a767-ff3bb88573d0
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 130.0 × 130.0 × 60.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 15.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 10.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://design-generated_part-47e2f022/step/generated_part_outer0_attempt2.step
 *   STL    : artifact://design-generated_part-47e2f022/stl/generated_part_outer0_attempt2.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create the central hub using a revolve operation or loft. For the 7 curved blades, construct a single blade using either 3D splines for a sweep path or a loft between multiple helical-mapped wire profiles along the conical surface. The blades must taper in protrusion height from 15mm at Z=0 to 5mm at Z=60 while twisting 60 degrees. Perform a polar array (rotation of 360/7 degrees) of the single blade, union them together with the hub, and ensure the final solid is named 'result_solid'.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

const hub_base_dia = Param.number("Hub Base Diameter", 100, { min: 50, max: 200, unit: "mm" });
const hub_top_dia = Param.number("Hub Top Diameter", 30, { min: 10, max: 100, unit: "mm" });
const hub_height = Param.number("Hub Height", 60, { min: 20, max: 200, unit: "mm" });
const bore_dia = Param.number("Bore Diameter", 15, { min: 5, max: 50, unit: "mm" });
const num_blades = Param.number("Number of Blades", 7, { min: 3, max: 15, step: 1 });
const blade_thick = Param.number("Blade Thickness", 2, { min: 1, max: 10, unit: "mm" });
const prot_base = Param.number("Blade Protrusion Base", 15, { min: 5, max: 50, unit: "mm" });
const prot_top = Param.number("Blade Protrusion Top", 5, { min: 1, max: 30, unit: "mm" });
const twist_deg = Param.number("Blade Twist", 60, { min: 0, max: 180, unit: "deg" });

// Calculate radii from the parameters
const r_base = hub_base_dia / 2;
const r_top = hub_top_dia / 2;

// We use 40 steps to smoothly approximate the continuous twist and cone profile
const steps = 40;
const dz = hub_height / steps;

// Build the truncated cone hub as a stack of thin cylinders
let hub = null;
for (let i = 0; i < steps; i++) {
  const z = i * dz;
  const ratio = z / hub_height;
  const r = r_base - (r_base - r_top) * ratio;
  const slice = cylinder(dz * 1.02, r).translate(0, 0, z);
  if (hub === null) {
    hub = slice;
  } else {
    hub = hub.union(slice);
  }
}

// Build a single twisted and tapered blade as a stack of twisted box slices
let single_blade = null;
for (let i = 0; i < steps; i++) {
  const z = i * dz;
  const ratio = z / hub_height;
  const r_hub = r_base - (r_base - r_top) * ratio;
  const protrusion = prot_base - (prot_base - prot_top) * ratio;
  const length = protrusion;
  const x_center = r_hub + length / 2;
  const angle = twist_deg * ratio;
  
  // Define slice dimensions and position relative to the hub surface
  let slice = box(length, blade_thick, dz * 1.02);
  slice = slice.translate(x_center, 0, z);
  slice = slice.rotate([0, 0, 1], angle);
  
  if (single_blade === null) {
    single_blade = slice;
  } else {
    single_blade = single_blade.union(slice);
  }
}

// Replicate the blade around the Z axis to create the full blade set
let all_blades = null;
const blade_count = Math.round(num_blades);
for (let i = 0; i < blade_count; i++) {
  const rotation_angle = i * (360 / blade_count);
  const rotated_blade = single_blade.rotate([0, 0, 1], rotation_angle);
  if (all_blades === null) {
    all_blades = rotated_blade;
  } else {
    all_blades = all_blades.union(rotated_blade);
  }
}

// Combine the hub and all blades into one integrated component
const impeller = hub.union(all_blades);

// Subtract the central shaft bore hole
const bore = cylinder(hub_height * 1.2, bore_dia / 2).translate(0, 0, -hub_height * 0.1);
const result_solid = impeller.subtract(bore);

// Apply a metallic grey aesthetic color
const final_shape = result_solid.color("#a0b0c0");

// Return the final assembly under the specified key name
return {
  "centrifugal-compressor-impeller-with-a-t": final_shape,
};
