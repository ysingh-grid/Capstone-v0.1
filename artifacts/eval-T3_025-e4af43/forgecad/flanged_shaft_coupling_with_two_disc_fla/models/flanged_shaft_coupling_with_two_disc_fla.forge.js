/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Flanged shaft coupling with two disc flanges and a central hub cylinder, featuring a center bore, keyway, and six bolt holes through the flanges.
 * Workflow ID : eval-T3_025-e4af43
 * Trace ID    : 0ff13e5b-0153-4d2a-ba51-0a45301abe29
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 50.0 × 50.0 × 60.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 7 hole(s) of diameter center bore: 14mm; bolt holes: 6.5mm mm (×7)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_025-e4af43/step/T3_025_outer0_attempt0.step
 *   STL    : artifact://eval-T3_025-e4af43/stl/T3_025_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Construction approach: (1) Union three cylinders — bottom flange (R=25, Z=0..10), hub (R=14, Z=10..50), top flange (R=25, Z=50..60) — all centered at origin X=0, Y=0. (2) Subtract center bore cylinder (R=7, Z=0..60) centered at origin. (3) Subtract keyway box: width 5mm in Y (centered at Y=0), depth 2.5mm in X starting from bore wall at X=7 extending outward to X=9.5 (i.e., X from 7 to 9.5 = bore_radius to bore_radius+keyway_depth), full Z=0..60. The keyway center_x reference of 5.75mm appears to be the centroid of the keyway box in X: (7+9.5)/2 - wait, recompute: bore radius=7, keyway cuts inward from bore wall outward by 2.5mm so X spans 7.0 to 9.5, centroid at X=8.25. Alternatively interpret 5.75 as offset of keyway box center from bore axis: bore_radius - keyway_depth/2 = 7 - 1.25 = 5.75, suggesting keyway box center at X=5.75, spanning X from 5.75-1.25=4.5 to 5.75+1.25=7.0, i.e., the keyway cuts INTO the bore from X=4.5 to X=7. Use this interpretation: keyway is a box centered at (5.75, 0) in XY, 2.5mm wide in X (4.5 to 7.0) and 5mm wide in Y (-2.5 to +2.5), full Z. (4) Subtract 6 bolt hole cylinders (R=3.25, Z=0..60) at positions (19*cos(theta), 19*sin(theta)) for theta = 0,60,120,180,240,300 degrees. Bolt holes only physically cut material where flanges exist (D=50mm) since hub D=28mm is inside PCD R=19mm barely (hub R=14 < bolt PCD R=19, so bolt holes do pass through hub region too — coder must subtract full length). Verify: hub radius 14mm < bolt PCD radius 19mm, so bolt holes at radius 19mm will intersect hub cylinder. Coder should subtract all 6 bolt holes for full Z=0..60 regardless.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Flanged Shaft Coupling
 * Two disc flanges + central hub, center bore, keyway, and 6 bolt holes.
 */

// --- Parameters ---
const flangeDiameter   = Param.number("Flange Diameter",   50,   { min: 20,  max: 200, unit: "mm" });
const flangeThickness  = Param.number("Flange Thickness",  10,   { min: 2,   max: 50,  unit: "mm" });
const hubDiameter      = Param.number("Hub Diameter",      28,   { min: 10,  max: 100, unit: "mm" });
const hubLength        = Param.number("Hub Length",        40,   { min: 5,   max: 200, unit: "mm" });
const boreDiameter     = Param.number("Bore Diameter",     14,   { min: 4,   max: 60,  unit: "mm" });
const keywayWidth      = Param.number("Keyway Width",      5,    { min: 1,   max: 20,  unit: "mm" });
const keywayDepth      = Param.number("Keyway Depth",      2.5,  { min: 0.5, max: 10,  unit: "mm" });
const boltHoleDia      = Param.number("Bolt Hole Dia",     6.5,  { min: 2,   max: 20,  unit: "mm" });
const boltPCDRadius    = Param.number("Bolt PCD Radius",   19,   { min: 10,  max: 80,  unit: "mm" });

