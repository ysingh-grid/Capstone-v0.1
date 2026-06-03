/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A rounded rectangular electronics enclosure body, open on top, with a 2mm wall thickness, 8mm vertical corner fillets, and four 3.2mm mounting holes in the bottom face.
 * Workflow ID : eval-T3_002-d999b4
 * Trace ID    : 2c229c85-7d7e-4045-bd30-1973e26aeda8
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
 *   STEP   : artifact://eval-T3_002-d999b4/step/T3_002_outer0_attempt0.step
 *   STL    : artifact://eval-T3_002-d999b4/stl/T3_002_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The part must be centered at (0,0,12.5) so that the base is at Z=0. The shell operation must remove the top (+Z) face. The 8mm fillet radius applies to the outer vertical corners, which means the inner corner radius should be 6mm to maintain a uniform 2mm wall thickness.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Rounded rectangular electronics enclosure body with mounting holes.
 * Centered at the origin on the XY plane.
 */

// --- Parameters ---
const width = Param.number("Width", 80, { min: 40, max: 200, unit: "mm" });
const depth = Param.number("Depth", 50, { min: 30, max: 150, unit: "mm" });
const height = Param.number("Height", 25, { min: 10, max: 100, unit: "mm" });
const wallThickness = Param.number("Wall Thickness", 2, { min: 1, max: 5, unit: "mm" });
const baseThickness = Param.number("Base Thickness", 2, { min: 1, max: 5, unit: "mm" });
const outerFillet = Param.number("Outer Fillet Radius", 8, { min: 2, max: 20, unit: "mm" });
const holeDia = Param.number("Hole Diameter", 3.2, { min: 1, max: 10, unit: "mm" });

// --- Calculated Constants ---
const r_out = outerFillet;
const r_in = outerFillet - wallThickness;
const cx = width / 2 - r_out;
const cy = depth / 2 - r_out;
const holeRadius = holeDia / 2;
const innerHeight = height - baseThickness + 2; // Extra height to clear the top

// --- Outer Solid Boundary ---
const outerBox1 = box(width - 2 * r_out, depth, height);
const outerBox2 = box(width, depth - 2 * r_out, height);
const outerCyl1 = cylinder(height, r_out).translate(cx, cy, 0);
const outerCyl2 = cylinder(height, r_out).translate(-cx, cy, 0);
const outerCyl3 = cylinder(height, r_out).translate(cx, -cy, 0);
const outerCyl4 = cylinder(height, r_out).translate(-cx, -cy, 0);

// Combine outer shapes
const outerSolid = outerBox1
  .union(outerBox2)
  .union(outerCyl1)
  .union(outerCyl2)
  .union(outerCyl3)
  .union(outerCyl4);

// --- Inner Cavity Shelling ---
const innerBox1 = box(width - 2 * r_out, depth - 2 * wallThickness, innerHeight).translate(0, 0, baseThickness);
const innerBox2 = box(width - 2 * wallThickness, depth - 2 * r_out, innerHeight).translate(0, 0, baseThickness);
const innerCyl1 = cylinder(innerHeight, r_in).translate(cx, cy, baseThickness);
const innerCyl2 = cylinder(innerHeight, r_in).translate(-cx, cy, baseThickness);
const innerCyl3 = cylinder(innerHeight, r_in).translate(cx, -cy, baseThickness);
const innerCyl4 = cylinder(innerHeight, r_in).translate(-cx, -cy, baseThickness);

// Combine inner shapes
const innerCavity = innerBox1
  .union(innerBox2)
  .union(innerCyl1)
  .union(innerCyl2)
  .union(innerCyl3)
  .union(innerCyl4);

// --- Mounting Holes ---
const holeH = baseThickness + 4;
const hole1 = cylinder(holeH, holeRadius).translate(cx, cy, -2);
const hole2 = cylinder(holeH, holeRadius).translate(-cx, cy, -2);
const hole3 = cylinder(holeH, holeRadius).translate(cx, -cy, -2);
const hole4 = cylinder(holeH, holeRadius).translate(-cx, -cy, -2);

// Combine holes
const mountingHoles = hole1
  .union(hole2)
  .union(hole3)
  .union(hole4);

// --- Final Assembly ---
const enclosure = outerSolid
  .subtract(innerCavity)
  .subtract(mountingHoles)
  .color("#2e3440");

// Return the final shape
return {
  "a-rounded-rectangular-electronics-enclos": enclosure,
};
