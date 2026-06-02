/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : An I-beam extrusion with a length of 300mm along the Z-axis, featuring a total height of 100mm and total width of 50mm.
 * Workflow ID : design-generated_part-a6623b1f
 * Trace ID    : faa980d3-5f66-4086-8b6c-8fa95bcbd6cc
 * Iteration   : 2
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 50.0 × 100.0 × 300.0 mm
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
 *   STEP   : artifact://design-generated_part-a6623b1f/step/generated_part_outer2_attempt0.step
 *   STL    : artifact://design-generated_part-a6623b1f/stl/generated_part_outer2_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   There is a geometric contradiction in the prompt measurements: 'total_height_mm: 100', 'flange_thickness_mm: 6', and 'web_height_mm: 25'. In a standard I-beam, the total height is equal to (2 * flange_thickness) + web_height. If total height is 100mm and flange thickness is 6mm, the actual web height must be 88mm. The Coder should prioritize the total height of 100mm and flange thickness of 6mm, resulting in a web height of 88mm. The volume calculation of 285,600 mm³ is based on this standard model: (2 * 50 * 6 + 88 * 4) * 300.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

// Define parameters for the I-beam dimensions
const totalWidth = Param.number("Total Width", 50, { min: 10, max: 200, unit: "mm" });
const totalHeight = Param.number("Total Height", 100, { min: 20, max: 500, unit: "mm" });
const flangeThickness = Param.number("Flange Thickness", 6, { min: 1, max: 50, unit: "mm" });
const webThickness = Param.number("Web Thickness", 4, { min: 1, max: 50, unit: "mm" });
const length = Param.number("Length", 300, { min: 10, max: 1000, unit: "mm" });

// Calculate web height to maintain total height constraint
const webHeight = totalHeight - (flangeThickness * 2);

// Construct the top flange centered on X, translated to the top of the beam
const topFlange = box(totalWidth, flangeThickness, length)
  .translate(0, (totalHeight / 2) - (flangeThickness / 2), 0);

// Construct the bottom flange centered on X, translated to the bottom of the beam
const bottomFlange = box(totalWidth, flangeThickness, length)
  .translate(0, -((totalHeight / 2) - (flangeThickness / 2)), 0);

// Construct the central web connecting the top and bottom flanges
const web = box(webThickness, webHeight, length);

// Merge all components into a single I-beam extrusion and apply color
const iBeam = topFlange.union(bottomFlange).union(web).color("#5f87c6");

// Return the completed geometry structure
return {
  "an-i-beam-extrusion-with-a-length-of-300": iBeam,
};
