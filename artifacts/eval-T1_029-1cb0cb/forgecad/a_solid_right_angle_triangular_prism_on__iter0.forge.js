/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A solid right-angle triangular prism on the XY plane with its right angle at the origin, featuring a 20mm leg along X and a 30mm leg along Y, extruded 40mm in the +Z direction.
 * Workflow ID : eval-T1_029-1cb0cb
 * Trace ID    : 4ac16cdc-4fc9-4426-aac2-0153aa71930a
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 20.0 × 30.0 × 40.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 1.0%
 *   BBox IoU       : ≥ 0.98
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_029-1cb0cb/step/T1_029_outer0_attempt0.step
 *   STL    : artifact://eval-T1_029-1cb0cb/stl/T1_029_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   To model this, create a 2D sketch on the XY plane defining a right-angle triangle with vertices at (0,0,0), (20,0,0), and (0,30,0). Extrude this sketch 40mm along the positive Z-axis. Ensure the orientation and origin alignment match the prompt exactly.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file Triangular Prism
 * A solid right-angle triangular prism on the XY plane with its right angle at the origin.
 */

// Define parameters for the prism
const legX = Param.number("Leg X", 20, { min: 1, max: 200, unit: "mm" });
const legY = Param.number("Leg Y", 30, { min: 1, max: 200, unit: "mm" });
const heightZ = Param.number("Height Z", 40, { min: 1, max: 200, unit: "mm" });

// Create the base box bounding the prism dimensions
const baseBox = box(legX, legY, heightZ).translate(legX / 2, legY / 2, 0);

// Calculate hypotenuse and the diagonal angle for the cutting plane
const hyp = Math.sqrt(legX * legX + legY * legY);
const angle = Math.atan2(legY, -legX) * 180 / Math.PI;

// Create a large cutting box, position its edge along the hypotenuse, and rotate/translate it
const cutBox = box(hyp * 3, hyp * 3, heightZ * 2)
  .translate(0, hyp * 1.5, -heightZ * 0.5)
  .rotate([0, 0, 1], angle)
  .translate(legX, 0, 0);

// Subtract the cutting box from the base box to form the right-angle triangular prism
const triangularPrism = baseBox.subtract(cutBox).color("#5f87c6");

// Return the final shape
return {
  "a-solid-right-angle-triangular-prism-on-": triangularPrism,
};