// --- Derived values ---
const flangeRadius  = flangeDiameter / 2;
const hubRadius     = hubDiameter / 2;
const boreRadius    = boreDiameter / 2;
const boltHoleR     = boltHoleDia / 2;
const totalLength   = flangeThickness * 2 + hubLength;   // 60mm

// --- Flange and hub Z positions ---
const bottomFlangeZ = flangeThickness / 2;               // center of bottom flange in Z
const hubCenterZ    = flangeThickness + hubLength / 2;   // center of hub in Z
const topFlangeZ    = flangeThickness + hubLength + flangeThickness / 2; // center of top flange

// --- Build the three solid cylinders ---
// Bottom flange disc: R=25, T=10, centered at Z=5
const bottomFlange = cylinder(flangeThickness, flangeRadius)
    .translate(0, 0, bottomFlangeZ);

// Central hub cylinder: R=14, L=40, centered at Z=30
const hubCylinder = cylinder(hubLength, hubRadius)
    .translate(0, 0, hubCenterZ);

// Top flange disc: R=25, T=10, centered at Z=55
const topFlange = cylinder(flangeThickness, flangeRadius)
    .translate(0, 0, topFlangeZ);

// Union all three solid sections
const solidBody = bottomFlange.union(hubCylinder).union(topFlange);

// --- Center bore: D=14, full length Z=0..60 ---
const boreHeight = totalLength + 2; // slight oversize for clean boolean
const bore = cylinder(boreHeight, boreRadius)
    .translate(0, 0, totalLength / 2);

// --- Keyway slot ---
// bore radius = 7, keyway center X = bore_radius - keyway_depth/2 = 7 - 1.25 = 5.75
// keyway box: 2.5mm in X (from 4.5 to 7.0), 5mm in Y, full Z
const keywayCenterX = boreRadius - keywayDepth / 2;
const keywayBoxH = totalLength + 2;
const keyway = box(keywayDepth, keywayWidth, keywayBoxH)
    .translate(keywayCenterX, 0, totalLength / 2);

// --- Six bolt holes at 0, 60, 120, 180, 240, 300 degrees ---
const boltH = totalLength + 2;
const boltCylBase = cylinder(boltH, boltHoleR).translate(0, 0, totalLength / 2);

const bolt0   = boltCylBase.translate( boltPCDRadius,  0, 0);
const bolt60  = boltCylBase.translate( boltPCDRadius * Math.cos(Math.PI / 3),  boltPCDRadius * Math.sin(Math.PI / 3),  0);
const bolt120 = boltCylBase.translate( boltPCDRadius * Math.cos(2 * Math.PI / 3), boltPCDRadius * Math.sin(2 * Math.PI / 3), 0);
const bolt180 = boltCylBase.translate(-boltPCDRadius,  0, 0);
const bolt240 = boltCylBase.translate( boltPCDRadius * Math.cos(4 * Math.PI / 3), boltPCDRadius * Math.sin(4 * Math.PI / 3), 0);
const bolt300 = boltCylBase.translate( boltPCDRadius * Math.cos(5 * Math.PI / 3), boltPCDRadius * Math.sin(5 * Math.PI / 3), 0);

// Union all bolt holes first, then subtract once (avoids 6 separate subtracts)
const allBolts = bolt0.union(bolt60).union(bolt120).union(bolt180).union(bolt240).union(bolt300);

// --- Assemble: subtract bore, keyway, and bolt holes ---
const bodyWithBore    = solidBody.subtract(bore);
const bodyWithKeyway  = bodyWithBore.subtract(keyway);
const finalShape      = bodyWithKeyway.subtract(allBolts);

// --- Color ---
const coloredShape = finalShape.color("#7a9cbf");

return {
    "flanged-shaft-coupling-with-two-disc-fla": coloredShape,
};
