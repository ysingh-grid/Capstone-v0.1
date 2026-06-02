/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Pipe flange disc lying flat on the XY plane with a central bore, six bolt holes on a pitch circle, and a concentric gasket groove on the top face.
 * Workflow ID : eval-T3_021-3c6635
 * Trace ID    : d0ad87ab-5a4c-46e3-b145-e6c40df7651c
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 80.0 × 80.0 × 16.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 7 hole(s) of diameter 9.0 mm (×7)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_021-3c6635/step/T3_021_outer0_attempt0.step
 *   STL    : artifact://eval-T3_021-3c6635/stl/T3_021_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The part is centered at (0,0,0). The main cylinder goes from Z=0 to Z=16. The center bore (r=16) and 6 bolt holes (r=4.5) are through-holes. The gasket groove is a subtractive ring between R=19 and R=25, cut 2mm deep from the top face (Z=14 to Z=16).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Pipe Flange Disc
 * A parametric flat pipe flange with a center bore, six bolt holes on a pitch circle,
 * and a concentric gasket groove on the top face.
 */

// --- Parameters ---
const flangeDiameter = Param.number("Flange Diameter", 80, { min: 40, max: 300, unit: "mm" });
const flangeThickness = Param.number("Flange Thickness", 16, { min: 5, max: 100, unit: "mm" });
const centerBoreDiameter = Param.number("Center Bore Diameter", 32, { min: 10, max: 150, unit: "mm" });
const pitchCircleDiameter = Param.number("Pitch Circle Diameter", 55, { min: 20, max: 250, unit: "mm" });
const boltHoleDiameter = Param.number("Bolt Hole Diameter", 9, { min: 3, max: 30, unit: "mm" });
const gasketGrooveInnerDia = Param.number("Gasket Groove Inner Diameter", 38, { min: 15, max: 200, unit: "mm" });
const gasketGrooveOuterDia = Param.number("Gasket Groove Outer Diameter", 50, { min: 20, max: 250, unit: "mm" });
const gasketGrooveDepth = Param.number("Gasket Groove Depth", 2, { min: 0.5, max: 10, unit: "mm" });

// --- Calculated Radii ---
const flangeRadius = flangeDiameter / 2;
const centerBoreRadius = centerBoreDiameter / 2;
const pitchCircleRadius = pitchCircleDiameter / 2;
const boltHoleRadius = boltHoleDiameter / 2;
const grooveInnerRadius = gasketGrooveInnerDia / 2;
const grooveOuterRadius = gasketGrooveOuterDia / 2;

// --- Main Flange Body ---
// Create the solid base disc
const mainDisc = cylinder(flangeThickness, flangeRadius).color("#a1b0bc");

// --- Center Bore ---
// Create a cylinder slightly taller than the flange to ensure a clean through-cut
const boreCutout = cylinder(flangeThickness + 4, centerBoreRadius)
  .translate(0, 0, -2);

// --- Gasket Groove ---
// Outer boundary of the groove tool
const grooveToolOuter = cylinder(gasketGrooveDepth + 2, grooveOuterRadius)
  .translate(0, 0, flangeThickness - gasketGrooveDepth);

// Inner boundary of the groove tool
const grooveToolInner = cylinder(gasketGrooveDepth + 4, grooveInnerRadius)
  .translate(0, 0, flangeThickness - gasketGrooveDepth - 1);

// Combine to form the annular groove tool
const grooveTool = grooveToolOuter.subtract(grooveToolInner);

// --- Bolt Holes ---
// Create a template bolt hole cylinder, positioned at the pitch circle radius
const baseHole = cylinder(flangeThickness + 4, boltHoleRadius)
  .translate(pitchCircleRadius, 0, -2);

// Rotate the base hole to create the 6 symmetric bolt holes
const hole0 = baseHole;
const hole1 = baseHole.rotate([0, 0, 1], 60);
const hole2 = baseHole.rotate([0, 0, 1], 120);
const hole3 = baseHole.rotate([0, 0, 1], 180);
const hole4 = baseHole.rotate([0, 0, 1], 240);
const hole5 = baseHole.rotate([0, 0, 1], 300);

// --- Final Assembly via Sequential Subtractions ---
// Subtract central bore, gasket groove, and the 6 bolt holes sequentially
const finalFlange = mainDisc
  .subtract(boreCutout)
  .subtract(grooveTool)
  .subtract(hole0)
  .subtract(hole1)
  .subtract(hole2)
  .subtract(hole3)
  .subtract(hole4)
  .subtract(hole5);

// Return the final geometry mapping
return {
  "pipe-flange-disc-lying-flat-on-the-xy-pl": finalFlange
};
