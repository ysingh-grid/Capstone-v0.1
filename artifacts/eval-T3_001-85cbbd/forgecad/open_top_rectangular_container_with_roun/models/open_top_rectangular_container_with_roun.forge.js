/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Open-top rectangular container with rounded vertical corners (filleted edges), 2mm wall thickness, outer dimensions 60x40x30mm, centered at origin on XY plane
 * Workflow ID : eval-T3_001-85cbbd
 * Trace ID    : 95d9e4d6-1857-4948-9b29-6ed36aace5e6
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 60.0 × 40.0 × 30.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_001-85cbbd/step/T3_001_outer0_attempt0.step
 *   STL    : artifact://eval-T3_001-85cbbd/stl/T3_001_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Construction approach: (1) Create a 2D rounded-rectangle profile (60x40mm with 4x corner arcs of radius 5mm) centered at origin; (2) Extrude it 30mm in +Z to form the outer solid; (3) Create a smaller rounded-rectangle profile (56x36mm with corner arcs of radius 3mm = 5mm - 2mm wall) centered at origin; (4) Extrude it 28mm in +Z starting at Z=2 (floor thickness = 2mm) to form the inner void; (5) Subtract inner void from outer solid to produce the shelled open-top container. Alternatively use CadQuery: outer box with fillet on vertical edges, then shell with open_faces=[top_face] and thickness=2mm. Ensure fillets are applied only to the 4 vertical edges (parallel to Z-axis), not the horizontal edges at top or bottom. The top face must remain fully open. Base sits flush on Z=0 plane. Inner fillet radius must equal outer fillet radius minus wall thickness = 3mm to maintain uniform wall thickness at corners.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Open-top rectangular container with rounded vertical corners
 * Outer: 60x40x30mm, fillet radius 5mm, wall thickness 2mm
 */

// Parameters
const outerX       = Param.number("Outer Width X",   60, { min: 20, max: 300, unit: "mm" });
const outerY       = Param.number("Outer Depth Y",   40, { min: 20, max: 300, unit: "mm" });
const outerZ       = Param.number("Outer Height Z",  30, { min: 5,  max: 200, unit: "mm" });
const filletR      = Param.number("Fillet Radius",    5, { min: 1,  max: 20,  unit: "mm" });
const wallT        = Param.number("Wall Thickness",   2, { min: 1,  max: 10,  unit: "mm" });

// Derived dimensions
const innerX       = outerX - 2 * wallT;   // 56mm
const innerY       = outerY - 2 * wallT;   // 36mm
const innerZ       = outerZ - wallT;        // 28mm (floor = wallT)
const innerFilletR = filletR - wallT;       // 3mm

// --- Outer solid: approximated rounded-rectangle via boolean union of boxes and cylinders ---

// Central slab spanning full outer dimensions
const outerCenterSlab = box(outerX, outerY, outerZ).translate(0, 0, outerZ / 2);

// Corner cylinders for outer rounded edges (placed at 4 corners)
const cx = outerX / 2 - filletR;  // 25
const cy = outerY / 2 - filletR;  // 15

const outerCornerPP = cylinder(outerZ, filletR).translate( cx,  cy, outerZ / 2);
const outerCornerPN = cylinder(outerZ, filletR).translate( cx, -cy, outerZ / 2);
const outerCornerNP = cylinder(outerZ, filletR).translate(-cx,  cy, outerZ / 2);
const outerCornerNN = cylinder(outerZ, filletR).translate(-cx, -cy, outerZ / 2);

// X-axis spanning bar (full X width, fillet height in Y)
const outerBarX = box(outerX - 2 * filletR, outerY, outerZ).translate(0, 0, outerZ / 2);

// Y-axis spanning bar (full Y width, fillet height in X)
const outerBarY = box(outerX, outerY - 2 * filletR, outerZ).translate(0, 0, outerZ / 2);

// Union everything to form rounded rectangle prism
const outerSolid = outerCenterSlab
  .union(outerCornerPP)
  .union(outerCornerPN)
  .union(outerCornerNP)
  .union(outerCornerNN)
  .union(outerBarX)
  .union(outerBarY);

// --- Inner void: smaller rounded-rectangle prism starting at Z = wallT ---

const icx = innerX / 2 - innerFilletR;  // 25
const icy = innerY / 2 - innerFilletR;  // 15

const innerCenterSlab = box(innerX, innerY, innerZ).translate(0, 0, wallT + innerZ / 2);

const innerCornerPP = cylinder(innerZ, innerFilletR).translate( icx,  icy, wallT + innerZ / 2);
const innerCornerPN = cylinder(innerZ, innerFilletR).translate( icx, -icy, wallT + innerZ / 2);
const innerCornerNP = cylinder(innerZ, innerFilletR).translate(-icx,  icy, wallT + innerZ / 2);
const innerCornerNN = cylinder(innerZ, innerFilletR).translate(-icx, -icy, wallT + innerZ / 2);

const innerBarX = box(innerX - 2 * innerFilletR, innerY, innerZ).translate(0, 0, wallT + innerZ / 2);
const innerBarY = box(innerX, innerY - 2 * innerFilletR, innerZ).translate(0, 0, wallT + innerZ / 2);

// Union inner void pieces
const innerVoid = innerCenterSlab
  .union(innerCornerPP)
  .union(innerCornerPN)
  .union(innerCornerNP)
  .union(innerCornerNN)
  .union(innerBarX)
  .union(innerBarY);

// --- Subtract inner void from outer solid to shell the container ---
const container = outerSolid.subtract(innerVoid);

// Apply color
const finalShape = container.color("#5f87c6");

return {
  "open-top-rectangular-container-with-roun": finalShape,
};
