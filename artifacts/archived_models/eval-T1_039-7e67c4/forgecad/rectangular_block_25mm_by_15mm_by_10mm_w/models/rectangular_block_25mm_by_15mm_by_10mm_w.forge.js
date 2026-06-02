/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Rectangular block 25mm by 15mm by 10mm with 1mm chamfers on all 12 edges.
 * Workflow ID : eval-T1_039-7e67c4
 * Trace ID    : 676069a7-f124-41ef-b4ad-85e0dcfd1886
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 25.0 × 15.0 × 10.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 3.0%
 *   BBox IoU       : ≥ 0.98
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_039-7e67c4/step/T1_039_outer0_attempt0.step
 *   STL    : artifact://eval-T1_039-7e67c4/stl/T1_039_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The 1mm chamfer must be applied to all 12 edges of the block. The overall bounding box must remain exactly 25mm x 15mm x 10mm. If using CadQuery or standard CAD kernels, a global chamfer operation on the solid's edges is the most efficient approach.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Rectangular block with chamfers on all 12 edges.
 * Designed parametrically for ForgeCAD.
 */

// Define parameters for the block dimensions and chamfer size
const length = Param.number("Length", 25, { min: 5, max: 100, unit: "mm" });
const width = Param.number("Width", 15, { min: 5, max: 100, unit: "mm" });
const height = Param.number("Height", 10, { min: 2, max: 100, unit: "mm" });
const chamfer = Param.number("Chamfer Distance", 1, { min: 0.1, max: 5, unit: "mm" });

// Helper function to create a centered box chamfered along the Z-axis
function makeCenteredChamferedZ(dx, dy, dz, c) {
  // Create the main base box centered in Z
  const mainBox = box(dx, dy, dz).translate(0, 0, -dz / 2);
  
  // Calculate cutter size to achieve the exact chamfer distance
  const cutterSize = c * Math.sqrt(2);
  const cutterHeight = dz + 2;
  
  // Create a template cutter rotated 45 degrees
  const templateCutter = box(cutterSize, cutterSize, cutterHeight)
    .rotate([0, 0, 1], 45)
    .translate(0, 0, -cutterHeight / 2);
  
  // Position cutters at the four corners
  const c1 = templateCutter.translate(dx / 2, dy / 2, 0);
  const c2 = templateCutter.translate(-dx / 2, dy / 2, 0);
  const c3 = templateCutter.translate(dx / 2, -dy / 2, 0);
  const c4 = templateCutter.translate(-dx / 2, -dy / 2, 0);
  
  // Subtract the cutters to chamfer the 4 vertical edges
  return mainBox.subtract(c1).subtract(c2).subtract(c3).subtract(c4);
}

// Generate the three orthogonal chamfered components
// 1. Chamfered along Z-axis (vertical edges)
const blockZ = makeCenteredChamferedZ(length, width, height, chamfer);

// 2. Chamfered along Y-axis (edges parallel to Y)
const blockY = makeCenteredChamferedZ(length, height, width, chamfer)
  .rotate([1, 0, 0], 90);

// 3. Chamfered along X-axis (edges parallel to X)
const blockX = makeCenteredChamferedZ(width, height, length, chamfer)
  .rotate([0, 1, 0], 90)
  .rotate([1, 0, 0], 90);

// Intersect the three orthogonal blocks to produce chamfers on all 12 edges
const chamferedBlock = blockZ.intersect(blockY).intersect(blockX);

// Translate the final block so it sits on the XY plane (extends in +Z)
const finalShape = chamferedBlock.translate(0, 0, height / 2).color("#5f87c6");

// Return the final shape
return {
  "rectangular-block-25mm-by-15mm-by-10mm-w": finalShape
};
