/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Solid rectangular block with dimensions 40mm x 20mm x 60mm and 4mm fillets on the four vertical edges.
 * Workflow ID : eval-T1_050-1d9ad3
 * Trace ID    : 81307ea6-1033-4141-88cd-504f50939ade
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 40.0 × 20.0 × 60.0 mm
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
 *   STEP   : artifact://eval-T1_050-1d9ad3/step/T1_050_outer0_attempt0.step
 *   STL    : artifact://eval-T1_050-1d9ad3/stl/T1_050_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure that the 4mm fillets are strictly applied to the four vertical edges (edges parallel to the Z-axis). The top and bottom faces (XY planes) must remain flat with no rounding/fillets on their boundary edges.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: Solid rectangular block with 4mm vertical fillets
 * Dimensions: 40mm x 20mm x 60mm
 */

// Define parameters as sliders for the studio
const width = Param.number("Width", 40, { min: 10, max: 200, unit: "mm" });
const depth = Param.number("Depth", 20, { min: 10, max: 200, unit: "mm" });
const height = Param.number("Height", 60, { min: 1, max: 300, unit: "mm" });
const fillet = Param.number("Vertical Fillet Radius", 4, { min: 0.1, max: 20, unit: "mm" });

// Calculate dimensions for the internal cross-sections to avoid overlapping/gaps
const innerWidth = width - 2 * fillet;
const innerDepth = depth - 2 * fillet;

// Create the main central boxes forming the cross shape
const boxX = box(innerWidth, depth, height);
const boxY = box(width, innerDepth, height);

// Combine the two central boxes
const core = boxX.union(boxY);

// Position coordinates for the four corner cylinders
const posX = width / 2 - fillet;
const posY = depth / 2 - fillet;

// Create the four corner cylinders to form the fillets
const cyl1 = cylinder(height, fillet).translate(posX, posY, 0);
const cyl2 = cylinder(height, fillet).translate(-posX, posY, 0);
const cyl3 = cylinder(height, fillet).translate(posX, -posY, 0);
const cyl4 = cylinder(height, fillet).translate(-posX, -posY, 0);

// Union the cylinders together
const corners1 = cyl1.union(cyl2);
const corners2 = cyl3.union(cyl4);
const allCorners = corners1.union(corners2);

// Union the core with the corners to produce the final filleted block
const finalBlock = core.union(allCorners).color("#5f87c6");

// Return the constructed shape
return {
  "solid-rectangular-block-with-dimensions-": finalBlock
};
