/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A solid cylinder 20mm in diameter and 20mm tall, with 2mm fillets on both top and bottom circular edges.
 * Workflow ID : eval-T1_034-2237e5
 * Trace ID    : f0b2763b-4c1d-458e-84f1-0485745f2404
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 20.0 × 20.0 × 20.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_034-2237e5/step/T1_034_outer0_attempt0.step
 *   STL    : artifact://eval-T1_034-2237e5/stl/T1_034_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Model a base cylinder of radius 10mm and height 20mm centered at the origin. Apply a 2mm edge fillet to both the top and bottom circular profiles. The resulting bounding box must be exactly 20x20x20mm.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Solid Cylinder with Fillets
 * A solid cylinder 20mm in diameter and 20mm tall, with 2mm fillets on both top and bottom circular edges.
 */

// Define parameters for the cylinder and fillet dimensions
const diameter = Param.number("Diameter", 20, { min: 5, max: 100, unit: "mm" });
const height = Param.number("Height", 20, { min: 5, max: 100, unit: "mm" });
const fillet_radius = Param.number("Fillet Radius", 2, { min: 0.1, max: 5, unit: "mm" });

// Calculate helper dimensions
const radius = diameter / 2;
const inner_radius = radius - fillet_radius;
const core_height = height - (2 * fillet_radius);

// Create the inner core cylinder extending the full height
const inner_cylinder = cylinder(height, inner_radius);

// Create the outer cylinder for the middle section
const outer_cylinder = cylinder(core_height, radius).translate(0, 0, fillet_radius);

// Create the bottom fillet torus
const bottom_torus = torus(inner_radius, fillet_radius).translate(0, 0, fillet_radius);

// Create the top fillet torus
const top_torus = torus(inner_radius, fillet_radius).translate(0, 0, height - fillet_radius);

// Union all the components together to form the filleted cylinder
const finalShape = inner_cylinder
  .union(outer_cylinder)
  .union(bottom_torus)
  .union(top_torus)
  .color("#5f87c6");

// Return the final shape map
return {
  "a-solid-cylinder-20mm-in-diameter-and-20": finalShape,
};
