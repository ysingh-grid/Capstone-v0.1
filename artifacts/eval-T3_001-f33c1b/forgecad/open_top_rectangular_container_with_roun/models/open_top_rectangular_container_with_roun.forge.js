/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Open-top rectangular container with rounded vertical corners, shelled with 2mm wall thickness, centered at origin on XY plane
 * Workflow ID : eval-T3_001-f33c1b
 * Trace ID    : cb7a6862-cbc2-432a-be47-320f2b98d0ee
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
 *   STEP   : artifact://eval-T3_001-f33c1b/step/T3_001_outer0_attempt0.step
 *   STL    : artifact://eval-T3_001-f33c1b/stl/T3_001_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Build strategy: (1) Create outer solid by extruding a 2D rounded-rectangle profile (box with four 5mm-radius corner fillets in XY plane) from Z=0 to Z=30. The rounded rectangle can be constructed as a CadQuery 'box' with shell or via a 2D sketch with rounded corners using 'cq.Workplane.rect(...).fillet(5)' on a face. (2) Shell the solid with thickness=2mm, selecting the top face (+Z at Z=30) as the face to open/remove. CadQuery's '.shell(-2, openFaces=[top_face])' or equivalent should produce the open-top container. (3) Ensure the part is centered at XY origin: X in [-30,+30], Y in [-20,+20], Z in [0,30]. Inner cavity dimensions follow as 56x36 in XY with inner fillet radius of 3mm (outer_radius - wall_thickness = 5-2=3), and depth 28mm (30-2mm base). Volume estimate: outer_vol minus inner_vol. Outer rounded-rect area ≈ (60*40) - (4*(5^2 - pi*5^2/4)) = 2400 - 4*(25 - 19.635) = 2400 - 21.46 ≈ 2378.54 mm^2; outer_vol ≈ 2378.54*30 = 71356 mm^3. Inner area ≈ (56*36) - 4*(9 - pi*9/4)*... recalc: inner fillet 3mm, area = 56*36 - 4*(3^2 - pi*3^2/4) = 2016 - 4*(9-7.069) = 2016 - 7.72 ≈ 2008.28 mm^2; inner_vol ≈ 2008.28*28 = 56232 mm^3. Shell volume ≈ 71356 - 56232 ≈ 15124 mm^3 (use this as reference, estimate stated as ~13072 is conservative; accept within 5%). Prefer CadQuery shell() approach for clean geometry.
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
 * Outer: 60x40x30mm, 5mm vertical edge fillets, 2mm wall thickness
 * Centered at XY origin, base at Z=0, top is open
 */

// Parameters
const outerX = Param.number("Outer X", 60, { min: 20, max: 300, unit: "mm" });
const outerY = Param.number("Outer Y", 40, { min: 20, max: 200, unit: "mm" });
const outerZ = Param.number("Outer Z", 30, { min: 5,  max: 200, unit: "mm" });
const filletR = Param.number("Fillet Radius", 5, { min: 1, max: 20, unit: "mm" });
const wallT = Param.number("Wall Thickness", 2, { min: 1, max: 10, unit: "mm" });

// Derived inner dimensions
const innerX = outerX - 2 * wallT;
const innerY = outerY - 2 * wallT;
const innerZ = outerZ - wallT;       // open top, so only bottom wall subtracts
const innerFillet = filletR - wallT; // inner fillet radius = 5 - 2 = 3mm

// --- Build outer rounded-rectangle prism ---
// Start with a full box centered on XY, extending +Z
const outerBox = box(outerX, outerY, outerZ);

// Create four corner cylinders for the rounded vertical edges
// Each cylinder is placed at the four XY corners, full height
const cornerR = filletR;
const cx = outerX / 2 - cornerR;
const cy = outerY / 2 - cornerR;

// Corner fillet cylinders (outer)
const cyl_pp = cylinder(outerZ, cornerR).translate( cx,  cy, 0);
const cyl_np = cylinder(outerZ, cornerR).translate(-cx,  cy, 0);
const cyl_pn = cylinder(outerZ, cornerR).translate( cx, -cy, 0);
const cyl_nn = cylinder(outerZ, cornerR).translate(-cx, -cy, 0);

// Build the corner-rounding mask:
// The rounded box = intersection of the box with a shape that rounds the corners.
// Strategy: subtract corner box-squares then add back fillet cylinders.
// Corner squares to remove (each is a small box at each corner)
const csz = outerZ; // full height
const cBoxSize = cornerR * 2;

const ccut_pp = box(cBoxSize, cBoxSize, csz).translate( cx,  cy, 0);
const ccut_np = box(cBoxSize, cBoxSize, csz).translate(-cx,  cy, 0);
const ccut_pn = box(cBoxSize, cBoxSize, csz).translate( cx, -cy, 0);
const ccut_nn = box(cBoxSize, cBoxSize, csz).translate(-cx, -cy, 0);

// Remove the square corners from the outer box
const outerBoxCut = outerBox
    .subtract(ccut_pp)
    .subtract(ccut_np)
    .subtract(ccut_pn)
    .subtract(ccut_nn);

// Add back the rounded fillet cylinders
const outerSolid = outerBoxCut
    .union(cyl_pp)
    .union(cyl_np)
    .union(cyl_pn)
    .union(cyl_nn);

// --- Build inner cavity (open top) ---
// Inner rounded-rectangle prism, shifted up by wallT so base is at wallT
const innerBox = box(innerX, innerY, innerZ).translate(0, 0, wallT);

// Inner corner fillet cylinders
const icx = innerX / 2 - innerFillet;
const icy = innerY / 2 - innerFillet;

const icyl_pp = cylinder(innerZ, innerFillet).translate( icx,  icy, wallT);
const icyl_np = cylinder(innerZ, innerFillet).translate(-icx,  icy, wallT);
const icyl_pn = cylinder(innerZ, innerFillet).translate( icx, -icy, wallT);
const icyl_nn = cylinder(innerZ, innerFillet).translate(-icx, -icy, wallT);

// Corner squares to remove from inner box
const icBoxSize = innerFillet * 2;
const iccut_pp = box(icBoxSize, icBoxSize, innerZ).translate( icx,  icy, wallT);
const iccut_np = box(icBoxSize, icBoxSize, innerZ).translate(-icx,  icy, wallT);
const iccut_pn = box(icBoxSize, icBoxSize, innerZ).translate( icx, -icy, wallT);
const iccut_nn = box(icBoxSize, icBoxSize, innerZ).translate(-icx, -icy, wallT);

// Build inner cavity solid
const innerBoxCut = innerBox
    .subtract(iccut_pp)
    .subtract(iccut_np)
    .subtract(iccut_pn)
    .subtract(iccut_nn);

const innerCavity = innerBoxCut
    .union(icyl_pp)
    .union(icyl_np)
    .union(icyl_pn)
    .union(icyl_nn);

// --- Shell: subtract inner cavity from outer solid ---
const container = outerSolid.subtract(innerCavity);

// --- Translate so base sits at Z=0 (box() is centered in Z, so shift up by outerZ/2) ---
const finalShape = container.translate(0, 0, outerZ / 2).color("#5f87c6");

return {
    "open-top-rectangular-container-with-roun": finalShape,
};
