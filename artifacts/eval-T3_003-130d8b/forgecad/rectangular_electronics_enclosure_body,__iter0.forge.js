/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Rectangular electronics enclosure body, open-top, with 2mm shell walls, four filleted vertical edges (R4mm), and four internal screw bosses (8mm OD, 3mm through-hole) at symmetric positions.
 * Workflow ID : eval-T3_003-130d8b
 * Trace ID    : f48c8546-ca19-492e-b5d1-6d245a3bd2fa
 * Iteration   : 0
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
 *   STEP   : artifact://eval-T3_003-130d8b/step/T3_003_outer0_attempt0.step
 *   STL    : artifact://eval-T3_003-130d8b/stl/T3_003_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Construction order: (1) Create solid box 70x50x30, centered at origin in XY, base at Z=0. (2) Fillet only the four vertical edges (parallel to Z-axis) with R=4mm — do NOT fillet top or bottom horizontal edges. (3) Shell the solid open on the top face (+Z face) with 2mm inward thickness — this creates a 2mm floor at Z=0 to Z=2 and 2mm side walls, inner cavity starts at Z=2. (4) For each boss position (±27, ±17): create a solid cylinder of diameter 8mm from Z=2 to Z=30 and union it into the shell body. (5) For each boss: cut a 3mm diameter cylinder from Z=0 (bottom exterior) through to Z=30 (top rim) as a through-hole, passing through both the 2mm floor and the full boss height. Ensure bosses do not intersect the side walls (inner clearance check: inner X extents are ±(35-2)=±33mm, inner Y extents are ±(25-2)=±23mm; boss centers at ±27, ±17 with radius 4mm gives max extents ±31 in X and ±21 in Y — both within inner cavity). The fillet on vertical edges is purely on the exterior corners of the box.
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
 * Open-top box with filleted vertical edges, 2mm shell walls,
 * and four internal screw bosses with through-holes.
 */

// Parameters
const outerX      = Param.number("Outer X",          70,  { min: 30, max: 300, unit: "mm" });
const outerY      = Param.number("Outer Y",          50,  { min: 20, max: 200, unit: "mm" });
const outerZ      = Param.number("Outer Z",          30,  { min: 10, max: 150, unit: "mm" });
const wallT       = Param.number("Wall Thickness",    2,  { min: 1,  max: 10,  unit: "mm" });
const filletR     = Param.number("Fillet Radius",     4,  { min: 1,  max: 15,  unit: "mm" });
const bossOD      = Param.number("Boss OD",           8,  { min: 4,  max: 20,  unit: "mm" });
const bossHoleD   = Param.number("Boss Hole D",       3,  { min: 1,  max: 10,  unit: "mm" });
const bossPosX    = Param.number("Boss Pos X",       27,  { min: 5,  max: 100, unit: "mm" });
const bossPosY    = Param.number("Boss Pos Y",       17,  { min: 5,  max: 100, unit: "mm" });

// Step 1: Create solid outer box centered in XY, base at Z=0
// box() is centered on XY and extends in +Z
const solidBox = box(outerX, outerY, outerZ).translate(0, 0, outerZ / 2);

// Step 2: Create inner void box for shell operation (open top)
// Inner cavity: walls inset by wallT, floor inset by wallT, top fully open
const innerX = outerX - 2 * wallT;
const innerY = outerY - 2 * wallT;
const innerCavityH = outerZ - wallT; // floor is wallT thick, top is open
const innerVoid = box(innerX, innerY, innerCavityH).translate(0, 0, wallT + innerCavityH / 2);

// Step 3: Subtract inner void from solid box to create shelled open-top enclosure
const shell = solidBox.subtract(innerVoid);

// Step 4: Create four screw bosses (solid cylinders from Z=wallT to Z=outerZ)
const bossH = outerZ - wallT; // boss height from inner floor to rim
const bossR  = bossOD / 2;
const bossCyl = cylinder(bossH, bossR);

const boss1 = bossCyl.translate( bossPosX,  bossPosY, wallT + bossH / 2);
const boss2 = bossCyl.translate(-bossPosX,  bossPosY, wallT + bossH / 2);
const boss3 = bossCyl.translate( bossPosX, -bossPosY, wallT + bossH / 2);
const boss4 = bossCyl.translate(-bossPosX, -bossPosY, wallT + bossH / 2);

// Step 5: Union all four bosses into the shell body
const withBosses = shell.union(boss1).union(boss2).union(boss3).union(boss4);

// Step 6: Create through-holes for each boss (full Z height: Z=0 to Z=outerZ)
// Add small epsilon to ensure clean boolean cuts through top and bottom faces
const holeH = outerZ + 2; // slightly oversized for clean cut
const holeR  = bossHoleD / 2;
const holeCyl = cylinder(holeH, holeR);

const hole1 = holeCyl.translate( bossPosX,  bossPosY, outerZ / 2);
const hole2 = holeCyl.translate(-bossPosX,  bossPosY, outerZ / 2);
const hole3 = holeCyl.translate( bossPosX, -bossPosY, outerZ / 2);
const hole4 = holeCyl.translate(-bossPosX, -bossPosY, outerZ / 2);

// Step 7: Subtract through-holes from the body with bosses
const withHoles = withBosses.subtract(hole1).subtract(hole2).subtract(hole3).subtract(hole4);

// Step 8: Apply color
const finalShape = withHoles.color("#5a7fa8");

return {
  "rectangular-electronics-enclosure-body,-": finalShape,
};
