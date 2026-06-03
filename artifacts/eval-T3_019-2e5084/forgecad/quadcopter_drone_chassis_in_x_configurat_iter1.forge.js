/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Quadcopter drone chassis in X configuration, flat on XY plane. Central hub disc with four diagonal arms at 45/135/225/315 degrees, each terminating in a circular motor mount platform with shaft hole. M3 mounting holes in hub.
 * Workflow ID : eval-T3_019-2e5084
 * Trace ID    : fb535c31-3afc-4c27-a1f2-1cec7b38e497
 * Iteration   : 1
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 164.0 × 164.0 × 3.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 8 hole(s) of diameter 5.0mm (motor shaft) and 3.2mm (M3 mounting) mm (×8)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_019-2e5084/step/T3_019_outer1_attempt0.step
 *   STL    : artifact://eval-T3_019-2e5084/stl/T3_019_outer1_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   1. All geometry lies in Z=0 to Z=3 (flat plate). 2. Arms start at hub edge (r=18mm) and end at r=73mm along each 45-deg diagonal. Each arm rectangle is 55mm x 10mm, aligned along its diagonal direction — use a rotated workplane or a rotated box primitive for each arm. 3. Motor mount circles (r=9mm) are centered exactly at (±73*cos(45°), ±73*sin(45°)) = (±51.619, ±51.619); verify the mount fully covers the arm tip (arm width 10mm < mount diameter 18mm, so mount overhangs arm slightly on sides — this is intentional). 4. Boolean union all solid bodies (hub + 4 arms + 4 mounts) before cutting holes to avoid face-on-face artifacts. 5. Motor shaft holes (5mm dia) and M3 holes (3.2mm dia) are through-holes in Z direction (full 3mm depth). 6. The overall bounding box diagonal tip-to-tip is 2 * 73mm * cos(45°) + 18mm = ~164mm square. 7. Volume estimate: hub ~3054mm³ + 4 arms ~(55*10*3=1650 each, minus hub overlap ~(18*10*3=540 each overlap area approx)) + 4 mounts ~(π*9²*3≈763 each) minus holes; approximate net solid ~9800mm³. Coder should use CadQuery or similar; union then subtract holes.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Quadcopter Drone Chassis - X Configuration
 * Flat on XY plane, Z=0 to Z=3mm
 */

// Parameters
const hubDiameter   = Param.number("Hub Diameter",   36,  { min: 20,  max: 80,  unit: "mm" });
const hubThickness  = Param.number("Hub Thickness",   3,  { min: 1,   max: 10,  unit: "mm" });
const armLength     = Param.number("Arm Length",     55,  { min: 20,  max: 120, unit: "mm" });
const armWidth      = Param.number("Arm Width",      10,  { min: 4,   max: 30,  unit: "mm" });
const mountDiameter = Param.number("Mount Diameter", 18,  { min: 10,  max: 40,  unit: "mm" });
const shaftHoleDia  = Param.number("Shaft Hole Dia",  5,  { min: 2,   max: 15,  unit: "mm" });
const m3HoleDia     = Param.number("M3 Hole Dia",   3.2,  { min: 1,   max: 6,   unit: "mm" });
const m3Spacing     = Param.number("M3 Spacing",     10,  { min: 5,   max: 25,  unit: "mm" });

// Derived values
const hubRadius    = hubDiameter / 2;       // 18mm
const mountRadius  = mountDiameter / 2;     // 9mm
const armStartR    = hubRadius;             // arm starts at hub edge
const armCenterR   = armStartR + armLength / 2; // center of arm along diagonal
const mountCenterR = armStartR + armLength; // 73mm from origin
const diagComp     = mountCenterR / Math.sqrt(2); // ~51.619mm

// Z center for geometry (box is centered in XY and starts at Z=0)
const zHalf = hubThickness / 2; // 1.5mm — geometry centered at z=1.5, shifted up by zHalf

// Central hub disc
const hub = cylinder(hubThickness, hubRadius)
    .translate(0, 0, zHalf);

// Arm box: 55mm long x 10mm wide x 3mm thick, centered at origin before rotation
// After rotation arm centerline lies along diagonal direction
// Arm center is at armCenterR along diagonal from origin
const armBox = box(armLength, armWidth, hubThickness)
    .translate(armCenterR, 0, zHalf);

// Four arms at 45, 135, 225, 315 degrees
const armNE = armBox.rotate([0, 0, 1],  45);
const armNW = armBox.rotate([0, 0, 1], 135);
const armSW = armBox.rotate([0, 0, 1], 225);
const armSE = armBox.rotate([0, 0, 1], 315);

// Motor mount discs at arm tips
const mountNE = cylinder(hubThickness, mountRadius)
    .translate( diagComp,  diagComp, zHalf);
const mountNW = cylinder(hubThickness, mountRadius)
    .translate(-diagComp,  diagComp, zHalf);
const mountSW = cylinder(hubThickness, mountRadius)
    .translate(-diagComp, -diagComp, zHalf);
const mountSE = cylinder(hubThickness, mountRadius)
    .translate( diagComp, -diagComp, zHalf);

// Union all solid bodies before cutting holes
const solid = hub
    .union(armNE)
    .union(armNW)
    .union(armSW)
    .union(armSE)
    .union(mountNE)
    .union(mountNW)
    .union(mountSW)
    .union(mountSE);

// Motor shaft holes (5mm dia, through full thickness)
const shaftR = shaftHoleDia / 2;
const shaftHole = cylinder(hubThickness + 0.2, shaftR);

const shaftNE = shaftHole.translate( diagComp,  diagComp, zHalf);
const shaftNW = shaftHole.translate(-diagComp,  diagComp, zHalf);
const shaftSW = shaftHole.translate(-diagComp, -diagComp, zHalf);
const shaftSE = shaftHole.translate( diagComp, -diagComp, zHalf);

// M3 mounting holes (3.2mm dia) in 20mm x 20mm square pattern at hub center
const m3R = m3HoleDia / 2;
const m3Hole = cylinder(hubThickness + 0.2, m3R);

const m3PP = m3Hole.translate( m3Spacing,  m3Spacing, zHalf);
const m3NP = m3Hole.translate(-m3Spacing,  m3Spacing, zHalf);
const m3NN = m3Hole.translate(-m3Spacing, -m3Spacing, zHalf);
const m3PN = m3Hole.translate( m3Spacing, -m3Spacing, zHalf);

// Subtract shaft holes
const afterShafts = solid
    .subtract(shaftNE)
    .subtract(shaftNW)
    .subtract(shaftSW)
    .subtract(shaftSE);

// Subtract M3 holes
const finalShape = afterShafts
    .subtract(m3PP)
    .subtract(m3NP)
    .subtract(m3NN)
    .subtract(m3PN)
    .color("#4a7fbf");

return {
    "quadcopter-drone-chassis-in-x-configurat": finalShape,
};
