/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A pipe tee fitting with a main run pipe along the X axis and a perpendicular branch pipe along the +Z axis, featuring a continuous hollow T-shaped interior.
 * Workflow ID : eval-T3_015-577a69
 * Trace ID    : 421d17c7-5a19-4a79-aa02-9ad709512d50
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 100.0 × 30.0 × 65.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 3 hole(s) of diameter 24.0 mm (×3)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_015-577a69/step/T3_015_outer0_attempt0.step
 *   STL    : artifact://eval-T3_015-577a69/stl/T3_015_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Position the main pipe centered at the origin along the X axis (X from -50 to 50). Position the branch pipe starting from the origin (Z=0) extending to Z=50. Use constructive solid geometry (CSG) to union the outer shapes of both cylinders, union the inner shapes (the hollow cavities) of both cylinders, and subtract the inner union from the outer union to ensure a perfectly clean and continuous internal T-junction flow path.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Pipe Tee Fitting
 * A parametric model of a pipe tee fitting with a main run pipe and a perpendicular branch pipe.
 */

// Define parameters for the pipe fitting
const mainOuterDia = Param.number("Main Outer Diameter", 30, { min: 10, max: 100, unit: "mm" });
const mainInnerDia = Param.number("Main Inner Diameter", 24, { min: 5, max: 95, unit: "mm" });
const mainLength = Param.number("Main Length", 100, { min: 40, max: 300, unit: "mm" });
const branchLength = Param.number("Branch Length", 50, { min: 20, max: 150, unit: "mm" });

// Calculate radii
const outerRadius = mainOuterDia / 2;
const innerRadius = mainInnerDia / 2;

// Create the main outer cylinder, rotated to lie along the X axis and centered
const mainOuter = cylinder(mainLength, outerRadius)
  .rotate([0, 1, 0], 90)
  .translate([-mainLength / 2, 0, 0]);

// Create the branch outer cylinder, extending in +Z direction from Z=0
const branchOuter = cylinder(branchLength, outerRadius);

// Combine outer shapes to form the solid body
const outerSolid = mainOuter.union(branchOuter);

// Create the main inner cylinder for hollow cavity (slightly extended to ensure clean cut)
const mainInner = cylinder(mainLength + 4, innerRadius)
  .rotate([0, 1, 0], 90)
  .translate([-(mainLength + 4) / 2, 0, 0]);

// Create the branch inner cylinder for hollow cavity (slightly extended at the top)
const branchInner = cylinder(branchLength + 2, innerRadius);

// Combine inner hollow shapes
const innerCavity = mainInner.union(branchInner);

// Subtract the cavity from the solid body to create the hollow tee fitting
const teeFitting = outerSolid.subtract(innerCavity).color("#4a90e2");

// Return the final geometry map
return {
  "a-pipe-tee-fitting-with-a-main-run-pipe-": teeFitting,
};
