/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Flanged shaft coupling aligned with the Z-axis, featuring a bottom flange, central hub, top flange, center bore with a keyway, and six through-bolt holes on the flanges.
 * Workflow ID : eval-T3_025-3412e2
 * Trace ID    : fc335aa7-d1be-466b-bed9-bd513c64c3fc
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
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_025-3412e2/step/T3_025_outer0_attempt0.step
 *   STL    : artifact://eval-T3_025-3412e2/stl/T3_025_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The prompt specifies the keyway is centered at X = (bore radius - half keyway depth) = 5.75mm. Note that a standard keyway cuts *into* the hub wall, which would require the center of the keyway box to be at X = (bore radius + half keyway depth) = 8.25mm (to cut from X=7.0 to X=9.5). Please implement the keyway such that it cuts 2.5mm deep into the bore wall on the +X side (extending to X=9.5mm). The bolt holes only cut the flanges as the hub radius (14mm) is smaller than the bolt circle inner boundary (19 - 3.25 = 15.75mm).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Flanged Shaft Coupling Model
 * Centered on Z-axis with configurable dimensions, keyway, and six flange bolt holes.
 */

// Define parameters as live sliders in the studio
const flangeDia = Param.number("Flange Diameter", 50, { min: 30, max: 100, unit: "mm" });
const flangeThick = Param.number("Flange Thickness", 10, { min: 2, max: 25, unit: "mm" });
const hubDia = Param.number("Hub Diameter", 28, { min: 15, max: 60, unit: "mm" });
const hubLength = Param.number("Hub Length", 40, { min: 10, max: 100, unit: "mm" });
const boreDia = Param.number("Bore Diameter", 14, { min: 5, max: 30, unit: "mm" });
const keywayWidth = Param.number("Keyway Width", 5, { min: 1, max: 10, unit: "mm" });
const keywayDepth = Param.number("Keyway Depth", 2.5, { min: 0.5, max: 5, unit: "mm" });
const boltDia = Param.number("Bolt Hole Diameter", 6.5, { min: 2, max: 12, unit: "mm" });
const boltPCD = Param.number("Bolt PCD", 38, { min: 20, max: 90, unit: "mm" });

// Calculate helper dimensions
const totalLength = flangeThick * 2 + hubLength;
const flangeRad = flangeDia / 2;
const hubRad = hubDia / 2;
const boreRad = boreDia / 2;
const boltRadius = boltPCD / 2;
const boltHoleRad = boltDia / 2;

// Construct bottom flange cylinder (from Z=0 to Z=flangeThick)
const bottomFlange = cylinder(flangeThick, flangeRad);

// Construct central hub cylinder (from Z=flangeThick to Z=flangeThick+hubLength)
const hub = cylinder(hubLength, hubRad).translate(0, 0, flangeThick);

// Construct top flange cylinder (from Z=flangeThick+hubLength to Z=totalLength)
const topFlange = cylinder(flangeThick, flangeRad).translate(0, 0, flangeThick + hubLength);

// Union the main coaxial outer shapes together
const mainBody = bottomFlange.union(hub).union(topFlange);

// Create the center bore cylinder running the full length
const bore = cylinder(totalLength, boreRad);

// Create the rectangular keyway cutting tool (reaches into the +X side wall)
const keywayXOffset = boreRad + (keywayDepth / 2);
const keyway = box(keywayDepth, keywayWidth, totalLength).translate(keywayXOffset, 0, 0);

// Helper function to convert degrees to radians
const degToRad = (deg) => (deg * Math.PI) / 180;

// Explicitly define 6 bolt hole cylinders to avoid loop complexity
const h0 = cylinder(totalLength, boltHoleRad).translate(boltRadius * Math.cos(degToRad(0)),   boltRadius * Math.sin(degToRad(0)),   0);
const h1 = cylinder(totalLength, boltHoleRad).translate(boltRadius * Math.cos(degToRad(60)),  boltRadius * Math.sin(degToRad(60)),  0);
const h2 = cylinder(totalLength, boltHoleRad).translate(boltRadius * Math.cos(degToRad(120)), boltRadius * Math.sin(degToRad(120)), 0);
const h3 = cylinder(totalLength, boltHoleRad).translate(boltRadius * Math.cos(degToRad(180)), boltRadius * Math.sin(degToRad(180)), 0);
const h4 = cylinder(totalLength, boltHoleRad).translate(boltRadius * Math.cos(degToRad(240)), boltRadius * Math.sin(degToRad(240)), 0);
const h5 = cylinder(totalLength, boltHoleRad).translate(boltRadius * Math.cos(degToRad(300)), boltRadius * Math.sin(degToRad(300)), 0);

// Subtract the center bore, keyway, and bolt holes sequentially from the main body
const finalCoupling = mainBody
  .subtract(bore)
  .subtract(keyway)
  .subtract(h0)
  .subtract(h1)
  .subtract(h2)
  .subtract(h3)
  .subtract(h4)
  .subtract(h5)
  .color("#8a95a5"); // Apply steel colored finish

// Return the final model mapped to the requested key name
return {
  "flanged-shaft-coupling-aligned-with-the-": finalCoupling
};
