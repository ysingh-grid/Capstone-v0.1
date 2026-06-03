/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Flanged pipe section standing upright along Z axis, centered at origin in XY, with bottom and top flanges, central bore, and four bolt holes per flange
 * Workflow ID : eval-T3_005-c0a105
 * Trace ID    : 18f84182-a0a5-4c82-99ca-b570d189615e
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 50.0 × 50.0 × 50.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 9 hole(s) of diameter 20mm bore + 6mm bolt holes (x8 total, 4 per flange) mm (×9)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_005-c0a105/step/T3_005_outer0_attempt0.step
 *   STL    : artifact://eval-T3_005-c0a105/stl/T3_005_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Build solid by unioning three cylinders first (bottom flange, pipe wall, top flange), then subtract central bore cylinder (D=20mm, full Z height). For bolt holes: use pushPoints with four XY offsets at radius=20mm on 0/90/180/270 degree positions, drill D=6mm cylinders through bottom flange (Z=0 to Z=5) and separately through top flange (Z=45 to Z=50). Ensure all cylinders are centered on Z axis. The bore cut must pass completely through (add small epsilon overcut on Z if needed). CadQuery implementation should use Workplane('XY') at appropriate Z offsets for each feature.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Flanged Pipe Section
 * Standing upright along Z axis, centered at origin in XY.
 * Bottom flange (Z=0..5), pipe wall (Z=0..50), top flange (Z=45..50),
 * central bore (D=20mm), four bolt holes per flange on D=40mm bolt circle.
 */

// Parameters
const overallHeight    = Param.number("Overall Height",       50, { min: 20,  max: 300, unit: "mm" });
const flangeOD         = Param.number("Flange OD",            50, { min: 20,  max: 200, unit: "mm" });
const flangeThickness  = Param.number("Flange Thickness",      5, { min: 2,   max: 30,  unit: "mm" });
const pipeOD           = Param.number("Pipe OD",              30, { min: 10,  max: 150, unit: "mm" });
const boreD            = Param.number("Bore Diameter",        20, { min: 4,   max: 120, unit: "mm" });
const boltCircleD      = Param.number("Bolt Circle Diameter", 40, { min: 15,  max: 180, unit: "mm" });
const boltHoleD        = Param.number("Bolt Hole Diameter",    6, { min: 2,   max: 20,  unit: "mm" });

// Derived values
const flangeR     = flangeOD / 2;
const pipeR       = pipeOD / 2;
const boreR       = boreD / 2;
const boltR       = boltCircleD / 2;
const boltHoleR   = boltHoleD / 2;

// Bottom flange disc: centered at Z = flangeThickness/2
const bottomFlange = cylinder(flangeThickness, flangeR)
    .translate(0, 0, flangeThickness / 2);

// Pipe wall cylinder: full height, centered at Z = overallHeight/2
const pipeWall = cylinder(overallHeight, pipeR)
    .translate(0, 0, overallHeight / 2);

// Top flange disc: sits at Z = overallHeight - flangeThickness to Z = overallHeight
const topFlange = cylinder(flangeThickness, flangeR)
    .translate(0, 0, overallHeight - flangeThickness / 2);

// Union the three solid bodies
const solidBody = bottomFlange.union(pipeWall).union(topFlange);

// Central bore: full height with small epsilon overcut on each end
const eps = 0.1;
const bore = cylinder(overallHeight + 2 * eps, boreR)
    .translate(0, 0, overallHeight / 2);

// Subtract bore from solid
const bodyBored = solidBody.subtract(bore);

// Bolt hole positions at 0, 90, 180, 270 degrees on bolt circle
const bh0x  =  boltR;  const bh0y  =  0;
const bh90x =  0;      const bh90y =  boltR;
const bh180x = -boltR; const bh180y = 0;
const bh270x = 0;      const bh270y = -boltR;

// Bolt holes through bottom flange (Z=0 to Z=flangeThickness, with epsilon overcut)
const bhBot0   = cylinder(flangeThickness + 2 * eps, boltHoleR).translate(bh0x,   bh0y,   flangeThickness / 2);
const bhBot90  = cylinder(flangeThickness + 2 * eps, boltHoleR).translate(bh90x,  bh90y,  flangeThickness / 2);
const bhBot180 = cylinder(flangeThickness + 2 * eps, boltHoleR).translate(bh180x, bh180y, flangeThickness / 2);
const bhBot270 = cylinder(flangeThickness + 2 * eps, boltHoleR).translate(bh270x, bh270y, flangeThickness / 2);

// Subtract bottom flange bolt holes
const bodyBh1 = bodyBored.subtract(bhBot0);
const bodyBh2 = bodyBh1.subtract(bhBot90);
const bodyBh3 = bodyBh2.subtract(bhBot180);
const bodyBh4 = bodyBh3.subtract(bhBot270);

// Top flange Z center
const topFlangeZ = overallHeight - flangeThickness / 2;

// Bolt holes through top flange
const bhTop0   = cylinder(flangeThickness + 2 * eps, boltHoleR).translate(bh0x,   bh0y,   topFlangeZ);
const bhTop90  = cylinder(flangeThickness + 2 * eps, boltHoleR).translate(bh90x,  bh90y,  topFlangeZ);
const bhTop180 = cylinder(flangeThickness + 2 * eps, boltHoleR).translate(bh180x, bh180y, topFlangeZ);
const bhTop270 = cylinder(flangeThickness + 2 * eps, boltHoleR).translate(bh270x, bh270y, topFlangeZ);

// Subtract top flange bolt holes
const bodyBh5 = bodyBh4.subtract(bhTop0);
const bodyBh6 = bodyBh5.subtract(bhTop90);
const bodyBh7 = bodyBh6.subtract(bhTop180);
const finalShape = bodyBh7.subtract(bhTop270);

// Apply appearance color
const coloredShape = finalShape.color("#5f87c6");

return {
    "flanged-pipe-section-standing-upright-al": coloredShape,
};
