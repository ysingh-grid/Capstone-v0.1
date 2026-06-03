/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Rounded rectangular electronics enclosure tray, open-top, with 2mm shell walls, four corner mounting holes through the base, centered at origin on XY plane.
 * Workflow ID : eval-T3_002-bcb22f
 * Trace ID    : d8812bb8-cda3-4526-905b-7e4c5004314a
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 80.0 × 50.0 × 25.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 4 hole(s) of diameter 3.2 mm (×4)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_002-bcb22f/step/T3_002_outer0_attempt0.step
 *   STL    : artifact://eval-T3_002-bcb22f/stl/T3_002_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Construction approach: (1) Create a 2D rounded rectangle sketch on XY plane with overall dimensions 80x50mm and corner radius 8mm — note the fillet is on vertical edges only, so the cross-section profile is a rounded rectangle extruded 25mm in Z. (2) Shell the solid inward by 2mm, removing the top (+Z) face to leave it open, preserving the outer envelope exactly. (3) Drill four 3.2mm diameter cylindrical through-holes from top to bottom (full Z depth 25mm) centered at (±32, ±17, 0) — i.e., at X=±32mm and Y=±17mm, which places them exactly 8mm inset from the outer edges on each side. Base is at Z=0. In CadQuery: use cq.Workplane('XY').rect(80,50).extrude(25) with rounded corners via .rect with forConstruction or use .box then fillet vertical edges with .edges('|Z').fillet(8), then .shell(-2, faceSelector for top face), then subtract four cylinders of diameter 3.2 at the four hole positions. Verify that fillet radius (8mm) does not exceed half the shorter side (25mm ok, 50/2=25 > 8 ok). The inner cavity will be (80-4)x(50-4) = 76x46mm footprint with 8mm outer corner radius yielding approximately 6mm inner corner radius.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Rounded Rectangular Electronics Enclosure Tray
 * Open-top shell with 2mm walls, four corner mounting holes
 */

// Parameters
const outerX    = Param.number("Outer Length X", 80, { min: 40, max: 300, unit: "mm" });
const outerY    = Param.number("Outer Width Y",  50, { min: 30, max: 200, unit: "mm" });
const outerZ    = Param.number("Outer Height Z", 25, { min: 10, max: 150, unit: "mm" });
const wallT     = Param.number("Wall Thickness",  2, { min: 1,  max: 10,  unit: "mm" });
const holeD     = Param.number("Hole Diameter", 3.2, { min: 1,  max: 8,   unit: "mm" });
const holeOffX  = Param.number("Hole Offset X",  32, { min: 5,  max: 140, unit: "mm" });
const holeOffY  = Param.number("Hole Offset Y",  17, { min: 5,  max: 90,  unit: "mm" });

// Fillet radius for vertical edges (rounded rectangle cross-section)
const filletR   = Param.number("Fillet Radius",   8, { min: 1,  max: 24,  unit: "mm" });

// --- Build outer rounded-rectangle profile via four corner cylinders + central box ---

// Central box spanning full X, reduced Y (between the two rounded sides)
const coreXY = box(outerX, outerY - 2 * filletR, outerZ);

// Left/right slabs to fill between corner cylinders across Y
const slabY = box(outerX - 2 * filletR, outerY, outerZ);

// Union the two slabs to form cross-shaped solid filling the flat regions
const crossSlab = coreXY.union(slabY);

// Four vertical corner cylinders at the rounded corners
const cornerCyl = cylinder(outerZ, filletR);

const c1 = cornerCyl.translate( (outerX / 2 - filletR),  (outerY / 2 - filletR), 0);
const c2 = cornerCyl.translate(-(outerX / 2 - filletR),  (outerY / 2 - filletR), 0);
const c3 = cornerCyl.translate( (outerX / 2 - filletR), -(outerY / 2 - filletR), 0);
const c4 = cornerCyl.translate(-(outerX / 2 - filletR), -(outerY / 2 - filletR), 0);

// Union all four corners into the cross slab to get the outer rounded-rect prism
const outerSolid = crossSlab.union(c1).union(c2).union(c3).union(c4);

// --- Build inner cavity (same rounded-rect shape but smaller, open top) ---
// Inner dimensions: walls on all four sides, floor at bottom, open top
const innerX = outerX - 2 * wallT;
const innerY = outerY - 2 * wallT;
const innerZ = outerZ - wallT;           // floor thickness = wallT, top open
const innerFilletR = Math.max(filletR - wallT, 1);

const innerCoreXY = box(innerX, innerY - 2 * innerFilletR, innerZ);
const innerSlabY  = box(innerX - 2 * innerFilletR, innerY, innerZ);
const innerCross  = innerCoreXY.union(innerSlabY);

