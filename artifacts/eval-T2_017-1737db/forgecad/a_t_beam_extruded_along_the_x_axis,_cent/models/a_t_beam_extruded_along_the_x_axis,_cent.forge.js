/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A T-beam extruded along the X-axis, centered at the origin, with a 3mm thick vertical web and a 30mm wide, 3mm thick horizontal flange on top.
 * Workflow ID : eval-T2_017-1737db
 * Trace ID    : 361f7c88-ecf8-4fb1-82bd-33c1f8a772c6
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 80.0 × 30.0 × 40.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 2.0%
 *   BBox IoU       : ≥ 0.98
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T2_017-1737db/step/T2_017_outer0_attempt0.step
 *   STL    : artifact://eval-T2_017-1737db/stl/T2_017_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The T-beam should be centered at the origin. This means X extends from -40 to 40, Y extends from -15 to 15 (for the flange), and Z extends from 0 to 40. Ensure the web is centered on Y=0 (extending from Y=-1.5 to 1.5) and spans Z=0 to Z=37. The flange should span Z=37 to Z=40 and Y=-15 to 15.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * T-Beam model extruded along the X-axis, centered on the XY plane.
 */

// Define parameters for the T-beam dimensions
const length = Param.number("Length", 80, { min: 10, max: 500, unit: "mm" });
const totalHeight = Param.number("Total Height", 40, { min: 5, max: 200, unit: "mm" });
const flangeWidth = Param.number("Flange Width", 30, { min: 5, max: 200, unit: "mm" });
const flangeThickness = Param.number("Flange Thickness", 3, { min: 1, max: 50, unit: "mm" });
const webThickness = Param.number("Web Thickness", 3, { min: 1, max: 50, unit: "mm" });

// Calculate the vertical web height to respect the total height constraint
const webHeight = totalHeight - flangeThickness;

// Create the vertical web, centered on XY, extending Z from 0 to webHeight
const verticalWeb = box(length, webThickness, webHeight);

// Create the horizontal flange, centered on XY, extending Z from 0 to flangeThickness
const horizontalFlange = box(length, flangeWidth, flangeThickness);

// Translate the flange to sit perfectly on top of the vertical web
const positionedFlange = horizontalFlange.translate(0, 0, webHeight);

// Combine the web and the flange into a single solid T-beam
const tBeam = verticalWeb.union(positionedFlange).color("#5f87c6");

// Return the final shape using the specified part name
return {
  "a-t-beam-extruded-along-the-x-axis,-cent": tBeam
};
