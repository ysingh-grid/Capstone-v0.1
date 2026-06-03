/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Pipe flange disc lying flat on the XY plane, centered at the origin, with a center bore, six bolt holes on a pitch circle, and a concentric gasket groove on the top face.
 * Workflow ID : eval-T3_021-c53383
 * Trace ID    : 154053e3-c02b-421d-b9cf-42c5d079b865
 * Iteration   : 1
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 80.0 × 80.0 × 16.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 7 hole(s) of diameter 32mm center bore, 9mm bolt holes (x6) mm (×7)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_021-c53383/step/T3_021_outer1_attempt0.step
 *   STL    : artifact://eval-T3_021-c53383/stl/T3_021_outer1_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   1. The main body is a cylinder (radius=40mm) from Z=0 to Z=16, centered at origin. 2. Subtract a coaxial cylinder (radius=16mm) through full thickness for the center bore. 3. Subtract six cylinders (radius=4.5mm) centered at (27.5*cos(theta), 27.5*sin(theta), 0) for theta in {0,60,120,180,240,300} degrees, through full thickness. 4. Subtract a ring (annular cylinder, inner radius=19mm, outer radius=25mm) from Z=14 to Z=16 for the gasket groove — this can be implemented as subtracting an outer cylinder (r=25mm, h=2mm) then adding back an inner cylinder (r=19mm, h=2mm), or by direct annular extrusion. 5. Volume estimate (approximate): Main disc = pi*40^2*16 = 80424 mm^3; minus center bore = pi*16^2*16 = 12868 mm^3; minus 6 bolt holes = 6*pi*4.5^2*16 = 6109 mm^3; minus gasket groove = pi*(25^2-19^2)*2 = pi*(625-361)*2 = 1659 mm^3; Net approx = 80424 - 12868 - 6109 - 1659 = 59788 mm^3 (use ~60000 mm^3 as reference). 6. All booleans should be subtractive from the main disc. 7. Ensure the part is properly centered at XY origin with Z from 0 to 16.
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
 * Flat on XY plane, Z=0 to Z=16, centered at origin.
 * Features: center bore, six bolt holes on PCD, gasket groove on top face.
 */

// Parameters
const flangeRadius      = Param.number("Flange Radius",         40,   { min: 20,  max: 200, unit: "mm" });
const flangeThickness   = Param.number("Flange Thickness",      16,   { min: 4,   max: 80,  unit: "mm" });
const boreDiameter      = Param.number("Bore Diameter",         32,   { min: 8,   max: 120, unit: "mm" });
const boltHoleRadius    = Param.number("Bolt Hole Radius",      4.5,  { min: 1,   max: 20,  unit: "mm" });
const boltPCDRadius     = Param.number("Bolt PCD Radius",       27.5, { min: 10,  max: 150, unit: "mm" });
const grooveInnerRadius = Param.number("Groove Inner Radius",   19,   { min: 5,   max: 100, unit: "mm" });
const grooveOuterRadius = Param.number("Groove Outer Radius",   25,   { min: 10,  max: 120, unit: "mm" });
const grooveDepth       = Param.number("Groove Depth",          2,    { min: 0.5, max: 10,  unit: "mm" });

// Derived values
const boreRadius      = boreDiameter / 2;
const halfThickness   = flangeThickness / 2;
const grooveZ         = flangeThickness - grooveDepth;

// Main flange disc: cylinder centered at XY origin, shifted so Z goes from 0 to flangeThickness
const flangeDisc = cylinder(flangeThickness, flangeRadius)
    .translate(0, 0, halfThickness);

// Center bore: full thickness cylinder subtracted from center
const centerBore = cylinder(flangeThickness, boreRadius)
    .translate(0, 0, halfThickness);

// Bolt holes: six cylinders at 0, 60, 120, 180, 240, 300 degrees on PCD
const boltCylHeight = flangeThickness;
const bolt0   = cylinder(boltCylHeight, boltHoleRadius)
    .translate(boltPCDRadius, 0, halfThickness);
const bolt60  = cylinder(boltCylHeight, boltHoleRadius)
    .translate(boltPCDRadius * Math.cos(Math.PI / 3), boltPCDRadius * Math.sin(Math.PI / 3), halfThickness);
const bolt120 = cylinder(boltCylHeight, boltHoleRadius)
    .translate(boltPCDRadius * Math.cos(2 * Math.PI / 3), boltPCDRadius * Math.sin(2 * Math.PI / 3), halfThickness);
const bolt180 = cylinder(boltCylHeight, boltHoleRadius)
    .translate(-boltPCDRadius, 0, halfThickness);
const bolt240 = cylinder(boltCylHeight, boltHoleRadius)
    .translate(boltPCDRadius * Math.cos(4 * Math.PI / 3), boltPCDRadius * Math.sin(4 * Math.PI / 3), halfThickness);
const bolt300 = cylinder(boltCylHeight, boltHoleRadius)
    .translate(boltPCDRadius * Math.cos(5 * Math.PI / 3), boltPCDRadius * Math.sin(5 * Math.PI / 3), halfThickness);

// Gasket groove: annular ring on top face, cut from Z=grooveZ to Z=flangeThickness
// Subtract outer cylinder then restore inner cylinder (net = annular groove)
const grooveOuter = cylinder(grooveDepth, grooveOuterRadius)
    .translate(0, 0, grooveZ + grooveDepth / 2);
const grooveInner = cylinder(grooveDepth, grooveInnerRadius)
    .translate(0, 0, grooveZ + grooveDepth / 2);

// Build the annular groove shape by subtracting inner from outer
const grooveRing = grooveOuter.subtract(grooveInner);

// Assemble: subtract bore, bolt holes, then gasket groove ring from flange disc
const afterBore = flangeDisc.subtract(centerBore);
const afterBolts = afterBore
    .subtract(bolt0)
    .subtract(bolt60)
    .subtract(bolt120)
    .subtract(bolt180)
    .subtract(bolt240)
    .subtract(bolt300);
const finalShape = afterBolts.subtract(grooveRing)
    .color("#7a9fc2");

return {
    "pipe-flange-disc-lying-flat-on-the-xy-pl": finalShape,
};
