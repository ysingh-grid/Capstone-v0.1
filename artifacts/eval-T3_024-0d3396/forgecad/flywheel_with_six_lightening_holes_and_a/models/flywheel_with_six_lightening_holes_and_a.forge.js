/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Flywheel with six lightening holes and a raised hub boss, centered at the origin on the XY plane. Main disc topped by a hub boss, with a central bore and equally-spaced lightening holes through the disc.
 * Workflow ID : eval-T3_024-0d3396
 * Trace ID    : 4d43ca4e-b64e-4a80-b952-aa255a1b17f6
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 120.0 × 120.0 × 30.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 7 hole(s) of diameter 16mm center bore; 22mm x6 lightening holes mm (×7)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_024-0d3396/step/T3_024_outer0_attempt0.step
 *   STL    : artifact://eval-T3_024-0d3396/stl/T3_024_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Volume estimate breakdown: Main disc = π*(60^2)*20 ≈ 226,195 mm³; Hub boss = π*(20^2)*10 ≈ 12,566 mm³; Subtract center bore = π*(8^2)*30 ≈ 6,032 mm³; Subtract 6 lightening holes = 6*π*(11^2)*20 ≈ 45,617 mm³; Net ≈ 226,195 + 12,566 - 6,032 - 45,617 ≈ 187,112 mm³. Coder should use CadQuery or similar: (1) create main disc cylinder radius=60, height=20, centered at origin bottom at Z=0; (2) create hub boss cylinder radius=20, height=10, bottom at Z=20; (3) union disc and hub boss; (4) subtract center bore cylinder radius=8, height=30, Z=0 to Z=30; (5) subtract 6 lightening hole cylinders radius=11, height=20, Z=0 to Z=20, centers at (35*cos(theta), 35*sin(theta), 0) for theta in [0,60,120,180,240,300] degrees. All cylinders should be constructed with their axis along Z. Ensure the lightening holes do not intersect the hub boss (clearance check: hole edge at 35-11=24mm from center, hub boss radius=20mm — 4mm clearance, OK). Ensure lightening holes do not break through the disc outer edge (hole edge at 35+11=46mm < disc radius 60mm — OK).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Flywheel with six lightening holes and a raised hub boss
 * Main disc: 120mm dia x 20mm thick (Z=0 to Z=20)
 * Hub boss: 40mm dia x 10mm tall (Z=20 to Z=30)
 * Central bore: 16mm dia through full height
 * Six lightening holes: 22mm dia on 70mm PCD
 */

// Parameters
const discDiameter    = Param.number("Disc Diameter",    120, { min: 60,  max: 300, unit: "mm" });
const discThickness   = Param.number("Disc Thickness",    20, { min: 5,   max: 100, unit: "mm" });
const hubDiameter     = Param.number("Hub Diameter",      40, { min: 20,  max: 150, unit: "mm" });
const hubHeight       = Param.number("Hub Height",        10, { min: 2,   max: 80,  unit: "mm" });
const boreDiameter    = Param.number("Bore Diameter",     16, { min: 4,   max: 60,  unit: "mm" });
const holeDiameter    = Param.number("Hole Diameter",     22, { min: 4,   max: 50,  unit: "mm" });
const holePCD         = Param.number("Hole PCD",          70, { min: 20,  max: 200, unit: "mm" });

// Derived values
const discRadius  = discDiameter  / 2;
const hubRadius   = hubDiameter   / 2;
const boreRadius  = boreDiameter  / 2;
const holeRadius  = holeDiameter  / 2;
const holePCR     = holePCD       / 2;
const totalHeight = discThickness + hubHeight;

// Main disc cylinder: box-centered on XY, so shift up by half height to sit Z=0..discThickness
const disc = cylinder(discThickness, discRadius)
  .translate(0, 0, discThickness / 2);

// Hub boss cylinder: sits on top of disc, Z=discThickness to Z=totalHeight
const hub = cylinder(hubHeight, hubRadius)
  .translate(0, 0, discThickness + hubHeight / 2);

// Union disc and hub boss
const body = disc.union(hub);

// Central bore: passes through full height Z=0 to Z=totalHeight
const bore = cylinder(totalHeight, boreRadius)
  .translate(0, 0, totalHeight / 2);

// Subtract central bore
const bodyBored = body.subtract(bore);

// Six lightening holes at 0, 60, 120, 180, 240, 300 degrees on pitch circle
// Each hole passes through disc thickness only (Z=0 to Z=discThickness)
const holeDepth = discThickness;
const holeZCenter = discThickness / 2;

// Hole at 0 degrees (along +X axis)
const hole0 = cylinder(holeDepth, holeRadius)
  .translate(holePCR, 0, holeZCenter);

// Hole at 60 degrees
const cos60 = Math.cos(60 * Math.PI / 180);
const sin60 = Math.sin(60 * Math.PI / 180);
const hole1 = cylinder(holeDepth, holeRadius)
  .translate(holePCR * cos60, holePCR * sin60, holeZCenter);

// Hole at 120 degrees
const cos120 = Math.cos(120 * Math.PI / 180);
const sin120 = Math.sin(120 * Math.PI / 180);
const hole2 = cylinder(holeDepth, holeRadius)
  .translate(holePCR * cos120, holePCR * sin120, holeZCenter);

// Hole at 180 degrees
const hole3 = cylinder(holeDepth, holeRadius)
  .translate(-holePCR, 0, holeZCenter);

// Hole at 240 degrees
const cos240 = Math.cos(240 * Math.PI / 180);
const sin240 = Math.sin(240 * Math.PI / 180);
const hole4 = cylinder(holeDepth, holeRadius)
  .translate(holePCR * cos240, holePCR * sin240, holeZCenter);

// Hole at 300 degrees
const cos300 = Math.cos(300 * Math.PI / 180);
const sin300 = Math.sin(300 * Math.PI / 180);
const hole5 = cylinder(holeDepth, holeRadius)
  .translate(holePCR * cos300, holePCR * sin300, holeZCenter);

// Union all six lightening holes into one shape, then subtract once
const holesGroup = hole0.union(hole1).union(hole2).union(hole3).union(hole4).union(hole5);

// Subtract all lightening holes from the bored body
const finalShape = bodyBored.subtract(holesGroup).color("#7a9cbf");

return {
  "flywheel-with-six-lightening-holes-and-a": finalShape,
};
