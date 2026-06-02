/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A structural I-beam centered at the origin, extending along the X-axis with a YZ cross-section.
 * Workflow ID : eval-T2_005-de777d
 * Trace ID    : 4d79fbfd-e0c0-41f7-a0b3-9c9ba03616cc
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 100.0 × 20.0 × 40.0 mm
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
 *   STEP   : artifact://eval-T2_005-de777d/step/T2_005_outer0_attempt0.step
 *   STL    : artifact://eval-T2_005-de777d/stl/T2_005_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The I-beam is centered at the origin, meaning X spans from -50 to +50, Y spans from -10 to +10, and Z spans from -20 to +20. It can be modeled either by extruding a 2D I-shape sketch along the X-axis by 100mm, or by unioning three box primitives (top flange: 100x20x3 centered at Z=18.5, bottom flange: 100x20x3 centered at Z=-18.5, web: 100x2x34 centered at Z=0).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file structural_ibeam.js
 * @description A structural I-beam centered at the origin, extending along the X-axis with a YZ cross-section.
 */

// Define parameters for the I-beam dimensions
const length = Param.number("Length", 100.0, { min: 10, max: 500, unit: "mm" });
const height = Param.number("Height", 40.0, { min: 10, max: 200, unit: "mm" });
const flangeWidth = Param.number("Flange Width", 20.0, { min: 5, max: 100, unit: "mm" });
const flangeThickness = Param.number("Flange Thickness", 3.0, { min: 1, max: 20, unit: "mm" });
const webThickness = Param.number("Web Thickness", 2.0, { min: 1, max: 20, unit: "mm" });

// Calculate helper dimensions for positioning
const halfHeight = height / 2;
const webHeight = height - (2 * flangeThickness);
const webZOffset = -halfHeight + flangeThickness;

// Create bottom flange: centered on XY, positioned at the bottom of the beam
const bottomFlange = box(length, flangeWidth, flangeThickness)
  .translate(0, 0, -halfHeight)
  .color("#5f87c6");

// Create top flange: centered on XY, positioned at the top of the beam
const topFlange = box(length, flangeWidth, flangeThickness)
  .translate(0, 0, halfHeight - flangeThickness)
  .color("#5f87c6");

// Create vertical web: centered on XY, spanning between the two flanges
const verticalWeb = box(length, webThickness, webHeight)
  .translate(0, 0, webZOffset)
  .color("#4a6fa5");

// Union the components together to form a solid I-beam
const beam = bottomFlange
  .union(topFlange)
  .union(verticalWeb);

// Return the final assembly mapped to the specified part name
return {
  "a-structural-i-beam-centered-at-the-orig": beam,
};
