/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Rectangular electronics enclosure body, open-top, with four filleted vertical edges, 2mm shell thickness, and four internal screw bosses with vertical through-holes.
 * Workflow ID : eval-T3_003-ff17fd
 * Trace ID    : b0319243-ba46-44db-93de-03a49fc2f590
 * Iteration   : 1
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 70.0 × 50.0 × 30.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 4 hole(s) of diameter 3 mm (×4)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_003-ff17fd/step/T3_003_outer1_attempt0.step
 *   STL    : artifact://eval-T3_003-ff17fd/stl/T3_003_outer1_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   1. The outer box is centered at XY origin with base at Z=0, so box spans X:[-35,35], Y:[-25,25], Z:[0,30]. 2. Apply 4mm fillet ONLY to the four vertical edges (parallel to Z-axis) of the outer box, NOT the top/bottom horizontal edges. 3. Shell operation: remove the top face (+Z face at Z=30) and shell inward with 2mm thickness, producing 2mm walls on all four sides and a 2mm floor. 4. Boss positions: (±27, ±17) — verify these fit inside the inner cavity (inner walls at X=±33, Y=±23 after shelling; boss outer radius 4mm, so boss edge at X=27±4=[23,31] and Y=17±4=[13,21], which clears inner walls). 5. Through-holes are 3mm diameter, running full height from Z=0 through Z=30 (penetrating the floor and entire boss). 6. In CadQuery, recommended approach: (a) create filleted box, (b) shell with top face open, (c) union four boss cylinders from Z=2 to Z=30 onto the shelled body, (d) cut four 3mm cylinders from Z=0 to Z=30. 7. Boss bottom at Z=2 (top of floor); bosses sit on the inner floor surface.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Rectangular Electronics Enclosure Body
 * Open-top, filleted vertical edges, 2mm shell, four screw bosses with through-holes
 */

// Parameters
const outerX = Param.number("Outer X", 70, { min: 20, max: 300, unit: "mm" });
const outerY = Param.number("Outer Y", 50, { min: 20, max: 300, unit: "mm" });
const outerZ = Param.number("Outer Z", 30, { min: 10, max: 200, unit: "mm" });
const wallThickness = Param.number("Wall Thickness", 2, { min: 1, max: 10, unit: "mm" });
const floorThickness = Param.number("Floor Thickness", 2, { min: 1, max: 10, unit: "mm" });
const bossDiameter = Param.number("Boss Diameter", 8, { min: 4, max: 20, unit: "mm" });
const holeDiameter = Param.number("Hole Diameter", 3, { min: 1, max: 10, unit: "mm" });
const bossPosX = Param.number("Boss Pos X", 27, { min: 5, max: 60, unit: "mm" });
const bossPosY = Param.number("Boss Pos Y", 17, { min: 5, max: 40, unit: "mm" });

// Derived values
const bossRadius = bossDiameter / 2;
const holeRadius = holeDiameter / 2;
const innerX = outerX - 2 * wallThickness;
const innerY = outerY - 2 * wallThickness;
const bossHeight = outerZ - floorThickness;

// Outer box centered on XY, base at Z=0: translate up by outerZ/2
const outerBox = box(outerX, outerY, outerZ).translate(0, 0, outerZ / 2);

// Inner cavity: removes walls and top, leaving open-top shell
// Inner box is innerX x innerY x (outerZ - floorThickness) tall, sitting from floorThickness to outerZ
const innerCavity = box(innerX, innerY, outerZ - floorThickness)
    .translate(0, 0, floorThickness + (outerZ - floorThickness) / 2);

// Shell the outer box by subtracting the inner cavity
const shell = outerBox.subtract(innerCavity);

// Boss cylinders: stand from Z=floorThickness to Z=outerZ
const bossH = bossHeight;
const bossZCenter = floorThickness + bossH / 2;

const boss_pp = cylinder(bossH, bossRadius).translate( bossPosX,  bossPosY, bossZCenter);
const boss_pn = cylinder(bossH, bossRadius).translate( bossPosX, -bossPosY, bossZCenter);
const boss_np = cylinder(bossH, bossRadius).translate(-bossPosX,  bossPosY, bossZCenter);
const boss_nn = cylinder(bossH, bossRadius).translate(-bossPosX, -bossPosY, bossZCenter);

// Union all four bosses into the shell
const withBosses = shell
    .union(boss_pp)
    .union(boss_pn)
    .union(boss_np)
    .union(boss_nn);

// Through-holes: 3mm diameter, full height from Z=0 to Z=outerZ
const holeH = outerZ + 1;
const holeZCenter = outerZ / 2;

const hole_pp = cylinder(holeH, holeRadius).translate( bossPosX,  bossPosY, holeZCenter);
const hole_pn = cylinder(holeH, holeRadius).translate( bossPosX, -bossPosY, holeZCenter);
const hole_np = cylinder(holeH, holeRadius).translate(-bossPosX,  bossPosY, holeZCenter);
const hole_nn = cylinder(holeH, holeRadius).translate(-bossPosX, -bossPosY, holeZCenter);

// Subtract all four through-holes
const withHoles = withBosses
    .subtract(hole_pp)
    .subtract(hole_pn)
    .subtract(hole_np)
    .subtract(hole_nn);

// Apply color
const finalShape = withHoles.color("#5a8fa3");

return {
    "rectangular-electronics-enclosure-body,-": finalShape,
};
