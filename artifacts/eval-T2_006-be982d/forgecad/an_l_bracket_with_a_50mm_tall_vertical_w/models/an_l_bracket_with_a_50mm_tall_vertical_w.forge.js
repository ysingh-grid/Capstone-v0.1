/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : An L-bracket with a 50mm tall vertical wall and a 40mm deep horizontal base, both 40mm wide and 3mm thick, with the inside corner aligned at the origin.
 * Workflow ID : eval-T2_006-be982d
 * Trace ID    : f91f41eb-1ad3-4cd9-be1e-03e5dbf77401
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 40.0 × 43.0 × 53.0 mm
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
 *   STEP   : artifact://eval-T2_006-be982d/step/T2_006_outer0_attempt0.step
 *   STL    : artifact://eval-T2_006-be982d/stl/T2_006_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The inside corner of the L-bracket is at the origin (0,0,0). To ensure a solid, manifold join at the corner, the vertical wall should extend from Z = -3 to 50 (Y = -3 to 0), and the horizontal base should extend from Y = 0 to 40 (Z = -3 to 0). Center the bracket on the X-axis from X = -20 to 20.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Design: L-Bracket
 * 
 * An L-bracket with a 50mm tall vertical wall and a 40mm deep horizontal base,
 * both 40mm wide and 3mm thick, with the inside corner aligned at the origin.
 */

// Define parameters for the L-bracket
const width = Param.number("Width", 40, { min: 10, max: 200, unit: "mm" });
const wallHeight = Param.number("Wall Height", 50, { min: 10, max: 200, unit: "mm" });
const baseDepth = Param.number("Base Depth", 40, { min: 10, max: 200, unit: "mm" });
const thickness = Param.number("Thickness", 3, { min: 1, max: 20, unit: "mm" });

// Create the vertical wall
// Standard box is centered on XY, extends in +Z.
// We offset it to align the inner wall face with the Y=0 plane and extend it below Z=0 to mate perfectly with the base.
const wallTotalHeight = wallHeight + thickness;
const verticalWall = box(width, thickness, wallTotalHeight)
  .translate(0, -thickness / 2, -thickness);

// Create the horizontal base
// Standard box is centered on XY, extends in +Z.
// We offset it to align the inner base face with the Z=0 plane and extend it along +Y.
const horizontalBase = box(width, baseDepth, thickness)
  .translate(0, baseDepth / 2, -thickness);

// Join the components to form the final L-bracket
const finalBracket = verticalWall.union(horizontalBase).color("#5f87c6");

// Return the final assembly
return {
  "an-l-bracket-with-a-50mm-tall-vertical-w": finalBracket,
};
