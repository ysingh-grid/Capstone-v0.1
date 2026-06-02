/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A rectangular block with rounded edges (fillets) on all sides.
 * Workflow ID : eval-T1_027-366fef
 * Trace ID    : 1bdf6ae7-7b13-4f8c-a9a8-180801f49e73
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 70.0 × 40.0 × 25.0 mm
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
 *   STEP   : artifact://eval-T1_027-366fef/step/T1_027_outer0_attempt0.step
 *   STL    : artifact://eval-T1_027-366fef/stl/T1_027_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create a base block of 70x40x25mm and apply a 5mm radius fillet to all of its 12 edges. Ensure the final overall bounding box does not exceed 70x40x25mm.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: A rectangular block with rounded edges (fillets) on all sides.
 */

// Define parameters for the block dimensions and fillet radius
const length = Param.number("Length", 70, { min: 10, max: 200, unit: "mm" });
const width = Param.number("Width", 40, { min: 10, max: 200, unit: "mm" });
const height = Param.number("Height", 25, { min: 10, max: 200, unit: "mm" });
const r = Param.number("Fillet Radius", 5, { min: 1, max: 20, unit: "mm" });

// --- Construct Extrusion Z (rounded corners in XY plane, extruded along Z) ---
const bZ1 = box(length - 2 * r, width, height).translate(0, 0, -height / 2);
const bZ2 = box(length, width - 2 * r, height).translate(0, 0, -height / 2);
const cZ1 = cylinder(height, r).translate(length / 2 - r, width / 2 - r, -height / 2);
const cZ2 = cylinder(height, r).translate(-length / 2 + r, width / 2 - r, -height / 2);
const cZ3 = cylinder(height, r).translate(length / 2 - r, -width / 2 + r, -height / 2);
const cZ4 = cylinder(height, r).translate(-length / 2 + r, -width / 2 + r, -height / 2);
const extZ = bZ1.union(bZ2).union(cZ1).union(cZ2).union(cZ3).union(cZ4);

// --- Construct Extrusion Y (rounded corners in XZ plane, extruded along Y) ---
const bY1 = box(length - 2 * r, height, width).translate(0, 0, -width / 2);
const bY2 = box(length, height - 2 * r, width).translate(0, 0, -width / 2);
const cY1 = cylinder(width, r).translate(length / 2 - r, height / 2 - r, -width / 2);
const cY2 = cylinder(width, r).translate(-length / 2 + r, height / 2 - r, -width / 2);
const cY3 = cylinder(width, r).translate(length / 2 - r, -height / 2 + r, -width / 2);
const cY4 = cylinder(width, r).translate(-length / 2 + r, -height / 2 + r, -width / 2);
const extY_temp = bY1.union(bY2).union(cY1).union(cY2).union(cY3).union(cY4);
const extY = extY_temp.rotate([1, 0, 0], 90);

// --- Construct Extrusion X (rounded corners in YZ plane, extruded along X) ---
const bX1 = box(height - 2 * r, width, length).translate(0, 0, -length / 2);
const bX2 = box(height, width - 2 * r, length).translate(0, 0, -length / 2);
const cX1 = cylinder(length, r).translate(height / 2 - r, width / 2 - r, -length / 2);
const cX2 = cylinder(length, r).translate(-height / 2 + r, width / 2 - r, -length / 2);
const cX3 = cylinder(length, r).translate(height / 2 - r, -width / 2 + r, -length / 2);
const cX4 = cylinder(length, r).translate(-height / 2 + r, -width / 2 + r, -length / 2);
const extX_temp = bX1.union(bX2).union(cX1).union(cX2).union(cX3).union(cX4);
const extX = extX_temp.rotate([0, 1, 0], 90);

// --- Intersect all three extrusions to form the fully filleted 3D block ---
const finalShape = extZ.intersect(extY).intersect(extX).color("#5f87c6");

// Return the final shape map with the specified key
return {
  "a-rectangular-block-with-rounded-edges-(": finalShape,
};
