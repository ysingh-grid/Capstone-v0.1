/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A clevis bracket (fork mount) centered at the origin, consisting of a rectangular base with two parallel prongs created by a central slot, and a transverse pin hole through both prongs.
 * Workflow ID : eval-T2_019-0890b7
 * Trace ID    : 105b9cac-88bf-48f9-86aa-cb5e751f3078
 * Iteration   : 3
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 30.0 × 20.0 × 25.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 6.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T2_019-0890b7/step/T2_019_outer3_attempt0.step
 *   STL    : artifact://eval-T2_019-0890b7/stl/T2_019_outer3_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The prompt contains a geometric contradiction: it specifies a slot running in the Y direction (creating prongs separated along the X axis) and a hole 'through both prongs in the Y direction, centered at X=0'. A hole along Y at X=0 would lie entirely inside the empty slot and not go through the prongs. To create a functional clevis bracket, the pin hole must be oriented along the X direction (centered at Y=0, Z=5) so that it passes through both prongs. Implement the hole along the X-axis.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Clevis Bracket (Fork Mount)
 */

const width = Param.number("Width", 30, { min: 10, max: 100, unit: "mm" });
const depth = Param.number("Depth", 20, { min: 10, max: 100, unit: "mm" });
const height = Param.number("Height", 25, { min: 10, max: 100, unit: "mm" });
const slot_width = Param.number("Slot Width", 10, { min: 2, max: 50, unit: "mm" });
const slot_depth = Param.number("Slot Depth", 15, { min: 2, max: 50, unit: "mm" });
const pin_diameter = Param.number("Pin Diameter", 6, { min: 1, max: 20, unit: "mm" });
const pin_z = Param.number("Pin Z Position", 5, { min: -10, max: 50, unit: "mm" });

// Create the main rectangular base block centered at the origin
const base = box(width, depth, height).translate(0, 0, -height / 2);

// Create the slot cutting tool, centered on XY, aligned with the top face
const slot = box(slot_width, depth + 2, slot_depth + 2).translate(0, 0, height / 2 - slot_depth);

// Create the cylinder for the pin hole, centered and rotated to align with the X-axis
const pin_cylinder = cylinder(width + 4, pin_diameter / 2).translate(0, 0, -(width + 4) / 2);
const pin_hole = pin_cylinder.rotate([0, 1, 0], 90).translate(0, 0, pin_z);

// Subtract the slot and the pin hole from the main base block
const clevis_bracket = base.subtract(slot).subtract(pin_hole).color("#5f87c6");

// Return the final assembly
return {
  "a-clevis-bracket-(fork-mount)-centered-a": clevis_bracket
};
