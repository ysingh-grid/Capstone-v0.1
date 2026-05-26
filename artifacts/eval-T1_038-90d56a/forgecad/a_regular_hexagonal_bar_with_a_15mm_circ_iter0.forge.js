/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A regular hexagonal bar with a 15mm circumscribed circle diameter and 120mm length.
 * Workflow ID : eval-T1_038-90d56a
 * Trace ID    : aa5f6ca0-70c2-489e-a0c6-3c6d21488210
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 15.0 × 12.99 × 120.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_038-90d56a/step/T1_038_outer0_attempt0.step
 *   STL    : artifact://eval-T1_038-90d56a/stl/T1_038_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The hexagonal cross-section has a circumscribed circle diameter of 15mm (vertices are 7.5mm from the center). The flat-to-flat distance is approximately 12.99mm. Extrude the profile to a length of 120mm. The CAD model should ideally be centered at the origin.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Hexagonal Bar Model
 * Creates a regular hexagonal bar with parametric circumscribed diameter and length.
 */

// --- PARAMETERS ---
const diameter = Param.number("Circumscribed Diameter", 15, { min: 5, max: 200, unit: "mm" });
const length = Param.number("Length", 120, { min: 10, max: 1000, unit: "mm" });

// --- GEOMETRY CONSTRUCTION ---

// Calculate flat-to-flat width using cos(30 degrees) approx 0.8660254
const flatToFlat = diameter * 0.8660254;

// Use a depth large enough to prevent truncation during rotation intersections
const safeDepth = diameter * 2;

// Create three overlapping boxes rotated at 60 degree increments
const box1 = box(flatToFlat, safeDepth, length);
const box2 = box(flatToFlat, safeDepth, length).rotate([0, 0, 1], 60);
const box3 = box(flatToFlat, safeDepth, length).rotate([0, 0, 1], 120);

// Intersect the three boxes to form a perfect hexagon, then center along Z axis
const hexBar = box1.intersect(box2).intersect(box3)
  .translate([0, 0, -length / 2])
  .color("#8a95a5");

// --- RETURN ---
return {
  "a-regular-hexagonal-bar-with-a-15mm-circ": hexBar
};
