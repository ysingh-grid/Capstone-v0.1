/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Triangular prism with an equilateral triangle cross-section, circumscribed circle diameter of 30mm, extruded to 50mm with the cross-section centroid at the origin.
 * Workflow ID : eval-T1_012-48530b
 * Trace ID    : 9efbacd3-91ec-4da9-92e3-a2df22cf92b5
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 25.98 × 22.5 × 50.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 2.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_012-48530b/step/T1_012_outer0_attempt0.step
 *   STL    : artifact://eval-T1_012-48530b/stl/T1_012_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   To center the centroid of the equilateral triangle at the origin (0,0): if one vertex is aligned with the positive Y-axis, the three vertices of the triangle are at (0, 15), (-12.99, -7.5), and (12.99, -7.5). Extrude this profile along the Z-axis by 50mm (either from z=0 to 50 or symmetrically from z=-25 to 25).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Equilateral Triangular Prism
 * Centroid at (0,0), circumscribed diameter 30mm, height 50mm.
 */

// Parameters
const diameter = Param.number("Circumscribed Diameter", 30, { min: 10, max: 200, unit: "mm" });
const height = Param.number("Height", 50, { min: 10, max: 500, unit: "mm" });

// Derived dimensions
const radius = diameter / 2;
const inradius = radius * 0.5; // Distance from centroid to the flat side (r = R * cos(60))
const size = diameter * 4;     // Oversized dimension for cutters to guarantee clean booleans

// Base block to cut the triangle out of
const base = box(size, size, height);

// First cutter to define the flat bottom face of the triangle (y < -inradius)
const cutter1 = box(size, size, height + 2).translate(0, -(size / 2 + inradius), -1);

// Rotate the cutters by 120 and 240 degrees to define the other two sides of the equilateral triangle
const cutter2 = cutter1.rotate([0, 0, 1], 120);
const cutter3 = cutter1.rotate([0, 0, 1], 240);

// Perform successive subtractions to yield the final triangular prism centered at the origin
const prism = base
  .subtract(cutter1)
  .subtract(cutter2)
  .subtract(cutter3)
  .color("#5f87c6");

// Return the final CAD component
return {
  "triangular-prism-with-an-equilateral-tri": prism
};
