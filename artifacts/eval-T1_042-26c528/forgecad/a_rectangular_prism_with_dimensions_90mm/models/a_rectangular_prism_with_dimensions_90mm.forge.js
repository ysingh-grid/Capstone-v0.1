/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A rectangular prism with dimensions 90mm x 20mm x 8mm, featuring 2mm fillets on the four long edges.
 * Workflow ID : eval-T1_042-26c528
 * Trace ID    : 96876921-99cf-4e68-90b6-a1361f85d39b
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 90.0 × 20.0 × 8.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 2.0%
 *   BBox IoU       : ≥ 0.98
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_042-26c528/step/T1_042_outer0_attempt0.step
 *   STL    : artifact://eval-T1_042-26c528/stl/T1_042_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The 'long edges' refer to the four edges parallel to the longest dimension (90mm). If alignment is along the X-axis, these are the edges parallel to X.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Rectangular prism with 2mm fillets on the four long edges.
 */

// Define parameters as sliders
const length = Param.number("Length", 90, { min: 10, max: 200, unit: "mm" });
const width = Param.number("Width", 20, { min: 5, max: 100, unit: "mm" });
const height = Param.number("Height", 8, { min: 2, max: 50, unit: "mm" });
const r = Param.number("Fillet Radius", 2, { min: 0.1, max: 10, unit: "mm" });

// Base Box 1: Central vertical core
const box1 = box(length, width - 2 * r, height);

// Base Box 2: Central horizontal core (offset in Z by r)
const box2 = box(length, width, height - 2 * r).translate([0, 0, r]);

// Create a cylinder template rotated to lie along X, and centered along X
const cylTemplate = cylinder(length, r)
  .rotate([0, 1, 0], 90)
  .translate([-length / 2, 0, 0]);

// Calculate corner offsets
const yOffset = width / 2 - r;
const zOffsetLow = r;
const zOffsetHigh = height - r;

// Position the 4 corner cylinders along the long edges
const cyl1 = cylTemplate.translate([0, -yOffset, zOffsetLow]);
const cyl2 = cylTemplate.translate([0, yOffset, zOffsetLow]);
const cyl3 = cylTemplate.translate([0, -yOffset, zOffsetHigh]);
const cyl4 = cylTemplate.translate([0, yOffset, zOffsetHigh]);

// Union all components together to form the filleted prism
const finalShape = box1
  .union(box2)
  .union(cyl1)
  .union(cyl2)
  .union(cyl3)
  .union(cyl4)
  .color("#5f87c6");

// Return the final model
return {
  "a-rectangular-prism-with-dimensions-90mm": finalShape,
};
