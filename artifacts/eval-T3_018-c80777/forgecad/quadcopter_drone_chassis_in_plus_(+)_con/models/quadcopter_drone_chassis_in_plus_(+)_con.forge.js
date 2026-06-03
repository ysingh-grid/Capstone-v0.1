/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Quadcopter drone chassis in plus (+) configuration, flat on XY plane, with central hub, four arms along ±X and ±Y axes, circular motor mount platforms at arm tips with shaft holes, and M3 mounting holes in the central hub.
 * Workflow ID : eval-T3_018-c80777
 * Trace ID    : 6aea7810-f8dd-45a2-ad4c-b8c19e442196
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 138.0 × 138.0 × 3.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 8 hole(s) of diameter 5.0mm (motor shaft holes), 3.2mm (M3 mounting holes) mm (×8)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_018-c80777/step/T3_018_outer0_attempt0.step
 *   STL    : artifact://eval-T3_018-c80777/stl/T3_018_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   1. All geometry lies in Z=0 to Z=3mm (flat plate). 2. Arms are rectangular boxes from hub edge to motor mount: from ±15mm to ±60mm along the respective axis, centered on that axis with 10mm width in the perpendicular direction. 3. Motor mount disks (18mm diameter) are centered exactly at (±60, 0, 0) and (0, ±60, 0); they overlap slightly with the arm tips — use union/boolean to merge. 4. Motor shaft holes (5mm diameter) are full through-holes (Z=0 to Z=3) centered at each motor mount center. 5. M3 holes (3.2mm diameter) are full through-holes at (±10, ±10, 0) through the hub. 6. Build the solid as union of hub + 4 arms + 4 motor mount disks, then subtract all 8 holes. 7. Estimate volume breakdown: hub ~2700mm³, 4 arms ~4×(45×10×3)=5400mm³, 4 motor mounts ~4×(π×9²×3)≈3054mm³, minus overlaps and holes, net ~10500–12000mm³.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Quadcopter drone chassis in plus (+) configuration
 * Flat on XY plane, Z=0 to Z=3mm
 */

// Parameters
const hubSize       = Param.number("Hub Size",        30,  { min: 10,  max: 100, unit: "mm" });
const hubThickness  = Param.number("Hub Thickness",    3,   { min: 1,   max: 10,  unit: "mm" });
const armLength     = Param.number("Arm Length",       45,  { min: 10,  max: 150, unit: "mm" });
const armWidth      = Param.number("Arm Width",        10,  { min: 3,   max: 30,  unit: "mm" });
const armThickness  = Param.number("Arm Thickness",    3,   { min: 1,   max: 10,  unit: "mm" });
const mountDiam     = Param.number("Mount Diameter",   18,  { min: 6,   max: 50,  unit: "mm" });
const mountThick    = Param.number("Mount Thickness",  3,   { min: 1,   max: 10,  unit: "mm" });
const shaftHoleDiam = Param.number("Shaft Hole Dia",   5,   { min: 1,   max: 15,  unit: "mm" });
const m3HoleDiam    = Param.number("M3 Hole Dia",      3.2, { min: 1,   max: 8,   unit: "mm" });
const m3Offset      = Param.number("M3 Hole Offset",   10,  { min: 3,   max: 25,  unit: "mm" });
const armStart      = Param.number("Arm Start",        15,  { min: 5,   max: 50,  unit: "mm" });
const mountDist     = Param.number("Mount Distance",   60,  { min: 20,  max: 200, unit: "mm" });

// Hub half-thickness for Z centering (geometry is at Z=0..thickness, centered at Z=thickness/2)
const zCenter = hubThickness / 2;

// Central hub plate: 30x30x3mm, box is centered on XY, extends +Z
const hub = box(hubSize, hubSize, hubThickness)
    .translate(0, 0, zCenter);

// Arm +X: from armStart to mountDist along X, width armWidth in Y
const armPXLen = armLength; // 45mm
const armPX = box(armPXLen, armWidth, armThickness)
    .translate(armStart + armPXLen / 2, 0, zCenter);

// Arm -X: mirror of +X
const armNX = box(armPXLen, armWidth, armThickness)
    .translate(-(armStart + armPXLen / 2), 0, zCenter);

// Arm +Y: from armStart to mountDist along Y, width armWidth in X
const armPY = box(armWidth, armPXLen, armThickness)
    .translate(0, armStart + armPXLen / 2, zCenter);

// Arm -Y
const armNY = box(armWidth, armPXLen, armThickness)
    .translate(0, -(armStart + armPXLen / 2), zCenter);

// Motor mount platforms: 18mm diameter disk, 3mm thick
const mountRadius = mountDiam / 2;

const mountPX = cylinder(mountThick, mountRadius)
    .translate(mountDist, 0, zCenter);

const mountNX = cylinder(mountThick, mountRadius)
    .translate(-mountDist, 0, zCenter);

const mountPY = cylinder(mountThick, mountRadius)
    .translate(0, mountDist, zCenter);

const mountNY = cylinder(mountThick, mountRadius)
    .translate(0, -mountDist, zCenter);

// Union all solid parts together
const solid = hub
    .union(armPX)
    .union(armNX)
    .union(armPY)
    .union(armNY)
    .union(mountPX)
    .union(mountNX)
    .union(mountPY)
    .union(mountNY);

// Motor shaft holes: 5mm diameter through-holes at each motor mount center
const shaftR = shaftHoleDiam / 2;
const holeDepth = hubThickness + 2; // slightly taller to ensure clean cut

const holePX = cylinder(holeDepth, shaftR)
    .translate(mountDist, 0, zCenter);

const holeNX = cylinder(holeDepth, shaftR)
    .translate(-mountDist, 0, zCenter);

const holePY = cylinder(holeDepth, shaftR)
    .translate(0, mountDist, zCenter);

const holeNY = cylinder(holeDepth, shaftR)
    .translate(0, -mountDist, zCenter);

// M3 mounting holes: 3.2mm diameter through-holes in hub at (±10, ±10)
const m3R = m3HoleDiam / 2;

const m3PP = cylinder(holeDepth, m3R)
    .translate( m3Offset,  m3Offset, zCenter);

const m3PN = cylinder(holeDepth, m3R)
    .translate( m3Offset, -m3Offset, zCenter);

const m3NP = cylinder(holeDepth, m3R)
    .translate(-m3Offset,  m3Offset, zCenter);

const m3NN = cylinder(holeDepth, m3R)
    .translate(-m3Offset, -m3Offset, zCenter);

// Subtract all holes from solid
const withShaftHoles = solid
    .subtract(holePX)
    .subtract(holeNX)
    .subtract(holePY)
    .subtract(holeNY);

const finalShape = withShaftHoles
    .subtract(m3PP)
    .subtract(m3PN)
    .subtract(m3NP)
    .subtract(m3NN)
    .color("#3a7bd5");

return {
    "quadcopter-drone-chassis-in-plus-(+)-con": finalShape,
};
