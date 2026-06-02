/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Rounded rectangular electronics enclosure tray, open on top, with 2mm walls, shelled interior, and four mounting holes through the bottom
 * Workflow ID : eval-T3_002-1e329e
 * Trace ID    : 19fc2442-98df-47b3-b33d-b4c830866f37
 * Iteration   : 1
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
 *   STEP   : artifact://eval-T3_002-1e329e/step/T3_002_outer1_attempt0.step
 *   STL    : artifact://eval-T3_002-1e329e/stl/T3_002_outer1_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Construction strategy: (1) Create a 2D rounded-rectangle profile in XY centered at origin using a rectangle with 8mm corner fillets (fillets on vertical edges only — i.e., in the XY cross-section). Extrude from Z=0 to Z=25 to form the solid outer body. (2) Shell the solid by removing the top face (+Z=25) and shelling inward 2mm to produce a hollow tray; alternatively, subtract an inner rounded-rectangle prism (76x46mm, same fillet logic scaled inward, height 23mm) starting at Z=2 up through Z=25 to simulate the shell. (3) The inner cavity fillet radius should be reduced to 6mm (8mm outer minus 2mm wall) to maintain uniform wall thickness at corners. (4) Drill four 3.2mm diameter cylindrical holes through the bottom face (Z=0 to Z=2) at positions (+32, +17, 0), (+32, -17, 0), (-32, +17, 0), (-32, -17, 0) — these are 8mm inset from the 80mm and 50mm outer edges respectively. Holes should be full through-holes penetrating the 2mm floor. (5) Part origin is at XY center, base at Z=0. (6) Use CadQuery or similar: create outer solid with .rect(80,50).fillet(8) profile extruded 25mm, then subtract inner void.
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
 * Open on top, 2mm walls, 8mm vertical edge fillets, 4 mounting holes
 */

// Parameters
const outerX      = Param.number("Outer X",          80,  { min: 20,  max: 300, unit: "mm" });
const outerY      = Param.number("Outer Y",          50,  { min: 20,  max: 300, unit: "mm" });
const outerZ      = Param.number("Outer Z",          25,  { min: 5,   max: 200, unit: "mm" });
const filletR     = Param.number("Fillet Radius",     8,  { min: 1,   max: 40,  unit: "mm" });
const wallT       = Param.number("Wall Thickness",    2,  { min: 1,   max: 10,  unit: "mm" });
const holeDia     = Param.number("Hole Diameter",     3.2,{ min: 1,   max: 10,  unit: "mm" });
const holePatX    = Param.number("Hole Pattern X",   64,  { min: 10,  max: 280, unit: "mm" });
const holePatY    = Param.number("Hole Pattern Y",   34,  { min: 10,  max: 280, unit: "mm" });

// Derived dimensions
const innerX      = outerX - 2 * wallT;   // 76mm
const innerY      = outerY - 2 * wallT;   // 46mm
const innerZ      = outerZ - wallT;        // 23mm  (open top, floor = wallT)
const innerFilletR = filletR - wallT;      // 6mm inner corner fillet
const holeR       = holeDia / 2;
const holeHalfX   = holePatX / 2;         // ±32mm
const holeHalfY   = holePatY / 2;         // ±17mm

// ── Step 1: Outer rounded-rectangle body ──────────────────────────────────
// Build rounded-rectangle via large box minus four corner rods, then add four
// corner cylinders — approximated here by using a box unioned with cylinders
// and subtracting corner boxes to form a rounded-rectangle cross-section.

// Core cross approach: outer box, subtract four corner squares, add four corner cylinders
const cornerBoxSize = filletR;

// Full outer bounding box (height = outerZ, centered XY, base at Z=0)
const outerBox = box(outerX, outerY, outerZ).translate(0, 0, outerZ / 2);

// Corner removal boxes (each = filletR x filletR x outerZ, at each corner)
const cornerCut_pp = box(cornerBoxSize, cornerBoxSize, outerZ)
  .translate( (outerX / 2 - cornerBoxSize / 2),  (outerY / 2 - cornerBoxSize / 2), outerZ / 2);
const cornerCut_pn = box(cornerBoxSize, cornerBoxSize, outerZ)
  .translate( (outerX / 2 - cornerBoxSize / 2), -(outerY / 2 - cornerBoxSize / 2), outerZ / 2);
const cornerCut_np = box(cornerBoxSize, cornerBoxSize, outerZ)
  .translate(-(outerX / 2 - cornerBoxSize / 2),  (outerY / 2 - cornerBoxSize / 2), outerZ / 2);
const cornerCut_nn = box(cornerBoxSize, cornerBoxSize, outerZ)
  .translate(-(outerX / 2 - cornerBoxSize / 2), -(outerY / 2 - cornerBoxSize / 2), outerZ / 2);

