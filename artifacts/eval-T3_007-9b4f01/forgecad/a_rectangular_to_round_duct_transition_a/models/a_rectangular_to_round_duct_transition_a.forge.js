/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A rectangular-to-round duct transition adapter centered at the XY origin, featuring a rectangular base flange, a lofted transition section, and a cylindrical top neck.
 * Workflow ID : eval-T3_007-9b4f01
 * Trace ID    : 9d07b495-1372-46c0-b689-9ef57663419a
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 70.0 × 50.0 × 63.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 26.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_007-9b4f01/step/T3_007_outer0_attempt0.step
 *   STL    : artifact://eval-T3_007-9b4f01/stl/T3_007_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The adapter is designed as a hollow duct with an assumed nominal wall thickness of 2.0mm. The flange has a 60mm x 40mm rectangular opening matching the transition start to ensure air flow.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Rectangular-to-round duct transition adapter.
 * Centered at the XY origin, standing upright along the Z axis.
 */

// --- Parameters ---
const flangeWidth = Param.number("Flange Width X", 70, { min: 50, max: 200, unit: "mm" });
const flangeDepth = Param.number("Flange Depth Y", 50, { min: 30, max: 200, unit: "mm" });
const flangeHeight = Param.number("Flange Height Z", 3, { min: 1, max: 10, unit: "mm" });

const transStartW = Param.number("Transition Start Width X", 60, { min: 40, max: 180, unit: "mm" });
const transStartD = Param.number("Transition Start Depth Y", 40, { min: 20, max: 180, unit: "mm" });

const neckDiameter = Param.number("Neck Diameter", 30, { min: 10, max: 100, unit: "mm" });
const neckHeight = Param.number("Neck Height", 10, { min: 5, max: 50, unit: "mm" });
const wallThickness = Param.number("Wall Thickness", 2, { min: 1, max: 5, unit: "mm" });

// --- Calculated Values ---
const neckRadius = neckDiameter / 2;
const transHeight = 50; // Total transition height from Z=3 to Z=53

// Segment heights for transition approximation
const seg1Height = 17;
const seg2Height = 17;
const seg3Height = 16; 

// --- Outer Shapes ---
// Flange base
const flangeOuter = box(flangeWidth, flangeDepth, flangeHeight);

// Step 1: Lower rectangular transition segment
const trans1Outer = box(transStartW - 2, transStartD - 2, seg1Height)
  .translate(0, 0, flangeHeight);

// Step 2: Middle transitional rectangular segment
const trans2Outer = box(transStartW - 10, transStartD - 10, seg2Height)
  .translate(0, 0, flangeHeight + seg1Height);

// Step 3: Upper transitional cylindrical segment
const trans3Outer = cylinder(seg3Height, neckRadius + 2)
  .translate(0, 0, flangeHeight + seg1Height + seg2Height);

// Neck segment
const neckOuter = cylinder(neckHeight, neckRadius)
  .translate(0, 0, flangeHeight + transHeight);

// Combine outer shell
const outerShell = flangeOuter
  .union(trans1Outer)
  .union(trans2Outer)
  .union(trans3Outer)
  .union(neckOuter);

// --- Inner Shapes (Hollow Path) ---
// Flange cutout matching the transition start dimensions
const flangeInner = box(transStartW, transStartD, flangeHeight + 0.2)
  .translate(0, 0, -0.1);

// Step 1 Inner
const trans1Inner = box(transStartW - 2 - 2 * wallThickness, transStartD - 2 - 2 * wallThickness, seg1Height + 0.2)
  .translate(0, 0, flangeHeight - 0.1);

// Step 2 Inner
const trans2Inner = box(transStartW - 10 - 2 * wallThickness, transStartD - 10 - 2 * wallThickness, seg2Height + 0.2)
  .translate(0, 0, flangeHeight + seg1Height - 0.1);

// Step 3 Inner
const trans3Inner = cylinder(seg3Height + 0.2, neckRadius + 2 - wallThickness)
  .translate(0, 0, flangeHeight + seg1Height + seg2Height - 0.1);

// Neck Inner
const neckInner = cylinder(neckHeight + 0.2, neckRadius - wallThickness)
  .translate(0, 0, flangeHeight + transHeight - 0.1);

// Combine inner cutout
const innerCutout = flangeInner
  .union(trans1Inner)
  .union(trans2Inner)
  .union(trans3Inner)
  .union(neckInner);

// --- Final Boolean Operation ---
const finalShape = outerShell.subtract(innerCutout).color("#5f87c6");

return {
  "a-rectangular-to-round-duct-transition-a": finalShape,
};
