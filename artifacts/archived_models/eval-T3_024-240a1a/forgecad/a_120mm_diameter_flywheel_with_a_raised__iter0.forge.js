/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A 120mm diameter flywheel with a raised 40mm hub boss, a 16mm center bore, and six 22mm lightening holes spaced on a 70mm pitch circle diameter.
 * Workflow ID : eval-T3_024-240a1a
 * Trace ID    : 0d6836a2-3e83-4e88-8678-13a3e220ad97
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 120.0 × 120.0 × 30.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 7 hole(s) of diameter 22.0 mm (×7)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_024-240a1a/step/T3_024_outer0_attempt1.step
 *   STL    : artifact://eval-T3_024-240a1a/stl/T3_024_outer0_attempt1.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the center bore passes completely through both the hub boss and the main disc (Z=0 to Z=30). The 6 lightening holes must only pass through the main disc (Z=0 to Z=20) and should be positioned at angles: 0, 60, 120, 180, 240, and 300 degrees.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Flywheel with lightening holes and a raised hub boss.
 */

// Define parameters for the flywheel
const discDia = Param.number("Disc Diameter", 120, { min: 50, max: 300, unit: "mm" });
const discThick = Param.number("Disc Thickness", 20, { min: 5, max: 100, unit: "mm" });
const hubDia = Param.number("Hub Diameter", 40, { min: 10, max: 150, unit: "mm" });
const hubHeight = Param.number("Hub Height", 10, { min: 2, max: 100, unit: "mm" });
const boreDia = Param.number("Bore Diameter", 16, { min: 4, max: 80, unit: "mm" });
const holeDia = Param.number("Lightening Hole Diameter", 22, { min: 5, max: 50, unit: "mm" });
const pcd = Param.number("Pitch Circle Diameter", 70, { min: 20, max: 250, unit: "mm" });

// Calculate radii
const discRad = discDia / 2;
const hubRad = hubDia / 2;
const boreRad = boreDia / 2;
const holeRad = holeDia / 2;
const pcdRad = pcd / 2;

// Create main disc base (Z: 0 to discThick)
const disc = cylinder(discThick, discRad);

// Create raised hub boss (Z: discThick to discThick + hubHeight)
const hub = cylinder(hubHeight, hubRad).translate(0, 0, discThick);

// Merge disc and hub
const rawBody = disc.union(hub);

// Create center bore through entire height (Z: 0 to discThick + hubHeight)
const bore = cylinder(discThick + hubHeight, boreRad);

// Subtract bore from body
const boredBody = rawBody.subtract(bore);

// Create 6 lightening holes positioned at 60 degree increments
const h1 = cylinder(discThick, holeRad).translate(pcdRad, 0, 0);
const h2 = cylinder(discThick, holeRad).translate(pcdRad, 0, 0).rotate([0, 0, 1], 60);
const h3 = cylinder(discThick, holeRad).translate(pcdRad, 0, 0).rotate([0, 0, 1], 120);
const h4 = cylinder(discThick, holeRad).translate(pcdRad, 0, 0).rotate([0, 0, 1], 180);
const h5 = cylinder(discThick, holeRad).translate(pcdRad, 0, 0).rotate([0, 0, 1], 240);
const h6 = cylinder(discThick, holeRad).translate(pcdRad, 0, 0).rotate([0, 0, 1], 300);

// Subtract all 6 holes sequentially to avoid loop performance bottlenecks
const flywheel = boredBody
  .subtract(h1)
  .subtract(h2)
  .subtract(h3)
  .subtract(h4)
  .subtract(h5)
  .subtract(h6)
  .color("#5f87c6");

// Return final geometry mapping
return {
  "a-120mm-diameter-flywheel-with-a-raised-": flywheel
};
