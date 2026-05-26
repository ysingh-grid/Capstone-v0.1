/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Z-bracket (offset mounting bracket) modeled in the XZ plane with a bottom plate, a vertical web, and a top plate.
 * Workflow ID : eval-T2_023-27bc8e
 * Trace ID    : c87054e6-e468-4bd9-b88e-3d31ce4eb884
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 60.0 × 25.0 × 26.0 mm
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
 *   STEP   : artifact://eval-T2_023-27bc8e/step/T2_023_outer0_attempt0.step
 *   STL    : artifact://eval-T2_023-27bc8e/stl/T2_023_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure proper union of the three components. The vertical web is centered at X=0 (ranging from X=-1.5 to X=1.5) and spans Z=0 to Z=26. The bottom plate extends from X=0 to 30 (Z=0 to 3). The top plate extends from X=-30 to 0 (Z=23 to 26). All components are centered in Y (ranging from Y=-12.5 to 12.5).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: Z-bracket (offset mounting bracket)
 * Designed in the XZ plane with a bottom plate, vertical web, and top plate.
 */

// Define parameters for the Z-bracket dimensions
const bottomPlateLength = Param.number("Bottom Plate Length", 30, { min: 5, max: 100, unit: "mm" });
const topPlateLength    = Param.number("Top Plate Length",    30, { min: 5, max: 100, unit: "mm" });
const bracketDepth      = Param.number("Bracket Depth",       25, { min: 5, max: 100, unit: "mm" });
const plateThickness    = Param.number("Plate Thickness",      3, { min: 1, max: 20,  unit: "mm" });
const overallHeight     = Param.number("Overall Height",      26, { min: 10, max: 150, unit: "mm" });
const webThickness      = Param.number("Web Thickness",        3, { min: 1, max: 20,  unit: "mm" });

// Step 1: Create the vertical web centered at X=0, spanning full height Z=0 to Z=overallHeight
const verticalWeb = box(webThickness, bracketDepth, overallHeight)
  .color("#5f87c6");

// Step 2: Create the bottom plate spanning from X=0 to X=bottomPlateLength, and Z=0 to Z=plateThickness
// box() is centered on XY, so we translate X by +half-length to start at X=0
const bottomPlateOffset = bottomPlateLength / 2;
const bottomPlate = box(bottomPlateLength, bracketDepth, plateThickness)
  .translate(bottomPlateOffset, 0, 0)
  .color("#5f87c6");

// Step 3: Create the top plate spanning from X=-topPlateLength to X=0, and Z=(overallHeight - plateThickness) to Z=overallHeight
// box() is centered on XY, so we translate X by -half-length to end at X=0, and Z to the top
const topPlateOffset = -topPlateLength / 2;
const topPlateZPosition = overallHeight - plateThickness;
const topPlate = box(topPlateLength, bracketDepth, plateThickness)
  .translate(topPlateOffset, 0, topPlateZPosition)
  .color("#5f87c6");

// Step 4: Union the components together to form the complete Z-bracket
const bracketShape = verticalWeb
  .union(bottomPlate)
  .union(topPlate);

// Return the final assembly under the specified key
return {
  "z-bracket-(offset-mounting-bracket)-mode": bracketShape,
};
