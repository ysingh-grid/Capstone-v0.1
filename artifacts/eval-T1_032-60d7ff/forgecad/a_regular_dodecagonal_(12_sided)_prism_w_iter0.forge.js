/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A regular dodecagonal (12-sided) prism with a circumscribed circle diameter of 35mm and a height of 20mm.
 * Workflow ID : eval-T1_032-60d7ff
 * Trace ID    : dd94bb2b-6d38-4e61-b64c-41ed9ff1cb19
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 35.0 × 35.0 × 20.0 mm
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
 *   STEP   : artifact://eval-T1_032-60d7ff/step/T1_032_outer0_attempt1.step
 *   STL    : artifact://eval-T1_032-60d7ff/stl/T1_032_outer0_attempt1.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   To model a regular dodecagonal prism, construct a 12-sided regular polygon (dodecagon) on the XY plane. The vertices of the polygon should lie on a circle of radius 17.5mm (diameter 35mm). Extrude this polygon along the Z-axis by 20mm. Center the prism at the origin for best symmetry.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Regular Dodecagonal Prism Generator
 * Creates a 12-sided regular prism with a customizable circumscribed diameter and height.
 */

// --- PARAMETERS ---
const diameter = Param.number("Circumscribed Diameter", 35, { min: 10, max: 200, unit: "mm" });
const height = Param.number("Height", 20, { min: 1, max: 200, unit: "mm" });

// --- CALCULATIONS ---
// The circumscribed radius
const radius = diameter / 2;
// The half-angle of one segment of a 12-sided polygon (360 / (2 * 12))
const halfAngleRad = (15 * Math.PI) / 180;
// Distance from center to the flat faces (inradius)
const inradius = radius * Math.cos(halfAngleRad);
// Width of the bounding box for each slice (flat-to-flat distance)
const boxWidth = inradius * 2;
// Depth of the bounding box (must be larger than the circumscribed diameter to ensure full intersection)
const boxDepth = diameter + 10;

// --- GEOMETRY CONSTRUCTION ---
// We construct the dodecagon by intersecting 6 rotated boxes.
// This is mathematically clean, fully parametric, and avoids complex loops.
const b0 = box(boxWidth, boxDepth, height).color("#4a90e2");
const b1 = box(boxWidth, boxDepth, height).rotate([0, 0, 1], 30).color("#4a90e2");
const b2 = box(boxWidth, boxDepth, height).rotate([0, 0, 1], 60).color("#4a90e2");
const b3 = box(boxWidth, boxDepth, height).rotate([0, 0, 1], 90).color("#4a90e2");
const b4 = box(boxWidth, boxDepth, height).rotate([0, 0, 1], 120).color("#4a90e2");
const b5 = box(boxWidth, boxDepth, height).rotate([0, 0, 1], 150).color("#4a90e2");

// Perform the sequential intersections to yield the final 12-sided prism
const dodecagonalPrism = b0
  .intersect(b1)
  .intersect(b2)
  .intersect(b3)
  .intersect(b4)
  .intersect(b5);

// --- RETURN ---
return {
  "a-regular-dodecagonal-(12-sided)-prism-w": dodecagonalPrism,
};
