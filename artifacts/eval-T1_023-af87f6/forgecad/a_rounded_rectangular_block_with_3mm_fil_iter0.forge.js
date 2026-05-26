/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A rounded rectangular block with 3mm fillets on its four vertical edges.
 * Workflow ID : eval-T1_023-af87f6
 * Trace ID    : 477a077a-3dc5-4aaa-aa90-dc38bd13d38c
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 50.0 × 25.0 × 15.0 mm
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
 *   STEP   : artifact://eval-T1_023-af87f6/step/T1_023_outer0_attempt0.step
 *   STL    : artifact://eval-T1_023-af87f6/stl/T1_023_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure that the 3mm fillets are applied only to the 4 vertical edges (along the Z-axis). The top and bottom horizontal faces must remain completely flat.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Rounded Rectangular Block
 * A block with 3mm fillets on all vertical edges, keeping top/bottom flat.
 */

// Parameters
const length = Param.number("Length", 50, { min: 10, max: 200, unit: "mm" });
const width = Param.number("Width", 25, { min: 5, max: 200, unit: "mm" });
const height = Param.number("Height", 15, { min: 1, max: 100, unit: "mm" });
const filletRad = Param.number("Fillet Radius", 3, { min: 0.1, max: 10, unit: "mm" });

// Calculate dimensions for inner boxes
const innerWidthX = length - 2 * filletRad;
const innerWidthY = width - 2 * filletRad;

// Offset for the corner cylinders
const dx = length / 2 - filletRad;
const dy = width / 2 - filletRad;

// Create the cross-shaped inner blocks
const blockX = box(innerWidthX, width, height);
const blockY = box(length, innerWidthY, height);

// Create the 4 corner cylinders
const cyl = cylinder(height, filletRad);
const cyl1 = cyl.translate(dx, dy, 0);
const cyl2 = cyl.translate(-dx, dy, 0);
const cyl3 = cyl.translate(dx, -dy, 0);
const cyl4 = cyl.translate(-dx, -dy, 0);

// Union all the parts to form the rounded rectangular block
const finalShape = blockX
  .union(blockY)
  .union(cyl1)
  .union(cyl2)
  .union(cyl3)
  .union(cyl4)
  .color("#5f87c6");

// Return the final shape
return {
  "a-rounded-rectangular-block-with-3mm-fil": finalShape,
};
