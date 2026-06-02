/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : An open-top rectangular container with rounded vertical corners, shelled inward to form a 2mm wall thickness. Centered at the origin and resting on the XY plane.
 * Workflow ID : eval-T3_001-db608d
 * Trace ID    : fc379c99-c04e-4f23-a618-c1743861086f
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
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_001-db608d/step/T3_001_outer0_attempt0.step
 *   STL    : artifact://eval-T3_001-db608d/stl/T3_001_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   To maintain a uniform 2mm wall thickness, the inner cavity must have a corner fillet radius of 3mm (outer radius 5mm minus 2mm wall thickness). The outer bounding box must be exactly 60x40x30mm, centered on (0,0) in X and Y, with the bottom at Z=0.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Open-top rectangular container with rounded vertical corners.
 * Parametric model generated for ForgeCAD.
 */

// Define parameters
const width = Param.number("Width", 60, { min: 10, max: 200, unit: "mm" });
const depth = Param.number("Depth", 40, { min: 10, max: 200, unit: "mm" });
const height = Param.number("Height", 30, { min: 5, max: 150, unit: "mm" });
const wallThickness = Param.number("Wall Thickness", 2, { min: 0.5, max: 10, unit: "mm" });
const floorThickness = Param.number("Floor Thickness", 2, { min: 0.5, max: 10, unit: "mm" });
const outerRadius = Param.number("Outer Radius", 5, { min: 1, max: 20, unit: "mm" });

// Derive inner dimensions for the cavity
const innerWidth = width - (wallThickness * 2);
const innerDepth = depth - (wallThickness * 2);
const innerRadius = outerRadius - wallThickness;
const innerHeight = height - floorThickness + 5; // Extended slightly above top for clean cut

// Outer solid: central cross boxes
const outerBoxX = box(width - (outerRadius * 2), depth, height);
const outerBoxY = box(width, depth - (outerRadius * 2), height);
const outerCross = outerBoxX.union(outerBoxY);

// Outer solid: corner cylinders
const ox = (width / 2) - outerRadius;
const oy = (depth / 2) - outerRadius;
const oc1 = cylinder(height, outerRadius).translate(ox, oy, 0);
const oc2 = cylinder(height, outerRadius).translate(-ox, oy, 0);
const oc3 = cylinder(height, outerRadius).translate(ox, -oy, 0);
const oc4 = cylinder(height, outerRadius).translate(-ox, -oy, 0);

// Outer solid: combine everything
const oc12 = oc1.union(oc2);
const oc34 = oc3.union(oc4);
const outerCorners = oc12.union(oc34);
const outerSolid = outerCross.union(outerCorners);

// Inner cavity: central cross boxes
const innerBoxX = box(innerWidth - (innerRadius * 2), innerDepth, innerHeight);
const innerBoxY = box(innerWidth, innerDepth - (innerRadius * 2), innerHeight);
const innerCross = innerBoxX.union(innerBoxY);

// Inner cavity: corner cylinders
const ix = (innerWidth / 2) - innerRadius;
const iy = (innerDepth / 2) - innerRadius;
const ic1 = cylinder(innerHeight, innerRadius).translate(ix, iy, 0);
const ic2 = cylinder(innerHeight, innerRadius).translate(-ix, iy, 0);
const ic3 = cylinder(innerHeight, innerRadius).translate(ix, -iy, 0);
const ic4 = cylinder(innerHeight, innerRadius).translate(-ix, -iy, 0);

// Inner cavity: combine everything and translate to floor level
const ic12 = ic1.union(ic2);
const ic34 = ic3.union(ic4);
const innerCorners = ic12.union(ic34);
const innerSolidTemp = innerCross.union(innerCorners);
const innerSolid = innerSolidTemp.translate(0, 0, floorThickness);

// Subtract cavity from outer solid to create the open container
const container = outerSolid.subtract(innerSolid).color("#5f87c6");

// Return the final shape
return {
  "an-open-top-rectangular-container-with-r": container
};
