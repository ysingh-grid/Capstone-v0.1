/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A hollow T-shaped pipe tee fitting with a main run along the X-axis and a perpendicular branch extending in the +Z direction.
 * Workflow ID : eval-T3_015-3e61d0
 * Trace ID    : be82744e-33bb-41a8-a442-37e93aa6de4e
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 100.0 × 30.0 × 65.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 3 hole(s) of diameter 24.0 mm (×3)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 10.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_015-3e61d0/step/T3_015_outer0_attempt0.step
 *   STL    : artifact://eval-T3_015-3e61d0/stl/T3_015_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the hollow interior is fully continuous by unioning the inner cylinders before subtracting them from the union of the outer cylinders. The main run is centered at the origin along the X axis (X from -50 to 50, Y and Z centered at 0). The branch extends from Z=0 to Z=50 in the +Z direction, centered at X=0, Y=0.
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
 * A hollow T-shaped pipe tee fitting with a main run along the X-axis 
 * and a perpendicular branch extending in the +Z direction.
 */

// --- Parameters ---
const mainLength = Param.number("Main Run Length", 100, { min: 50, max: 300, unit: "mm" });
const outerDiameter = Param.number("Outer Diameter", 30, { min: 10, max: 100, unit: "mm" });
const innerDiameter = Param.number("Inner Diameter", 24, { min: 8, max: 94, unit: "mm" });
const branchHeight = Param.number("Branch Height", 50, { min: 20, max: 150, unit: "mm" });

const outerRadius = outerDiameter / 2;
const innerRadius = innerDiameter / 2;

// --- Main Run Cylinder (Centered along X-axis) ---
// Create cylinder along Z, center it on Z, then rotate to align with X-axis
const mainOuter = cylinder(mainLength, outerRadius)
  .translate(0, 0, -mainLength / 2)
  .rotate([0, 1, 0], 90);

const mainInner = cylinder(mainLength + 2, innerRadius) // slightly longer to ensure clean cut
  .translate(0, 0, -(mainLength + 2) / 2)
  .rotate([0, 1, 0], 90);

// --- Branch Cylinder (Extending in +Z direction) ---
// Starts at Z=0 and goes up to Z=branchHeight
const branchOuter = cylinder(branchHeight, outerRadius);
const branchInner = cylinder(branchHeight + 2, innerRadius); // slightly taller to ensure clean cut

// --- Combine Geometry ---
// Union the outer structures
const outerUnion = mainOuter.union(branchOuter);

// Union the inner cutting volumes
const innerUnion = mainInner.union(branchInner);

// Subtract the inner flow passage from the outer shell
const teeFitting = outerUnion.subtract(innerUnion).color("#5f87c6");

// --- Return Result ---
return {
  "a-hollow-t-shaped-pipe-tee-fitting-with-": teeFitting,
};
