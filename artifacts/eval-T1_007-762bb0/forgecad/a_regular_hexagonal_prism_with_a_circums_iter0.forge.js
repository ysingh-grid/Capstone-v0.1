/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A regular hexagonal prism with a circumscribed circle diameter of 20mm and a height of 35mm.
 * Workflow ID : eval-T1_007-762bb0
 * Trace ID    : ca32dd6d-f91b-4f3b-9e4a-9ac11f0248d5
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 20.0 × 17.32 × 35.0 mm
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
 *   STEP   : artifact://eval-T1_007-762bb0/step/T1_007_outer0_attempt0.step
 *   STL    : artifact://eval-T1_007-762bb0/stl/T1_007_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The hexagon should be centered on the origin. A regular hexagon has a vertex-to-center distance equal to its side length (10mm, since the circumscribed diameter is 20mm). The flat-to-flat distance (inscribed diameter) is exactly 10 * sqrt(3) ≈ 17.32mm. Extrude the sketch symmetrically or from the base plane to a height of 35mm.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: Hexagonal Prism
 * A regular hexagonal prism with a circumscribed circle diameter of 20mm and a height of 35mm.
 */

// Define parameters for the hexagonal prism
const circumscribed_dia = Param.number("Circumscribed Diameter", 20, { min: 5, max: 200, unit: "mm" });
const height = Param.number("Height", 35, { min: 1, max: 500, unit: "mm" });

// Calculate flat-to-flat width (inscribed diameter) using cos(30 degrees)
const flat_to_flat = circumscribed_dia * 0.8660254;
const box_length = circumscribed_dia * 2.0;

// Create three rotated boxes to define the hexagonal symmetry
const box1 = box(flat_to_flat, box_length, height);
const box2 = box(flat_to_flat, box_length, height).rotate([0, 0, 1], 60);
const box3 = box(flat_to_flat, box_length, height).rotate([0, 0, 1], 120);

// Intersect the three boxes to generate the perfect hexagonal prism
const hexagonalPrism = box1.intersect(box2).intersect(box3).color("#5f87c6");

// Return the final assembly/part
return {
  "a-regular-hexagonal-prism-with-a-circums": hexagonalPrism,
};
