/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A 4-way pipe cross fitting made of two intersecting hollow cylinders of equal dimensions, aligned along the X and Z axes, creating a continuous hollow interior.
 * Workflow ID : eval-T3_017-ae851c
 * Trace ID    : 8a5dd32c-f515-4a52-858a-8003907f8398
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 100.0 × 30.0 × 100.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 4 hole(s) of diameter 24.0 mm (×4)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_017-ae851c/step/T3_017_outer0_attempt0.step
 *   STL    : artifact://eval-T3_017-ae851c/stl/T3_017_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the intersection is fully cleared to form a continuous interior passage. Create the outer shape by unioning two solid cylinders, create the inner shape by unioning two smaller cylinders, then subtract the inner union from the outer union to ensure clean internal geometry without internal walls.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: 4-Way Pipe Cross Fitting
 * Two hollow pipes of equal size crossing perpendicularly along the X and Z axes.
 */

// Define parameters for the pipe fitting
const outerDiameter = Param.number("Outer Diameter", 30, { min: 10, max: 100, unit: "mm" });
const innerDiameter = Param.number("Inner Diameter", 24, { min: 5, max: 95, unit: "mm" });
const lengthX = Param.number("X-Axis Pipe Length", 100, { min: 40, max: 300, unit: "mm" });
const lengthZ = Param.number("Z-Axis Pipe Length", 100, { min: 40, max: 300, unit: "mm" });

// Calculate radii
const outerRadius = outerDiameter / 2;
const innerRadius = innerDiameter / 2;

// Create the outer solid cylinder for the Z-axis pipe (centered at Z=0)
const outerZ = cylinder(lengthZ, outerRadius)
  .translate(0, 0, -lengthZ / 2);

// Create the outer solid cylinder for the X-axis pipe (centered at X=0, rotated to align with X-axis)
const outerX = cylinder(lengthX, outerRadius)
  .translate(0, 0, -lengthX / 2)
  .rotate([0, 1, 0], 90);

// Combine outer shapes to form the solid cross structure
const outerUnion = outerZ.union(outerX);

// Create slightly longer inner cylinders to ensure clean cuts at the ends
const innerLengthZ = lengthZ + 2;
const innerLengthX = lengthX + 2;

// Create the hollow core for the Z-axis pipe
const innerZ = cylinder(innerLengthZ, innerRadius)
  .translate(0, 0, -innerLengthZ / 2);

// Create the hollow core for the X-axis pipe
const innerX = cylinder(innerLengthX, innerRadius)
  .translate(0, 0, -innerLengthX / 2)
  .rotate([0, 1, 0], 90);

// Combine the hollow cores into a single cutter shape
const innerUnion = innerZ.union(innerX);

// Subtract the combined inner cores from the combined outer shapes to create the hollow fitting
const finalShape = outerUnion.subtract(innerUnion).color("#5f87c6");

// Return the final assembly
return {
  "a-4-way-pipe-cross-fitting-made-of-two-i": finalShape
};
