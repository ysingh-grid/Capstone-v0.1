/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A rectangular plate with four counterbored holes located at the corners, centered at the origin.
 * Workflow ID : eval-T2_012-5f51f8
 * Trace ID    : ae4f17a5-9ab6-4c6e-9580-55ad2bde90f3
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 60.0 × 40.0 × 8.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 4 hole(s) of diameter 5.5 mm (×4)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T2_012-5f51f8/step/T2_012_outer0_attempt0.step
 *   STL    : artifact://eval-T2_012-5f51f8/stl/T2_012_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The plate must be centered at the origin, meaning X ranges from -30 to 30, Y ranges from -20 to 20, and Z ranges from -4 to 4. The four holes are located at X = +/-22 and Y = +/-12. The counterbores are on the top face (+Z).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Rectangular plate with four counterbored holes.
 * Centered at the origin, with parametric dimensions and inset holes.
 */

// Define design parameters
const width = Param.number("Plate Width X", 60.0, { min: 10, max: 200, unit: "mm" });
const depth = Param.number("Plate Depth Y", 40.0, { min: 10, max: 200, unit: "mm" });
const thickness = Param.number("Plate Thickness Z", 8.0, { min: 2, max: 50, unit: "mm" });
const inset = Param.number("Hole Inset", 8.0, { min: 1, max: 30, unit: "mm" });
const holeDia = Param.number("Through Hole Diameter", 5.5, { min: 1, max: 20, unit: "mm" });
const cbDia = Param.number("Counterbore Diameter", 10.0, { min: 1, max: 30, unit: "mm" });
const cbDepth = Param.number("Counterbore Depth", 3.0, { min: 0.5, max: 20, unit: "mm" });

// Create the main plate box centered at the origin
const plate = box(width, depth, thickness).translate(0, 0, -thickness / 2);

// Create the through-hole cylinder (extended slightly to ensure clean cuts)
const thruHole = cylinder(thickness + 4, holeDia / 2).translate(0, 0, -(thickness + 4) / 2);

// Create the counterbore cylinder (starts inside the plate and extends upwards)
const counterbore = cylinder(cbDepth + 2, cbDia / 2).translate(0, 0, (thickness / 2) - cbDepth);

// Combine through-hole and counterbore into a single tool cutter shape
const cutter = thruHole.union(counterbore);

// Calculate corner offsets based on plate dimensions and inset
const dx = (width / 2) - inset;
const dy = (depth / 2) - inset;

// Translate the cutter tool to the four corner positions
const hole1 = cutter.translate(dx, dy, 0);
const hole2 = cutter.translate(-dx, dy, 0);
const hole3 = cutter.translate(dx, -dy, 0);
const hole4 = cutter.translate(-dx, -dy, 0);

// Subtract each cutter from the plate to form the final counterbored plate
const finalShape = plate
  .subtract(hole1)
  .subtract(hole2)
  .subtract(hole3)
  .subtract(hole4)
  .color("#5f87c6");

// Return the final geometry
return {
  "a-rectangular-plate-with-four-counterbor": finalShape,
};
