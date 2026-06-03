/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : V-belt pulley standing upright along the Z-axis, centered at the origin, featuring a central bore, a V-groove on the outer rim, and a keyway slot on the +X side.
 * Workflow ID : eval-T3_004-e480f7
 * Trace ID    : 8339b492-cb22-43df-be6f-d5d07b6dbd17
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 60.0 × 60.0 × 20.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 12.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_004-e480f7/step/T3_004_outer0_attempt0.step
 *   STL    : artifact://eval-T3_004-e480f7/stl/T3_004_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Define the 2D profile in the XZ plane with points (6,0) -> (30,0) -> (30,5) -> (20,10) -> (30,15) -> (30,20) -> (6,20) -> closed, then revolve it 360 degrees around the Z axis. Cut the keyway slot on the +X side with a width of 4mm in Y (-2 to +2) and running from X=6 to X=8.5 through the full Z height of 20mm.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * V-belt pulley standing upright along the Z-axis.
 * Centered at the origin, featuring a central bore, a V-groove on the outer rim, and a keyway slot.
 */

// --- Parameters ---
const pulleyWidth = Param.number("Pulley Width", 20, { min: 5, max: 100, unit: "mm" });
const outerDiameter = Param.number("Outer Diameter", 60, { min: 20, max: 200, unit: "mm" });
const boreDiameter = Param.number("Bore Diameter", 12, { min: 5, max: 50, unit: "mm" });
const keywayWidth = Param.number("Keyway Width", 4, { min: 1, max: 20, unit: "mm" });
const keywayDepth = Param.number("Keyway Depth", 2.5, { min: 0.5, max: 10, unit: "mm" });
const vGrooveRootRadius = Param.number("V-Groove Root Radius", 20, { min: 5, max: 100, unit: "mm" });
const vGrooveStart = Param.number("V-Groove Start Z", 5, { min: 0, max: 50, unit: "mm" });
const vGrooveEnd = Param.number("V-Groove End Z", 15, { min: 0, max: 50, unit: "mm" });

// --- Calculated Values ---
const outerRadius = outerDiameter / 2;
const boreRadius = boreDiameter / 2;
const vGrooveMid = (vGrooveStart + vGrooveEnd) / 2;

// --- Pulley Body Construction ---
// 1. Bottom flange (Z = 0 to Z = 5)
const bottomFlange = cylinder(vGrooveStart, outerRadius);

// 2. Bottom transition cone (Z = 5 to Z = 10)
const bottomConeH = vGrooveMid - vGrooveStart;
const bottomCone = cone(bottomConeH, outerRadius, vGrooveRootRadius)
  .translate(0, 0, vGrooveStart);

// 3. Top transition cone (Z = 10 to Z = 15)
const topConeH = vGrooveEnd - vGrooveMid;
const topCone = cone(topConeH, vGrooveRootRadius, outerRadius)
  .translate(0, 0, vGrooveMid);

// 4. Top flange (Z = 15 to Z = 20)
const topFlangeH = pulleyWidth - vGrooveEnd;
const topFlange = cylinder(topFlangeH, outerRadius)
  .translate(0, 0, vGrooveEnd);

// Union the body segments sequentially
const pulleyBody = bottomFlange
  .union(bottomCone)
  .union(topCone)
  .union(topFlange);

// --- Subtraction Features ---
// 5. Central bore through the entire height
const bore = cylinder(pulleyWidth, boreRadius);

// 6. Keyway slot on the +X side
const keywayXSize = boreRadius + keywayDepth;
const keywayBox = box(keywayXSize, keywayWidth, pulleyWidth)
  .translate(keywayXSize / 2, 0, 0);

// --- Final Assembly ---
const finalPulley = pulleyBody
  .subtract(bore)
  .subtract(keywayBox)
  .color("#708090"); // Slate grey metallic finish

// Return the final model
return {
  "v-belt-pulley-standing-upright-along-the": finalPulley,
};
