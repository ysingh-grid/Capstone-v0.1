/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A flanged shaft coupling standing along the Z axis, centered at the origin in X and Y. It consists of a bottom flange, a central hub, and a top flange, with a center bore, keyway, and six bolt holes passing through the flanges.
 * Workflow ID : eval-T3_025-39a605
 * Trace ID    : a6b22b97-b6ea-40bc-995d-74b5c75f8074
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 50.0 × 50.0 × 60.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 7 hole(s) of diameter 6.5 mm (×7)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.98
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_025-39a605/step/T3_025_outer0_attempt0.step
 *   STL    : artifact://eval-T3_025-39a605/stl/T3_025_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create the main body by unioning the bottom flange (cylinder, r=25, h=10 at Z=0), central hub (cylinder, r=14, h=40 at Z=10), and top flange (cylinder, r=25, h=10 at Z=50). Subtract the center bore (cylinder, r=7, h=60). Subtract six bolt holes (cylinder, r=3.25, h=60) distributed at 60-degree increments on a radius of 19mm. Note that since the hub radius (14mm) is smaller than the inner edge of the bolt holes (19 - 3.25 = 15.75mm), the bolt holes will automatically only cut the top and bottom flanges. To cut the keyway, subtract a box of dimension SX=5.0, SY=5.0, SZ=60.0 centered at X=5.75, Y=0.0, Z=30.0. This aligns with the prompt's specifications and results in a keyway depth cutting 1.25mm into the 7mm radius bore wall (outermost extent at X=8.25).
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
 * A coaxial flanged coupling standing along the Z axis, with a keyway and bolt holes.
 */

// --- Parameters ---
const flangeDia = Param.number("Flange Diameter", 50, { min: 20, max: 200, unit: "mm" });
const flangeThick = Param.number("Flange Thickness", 10, { min: 2, max: 50, unit: "mm" });
const hubDia = Param.number("Central Hub Diameter", 28, { min: 10, max: 100, unit: "mm" });
const hubLen = Param.number("Central Hub Length", 40, { min: 10, max: 150, unit: "mm" });
const boreDia = Param.number("Center Bore Diameter", 14, { min: 5, max: 50, unit: "mm" });
const boltDia = Param.number("Bolt Hole Diameter", 6.5, { min: 2, max: 20, unit: "mm" });
const boltPcd = Param.number("Bolt Pitch Circle Diameter", 38, { min: 15, max: 180, unit: "mm" });
const keyWidth = Param.number("Keyway Width (Y)", 5, { min: 1, max: 20, unit: "mm" });
const keyDepth = Param.number("Keyway Depth (X)", 2.5, { min: 0.5, max: 10, unit: "mm" });
const keyCenterX = Param.number("Keyway Center X", 5.75, { min: 1, max: 30, unit: "mm" });

// --- Calculated Values ---
const flangeRad = flangeDia / 2;
const hubRad = hubDia / 2;
const boreRad = boreDia / 2;
const boltRad = boltDia / 2;
const boltPitchRad = boltPcd / 2;
const totalLength = flangeThick * 2 + hubLen;

// --- Main Body Construction ---
// Bottom flange disc (Z = 0 to flangeThick)
const bottomFlange = cylinder(flangeThick, flangeRad);

// Central hub cylinder (Z = flangeThick to flangeThick + hubLen)
const centralHub = cylinder(hubLen, hubRad).translate(0, 0, flangeThick);

// Top flange disc (Z = flangeThick + hubLen to totalLength)
const topFlange = cylinder(flangeThick, flangeRad).translate(0, 0, flangeThick + hubLen);

// Combine the outer body sections
let body = bottomFlange.union(centralHub).union(topFlange);

// --- Subtraction Features ---
// Center bore running the full length
const centerBore = cylinder(totalLength, boreRad);

// Keyway slot running the full length
const keyway = box(keyWidth, keyWidth, totalLength).translate(keyCenterX, 0, 0);

// Six bolt holes distributed on the pitch circle
const baseHole = cylinder(totalLength, boltRad).translate(boltPitchRad, 0, 0);
const hole0 = baseHole;
const hole60 = baseHole.rotate([0, 0, 1], 60);
const hole120 = baseHole.rotate([0, 0, 1], 120);
const hole180 = baseHole.rotate([0, 0, 1], 180);
const hole240 = baseHole.rotate([0, 0, 1], 240);
const hole300 = baseHole.rotate([0, 0, 1], 300);

// Subtract all internal features from the main body
const finalShape = body
  .subtract(centerBore)
  .subtract(keyway)
  .subtract(hole0)
  .subtract(hole60)
  .subtract(hole120)
  .subtract(hole180)
  .subtract(hole240)
  .subtract(hole300)
  .color("#5f87c6");

// Return the final model assembly
return {
  "a-flanged-shaft-coupling-standing-along-": finalShape,
};