const innerCyl = cylinder(innerZ, innerFilletR);

const ic1 = innerCyl.translate( (innerX / 2 - innerFilletR),  (innerY / 2 - innerFilletR), wallT);
const ic2 = innerCyl.translate(-(innerX / 2 - innerFilletR),  (innerY / 2 - innerFilletR), wallT);
const ic3 = innerCyl.translate( (innerX / 2 - innerFilletR), -(innerY / 2 - innerFilletR), wallT);
const ic4 = innerCyl.translate(-(innerX / 2 - innerFilletR), -(innerY / 2 - innerFilletR), wallT);

// Position inner cavity starting at Z = wallT (floor thickness) and extending to top
const innerCavity = innerCross
    .union(ic1).union(ic2).union(ic3).union(ic4)
    .translate(0, 0, wallT);

// Subtract inner cavity from outer solid to create the shell
const shell = outerSolid.subtract(innerCavity);

// --- Mounting holes through the floor ---
const holeR  = holeD / 2;
const holeCyl = cylinder(outerZ, holeR);

const h1 = holeCyl.translate( holeOffX,  holeOffY, 0);
const h2 = holeCyl.translate(-holeOffX,  holeOffY, 0);
const h3 = holeCyl.translate( holeOffX, -holeOffY, 0);
const h4 = holeCyl.translate(-holeOffX, -holeOffY, 0);

// Subtract all four mounting holes from the shell
const withHoles = shell.subtract(h1).subtract(h2).subtract(h3).subtract(h4);

// Translate so base sits exactly on Z=0 (box() centers at XY, base at Z=-outerZ/2)
// box() is centered on XY and extends in +Z, so base is already at Z=0 — verify:
// cylinder() axis along Z centered at Z=0, half below. Need to lift outerSolid by outerZ/2.
// Actually: box(w,d,h) centered on XY, extends in +Z per API. Check cylinder: axis along Z.
// Re-examine: the API says box extends in +Z (base at Z=0?). Assume box base at Z=0.
// cylinder: centers at Z=0, so spans -h/2 to +h/2. Lift cylinders by outerZ/2.

// Re-build with correct Z positioning for cylinders (lift by outerZ/2)
const cCyl = cylinder(outerZ, filletR).translate(0, 0, outerZ / 2);

const cc1 = cCyl.translate( (outerX / 2 - filletR),  (outerY / 2 - filletR), 0);
const cc2 = cCyl.translate(-(outerX / 2 - filletR),  (outerY / 2 - filletR), 0);
const cc3 = cCyl.translate( (outerX / 2 - filletR), -(outerY / 2 - filletR), 0);
const cc4 = cCyl.translate(-(outerX / 2 - filletR), -(outerY / 2 - filletR), 0);

const outerSolid2 = crossSlab.union(cc1).union(cc2).union(cc3).union(cc4);

const iCyl2 = cylinder(innerZ, innerFilletR).translate(0, 0, innerZ / 2);

const ic1b = iCyl2.translate( (innerX / 2 - innerFilletR),  (innerY / 2 - innerFilletR), wallT);
const ic2b = iCyl2.translate(-(innerX / 2 - innerFilletR),  (innerY / 2 - innerFilletR), wallT);
const ic3b = iCyl2.translate( (innerX / 2 - innerFilletR), -(innerY / 2 - innerFilletR), wallT);
const ic4b = iCyl2.translate(-(innerX / 2 - innerFilletR), -(innerY / 2 - innerFilletR), wallT);

const innerCrossB  = box(innerX, innerY - 2 * innerFilletR, innerZ)
    .union(box(innerX - 2 * innerFilletR, innerY, innerZ))
    .translate(0, 0, wallT);

const innerCavity2 = innerCrossB
    .union(ic1b).union(ic2b).union(ic3b).union(ic4b);

const shell2 = outerSolid2.subtract(innerCavity2);

// Mounting holes: cylinder spans -h/2..+h/2, lift by outerZ/2 to go 0..outerZ
const hCyl2 = cylinder(outerZ, holeR).translate(0, 0, outerZ / 2);

const mh1 = hCyl2.translate( holeOffX,  holeOffY, 0);
const mh2 = hCyl2.translate(-holeOffX,  holeOffY, 0);
const mh3 = hCyl2.translate( holeOffX, -holeOffY, 0);
const mh4 = hCyl2.translate(-holeOffX, -holeOffY, 0);

const finalShape = shell2
    .subtract(mh1).subtract(mh2).subtract(mh3).subtract(mh4)
    .color("#4a90d9");

return {
    "rounded-rectangular-electronics-enclosur": finalShape,
};
