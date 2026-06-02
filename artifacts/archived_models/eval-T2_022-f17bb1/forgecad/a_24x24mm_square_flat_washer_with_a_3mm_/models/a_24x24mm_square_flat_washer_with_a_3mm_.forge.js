/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A 24x24mm square flat washer with a 3mm thickness and a 10.5mm central through-hole, centered at the origin on the XY plane.
 * Workflow ID : eval-T2_022-f17bb1
 * Trace ID    : 983e59d4-f0ec-418a-b86e-a88eb1e3c163
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 24.0 × 24.0 × 3.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 10.5 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T2_022-f17bb1/step/T2_022_outer0_attempt0.step
 *   STL    : artifact://eval-T2_022-f17bb1/stl/T2_022_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The model must be centered at (0,0,0) in the XY plane, with the bottom face at Z=0 and the top face at Z=3. Construct by subtracting a 10.5mm diameter cylinder from a 24x24x3mm box.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Square Flat Washer
 * A 24x24mm square washer, 3mm thick, with a 10.5mm central hole.
 * Centered on the XY plane with thickness in the +Z direction.
 */

// Define parameters for the washer dimensions
const size = Param.number("Width and Length", 24, { min: 5, max: 100, unit: "mm" });
const thickness = Param.number("Thickness", 3, { min: 0.5, max: 20, unit: "mm" });
const holeDiameter = Param.number("Hole Diameter", 10.5, { min: 1, max: 50, unit: "mm" });

// Calculate hole radius from diameter
const holeRadius = holeDiameter / 2;

// Create the main square plate body (centered on XY, extruded in +Z)
const plate = box(size, size, thickness);

// Create the central cylindrical hole (axis along Z, extruded in +Z)
const hole = cylinder(thickness, holeRadius);

// Subtract the hole from the plate to form the washer
const washer = plate.subtract(hole).color("#a0a0a0");

// Return the final assembly
return {
  "a-24x24mm-square-flat-washer-with-a-3mm-": washer,
};