// Corner rounding cylinders (radius = filletR, placed at each corner axis)
const cyl_pp = cylinder(outerZ, filletR)
  .translate( (outerX / 2 - filletR),  (outerY / 2 - filletR), outerZ / 2);
const cyl_pn = cylinder(outerZ, filletR)
  .translate( (outerX / 2 - filletR), -(outerY / 2 - filletR), outerZ / 2);
const cyl_np = cylinder(outerZ, filletR)
  .translate(-(outerX / 2 - filletR),  (outerY / 2 - filletR), outerZ / 2);
const cyl_nn = cylinder(outerZ, filletR)
  .translate(-(outerX / 2 - filletR), -(outerY / 2 - filletR), outerZ / 2);

// Assemble outer rounded-rectangle solid
const outerRounded = outerBox
  .subtract(cornerCut_pp)
  .subtract(cornerCut_pn)
  .subtract(cornerCut_np)
  .subtract(cornerCut_nn)
  .union(cyl_pp)
  .union(cyl_pn)
  .union(cyl_np)
  .union(cyl_nn);

// ── Step 2: Inner cavity (same rounded-rect, smaller, starting at Z=wallT) ─
const innerBox = box(innerX, innerY, innerZ).translate(0, 0, wallT + innerZ / 2);

const iCornerBoxSize = innerFilletR;

const iCornerCut_pp = box(iCornerBoxSize, iCornerBoxSize, innerZ)
  .translate( (innerX / 2 - iCornerBoxSize / 2),  (innerY / 2 - iCornerBoxSize / 2), wallT + innerZ / 2);
const iCornerCut_pn = box(iCornerBoxSize, iCornerBoxSize, innerZ)
  .translate( (innerX / 2 - iCornerBoxSize / 2), -(innerY / 2 - iCornerBoxSize / 2), wallT + innerZ / 2);
const iCornerCut_np = box(iCornerBoxSize, iCornerBoxSize, innerZ)
  .translate(-(innerX / 2 - iCornerBoxSize / 2),  (innerY / 2 - iCornerBoxSize / 2), wallT + innerZ / 2);
const iCornerCut_nn = box(iCornerBoxSize, iCornerBoxSize, innerZ)
  .translate(-(innerX / 2 - iCornerBoxSize / 2), -(innerY / 2 - iCornerBoxSize / 2), wallT + innerZ / 2);

const iCyl_pp = cylinder(innerZ, innerFilletR)
  .translate( (innerX / 2 - innerFilletR),  (innerY / 2 - innerFilletR), wallT + innerZ / 2);
const iCyl_pn = cylinder(innerZ, innerFilletR)
  .translate( (innerX / 2 - innerFilletR), -(innerY / 2 - innerFilletR), wallT + innerZ / 2);
const iCyl_np = cylinder(innerZ, innerFilletR)
  .translate(-(innerX / 2 - innerFilletR),  (innerY / 2 - innerFilletR), wallT + innerZ / 2);
const iCyl_nn = cylinder(innerZ, innerFilletR)
  .translate(-(innerX / 2 - innerFilletR), -(innerY / 2 - innerFilletR), wallT + innerZ / 2);

const innerCavity = innerBox
  .subtract(iCornerCut_pp)
  .subtract(iCornerCut_pn)
  .subtract(iCornerCut_np)
  .subtract(iCornerCut_nn)
  .union(iCyl_pp)
  .union(iCyl_pn)
  .union(iCyl_np)
  .union(iCyl_nn);

// ── Step 3: Shell the outer body by subtracting the inner cavity ───────────
const trayShell = outerRounded.subtract(innerCavity);

// ── Step 4: Mounting holes through the floor ───────────────────────────────
// Holes are slightly taller than wallT to ensure clean through-cut
const holeHeight = wallT + 0.2;
const hole_pp = cylinder(holeHeight, holeR).translate( holeHalfX,  holeHalfY, holeHeight / 2);
const hole_pn = cylinder(holeHeight, holeR).translate( holeHalfX, -holeHalfY, holeHeight / 2);
const hole_np = cylinder(holeHeight, holeR).translate(-holeHalfX,  holeHalfY, holeHeight / 2);
const hole_nn = cylinder(holeHeight, holeR).translate(-holeHalfX, -holeHalfY, holeHeight / 2);

// Subtract all four holes from the tray shell
const trayWithHoles = trayShell
  .subtract(hole_pp)
  .subtract(hole_pn)
  .subtract(hole_np)
  .subtract(hole_nn);

// ── Final appearance ───────────────────────────────────────────────────────
const finalShape = trayWithHoles.color("#5a7fa8");

return {
  "rounded-rectangular-electronics-enclosur": finalShape,
};
