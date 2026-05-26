/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Semicircular half-pipe trough centered at the origin, opening upward, with an outer radius of 25mm, inner radius of 22mm, and length of 70mm along the Y-axis.
 * Workflow ID : eval-T1_045-242c9e
 * Trace ID    : 1632b64e-1485-4a82-b07f-5b6ac912cb46
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 50.0 × 70.0 × 25.0 mm
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
 *   STEP   : artifact://eval-T1_045-242c9e/step/T1_045_outer0_attempt0.step
 *   STL    : artifact://eval-T1_045-242c9e/stl/T1_045_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The cross-section is a half-ring in the XZ plane. Since it opens upward and is centered at the origin, the center of the arc profile should be at (0,0,0), meaning the trough spans X from -25 to +25, Y from -35 to +35, and Z from -25 to 0.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Semicircular half-pipe trough centered at the origin, opening upward.
 */

// Parameters
const outerRadius = Param.number("Outer Radius", 25, { min: 5, max: 100, unit: "mm" });
const innerRadius = Param.number("Inner Radius", 22, { min: 4, max: 99, unit: "mm" });
const length = Param.number("Length", 70, { min: 10, max: 300, unit: "mm" });

// Create the outer cylinder along the Z-axis
const outerCyl = cylinder(length, outerRadius);

// Create the inner cylinder, slightly longer to ensure a clean cut
const innerCyl = cylinder(length + 2, innerRadius).translate(0, 0, -1);

// Subtract the inner cylinder from the outer cylinder to form a hollow tube
const tube = outerCyl.subtract(innerCyl);

// Translate the tube to center it along the Z-axis (from -length/2 to +length/2)
const centeredTube = tube.translate(0, 0, -length / 2);

// Rotate the tube 90 degrees around the X-axis so its longitudinal axis lies along Y
const alignedTube = centeredTube.rotate([1, 0, 0], 90);

// Define cutter dimensions to extract the bottom half (Z < 0)
const cutterWidth = outerRadius * 2 + 10;
const cutterLength = length + 10;
const cutterHeight = outerRadius + 5;

// Create and position the cutter box to span Z from -cutterHeight to 0
const cutter = box(cutterWidth, cutterLength, cutterHeight).translate(0, 0, -cutterHeight);

// Intersect the tube with the cutter to yield the final upward-opening half-pipe
const finalTrough = alignedTube.intersect(cutter).color("#5f87c6");

// Return the final geometry mapping to the specified part name
return {
  "semicircular-half-pipe-trough-centered-a": finalTrough,
};
