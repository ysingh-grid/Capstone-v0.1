/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A simple rectangular desk consisting of a flat tabletop and four square legs at the corners.
 * Workflow ID : design-test-desk-ee4c0616
 * Trace ID    : 2aaf9471-a4f4-4d70-8ba1-79d5a8f4de31
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 1200.0 × 600.0 × 750.0 mm
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
 *   STEP   : artifact://design-test-desk-ee4c0616/step/test-desk_outer0_attempt0.step
 *   STL    : artifact://design-test-desk-ee4c0616/stl/test-desk_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Position the origin at the bottom center (floor level, middle of the desk's footprint). Inset the four legs by 20mm from the tabletop edges. Ensure the legs sit perfectly flat on the ground (Z=0) and extend up to meet the bottom of the tabletop (Z=725).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

// Define parameters for the desk
const tabletopWidth = Param.number("Tabletop Width", 1200, { min: 400, max: 2000, unit: "mm" });
const tabletopDepth = Param.number("Tabletop Depth", 600, { min: 300, max: 1200, unit: "mm" });
const tabletopThickness = Param.number("Tabletop Thickness", 25, { min: 10, max: 100, unit: "mm" });
const legHeight = Param.number("Leg Height", 725, { min: 200, max: 1200, unit: "mm" });
const legWidth = Param.number("Leg Width", 40, { min: 10, max: 150, unit: "mm" });
const legInset = Param.number("Leg Inset", 20, { min: 0, max: 100, unit: "mm" });

// Create the tabletop centered on XY and positioned at the top of the legs
const tabletop = box(tabletopWidth, tabletopDepth, tabletopThickness)
  .translate(0, 0, legHeight)
  .color("#a05a2c"); // Warm wood color

// Calculate leg offsets from the center of the tabletop to ensure the correct inset
const legX = (tabletopWidth / 2) - legInset - (legWidth / 2);
const legY = (tabletopDepth / 2) - legInset - (legWidth / 2);

// Create the four legs extending from Z=0 up to Z=legHeight
const legFL = box(legWidth, legWidth, legHeight).translate(-legX, -legY, 0).color("#2C3E50");
const legFR = box(legWidth, legWidth, legHeight).translate(legX, -legY, 0).color("#2C3E50");
const legBL = box(legWidth, legWidth, legHeight).translate(-legX, legY, 0).color("#2C3E50");
const legBR = box(legWidth, legWidth, legHeight).translate(legX, legY, 0).color("#2C3E50");

// Union all the parts together to form the final desk assembly
const desk = tabletop
  .union(legFL)
  .union(legFR)
  .union(legBL)
  .union(legBR);

// Return the final assembly under the requested key
return {
  "a-simple-rectangular-desk-consisting-of-": desk
};
