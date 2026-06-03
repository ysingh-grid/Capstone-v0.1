/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Quadcopter drone chassis in H-frame configuration, lying flat on XY plane. Comprises two parallel longitudinal side rails, a central bridging plate, four circular motor mount platforms at rail ends, with motor shaft holes and M3 mounting holes drilled through.
 * Workflow ID : eval-T3_020-a185fb
 * Trace ID    : e7f07fc3-4743-4497-a674-43e8110a56a4
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 160.0 × 72.0 × 3.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 8 hole(s) of diameter 5.0mm (motor shaft x4), 3.2mm (M3 x4) mm (×8)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_020-a185fb/step/T3_020_outer0_attempt0.step
 *   STL    : artifact://eval-T3_020-a185fb/stl/T3_020_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   1. All geometry is flat: Z ranges from 0 to 3mm throughout — rails, center plate, and motor mounts are all the same thickness. 2. The center plate (50x72mm) overlaps and merges with both rails in the central region; use boolean union to avoid double-counting volume. 3. Motor mounts are circular discs (cylinder, r=11mm, h=3mm) centered at (±80, ±30, 1.5mm); they overlap with the rail ends and should be unioned. 4. Motor shaft holes (5mm dia) are centered at (±80, ±30) and drilled fully through Z (0 to 3mm). 5. M3 holes (3.2mm dia) are centered at (±10, ±10) and drilled fully through Z (0 to 3mm) in the center plate. 6. Volume estimate accounts for boolean union of overlapping rail/plate/mount regions minus all 8 drilled holes. Approximate breakdown: left rail ~5760mm³, right rail ~5760mm³, center plate unique area ~(50*72 - overlap)*3 ≈ 2592mm³, motor mounts unique area ~4*(pi*11²*3 - overlap) ≈ 2280mm³, minus holes ~8*(pi*(hole_r²)*3). Final net estimate ~11214mm³. 7. Build using CadQuery: create each solid as a box or cylinder, union all, then subtract hole cylinders.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Quadcopter Drone Chassis - H-Frame Configuration
 * Flat on XY plane, Z: 0 to 3mm
 */

// Parameters
const railLength    = Param.number("Rail Length",        160,  { min: 80,  max: 400, unit: "mm" });
const railWidth     = Param.number("Rail Width",          12,  { min: 6,   max: 40,  unit: "mm" });
const railThickness = Param.number("Rail Thickness",       3,  { min: 1,   max: 10,  unit: "mm" });
const railOffsetY   = Param.number("Rail Y Offset",       30,  { min: 10,  max: 100, unit: "mm" });
const plateLength   = Param.number("Plate Length X",      50,  { min: 20,  max: 200, unit: "mm" });
const plateWidth    = Param.number("Plate Width Y",       72,  { min: 20,  max: 200, unit: "mm" });
const mountDia      = Param.number("Mount Diameter",      22,  { min: 10,  max: 60,  unit: "mm" });
const mountOffsetX  = Param.number("Mount Offset X",      80,  { min: 20,  max: 200, unit: "mm" });
const shaftHoleDia  = Param.number("Shaft Hole Dia",       5,  { min: 2,   max: 20,  unit: "mm" });
const m3Dia         = Param.number("M3 Hole Dia",        3.2,  { min: 1,   max: 10,  unit: "mm" });
const m3Offset      = Param.number("M3 Hole Offset",      10,  { min: 2,   max: 40,  unit: "mm" });

const halfZ = railThickness / 2;

// Left side rail centered at Y=-railOffsetY
const leftRail = box(railLength, railWidth, railThickness)
    .translate(0, -railOffsetY, halfZ);

// Right side rail centered at Y=+railOffsetY
const rightRail = box(railLength, railWidth, railThickness)
    .translate(0, railOffsetY, halfZ);

// Center plate bridging both rails, centered at origin
const centerPlate = box(plateLength, plateWidth, railThickness)
    .translate(0, 0, halfZ);

// Motor mount cylinders at four corners
const mountRadius = mountDia / 2;
const mountFR = cylinder(railThickness, mountRadius)
    .translate( mountOffsetX,  railOffsetY, halfZ);
const mountFL = cylinder(railThickness, mountRadius)
    .translate( mountOffsetX, -railOffsetY, halfZ);
const mountRR = cylinder(railThickness, mountRadius)
    .translate(-mountOffsetX,  railOffsetY, halfZ);
const mountRL = cylinder(railThickness, mountRadius)
    .translate(-mountOffsetX, -railOffsetY, halfZ);

// Union all solid geometry
const frameBase = leftRail
    .union(rightRail)
    .union(centerPlate)
    .union(mountFR)
    .union(mountFL)
    .union(mountRR)
    .union(mountRL);

// Motor shaft holes through each mount (5mm dia, full Z depth)
const shaftRadius = shaftHoleDia / 2;
const holeFR = cylinder(railThickness, shaftRadius).translate( mountOffsetX,  railOffsetY, halfZ);
const holeFL = cylinder(railThickness, shaftRadius).translate( mountOffsetX, -railOffsetY, halfZ);
const holeRR = cylinder(railThickness, shaftRadius).translate(-mountOffsetX,  railOffsetY, halfZ);
const holeRL = cylinder(railThickness, shaftRadius).translate(-mountOffsetX, -railOffsetY, halfZ);

// Subtract motor shaft holes
const frameWithShaftHoles = frameBase
    .subtract(holeFR)
    .subtract(holeFL)
    .subtract(holeRR)
    .subtract(holeRL);

// M3 mounting holes through center plate
const m3Radius = m3Dia / 2;
const m3HolePP = cylinder(railThickness, m3Radius).translate( m3Offset,  m3Offset, halfZ);
const m3HolePN = cylinder(railThickness, m3Radius).translate( m3Offset, -m3Offset, halfZ);
const m3HoleNP = cylinder(railThickness, m3Radius).translate(-m3Offset,  m3Offset, halfZ);
const m3HoleNN = cylinder(railThickness, m3Radius).translate(-m3Offset, -m3Offset, halfZ);

// Subtract M3 holes from center plate region
const finalShape = frameWithShaftHoles
    .subtract(m3HolePP)
    .subtract(m3HolePN)
    .subtract(m3HoleNP)
    .subtract(m3HoleNN)
    .color("#4a90d9");

return {
    "quadcopter-drone-chassis-in-h-frame-conf": finalShape,
};
