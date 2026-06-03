/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Pipe tee fitting with a horizontal run pipe along the X axis and a vertical branch pipe along the +Z axis, forming a T-shaped hollow interior. All pipes share the same 30mm OD and 24mm ID (3mm wall thickness).
 * Workflow ID : eval-T3_015-8d39d6
 * Trace ID    : 87f8e412-6460-451d-accf-102e951c3e98
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 100.0 × 30.0 × 80.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 3 hole(s) of diameter 24 mm (×3)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_015-8d39d6/step/T3_015_outer0_attempt0.step
 *   STL    : artifact://eval-T3_015-8d39d6/stl/T3_015_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Construction approach: (1) Create outer solid of run pipe as a cylinder of radius 15mm along X axis from -50 to 50. (2) Create outer solid of branch pipe as a cylinder of radius 15mm along Z axis from 0 to 50. (3) Union both outer solids. (4) Create inner hollow of run pipe as a cylinder of radius 12mm along X axis from -50 to 50. (5) Create inner hollow of branch pipe as a cylinder of radius 12mm along Z axis from -15 to 50 (extend downward into the run pipe interior to ensure the T-junction is fully open). (6) Union both inner hollow cylinders. (7) Subtract the unified inner hollow from the unified outer solid. The branch inner bore must penetrate through the run pipe wall so the interior is fully connected. The branch pipe Z start for the inner bore should begin at or below Z=-12 (the inner radius of the run pipe) to ensure full T-channel connectivity. The overall bounding box in Z runs from Z=-15 (bottom of run pipe OD) to Z=50 (top of branch), giving a Z extent of 65mm for the geometry but 80mm is padded; actual zlen should be noted as 65mm (15mm below origin for run pipe radius + 50mm branch). Revise overall_bbox zlen to 65 if strict. Volume estimate accounts for wall material only (outer solid minus inner T-channel). Use CadQuery or similar CSG approach.
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
 * Run pipe: 100mm long along X axis, OD=30mm, ID=24mm
 * Branch pipe: 50mm long along +Z axis, OD=30mm, ID=24mm
 */

// Parameters
const outerRadius = Param.number("Outer Radius", 15, { min: 5, max: 50, unit: "mm" });
const innerRadius = Param.number("Inner Radius", 12, { min: 3, max: 45, unit: "mm" });
const runLength = Param.number("Run Length", 100, { min: 20, max: 300, unit: "mm" });
const branchLength = Param.number("Branch Length", 50, { min: 10, max: 200, unit: "mm" });

// --- Outer solids ---

// Run pipe outer solid: cylinder along X axis, centered at origin
const runOuter = cylinder(runLength, outerRadius)
  .rotate([0, 1, 0], 90); // align cylinder axis along X

// Branch pipe outer solid: cylinder along +Z axis, from Z=0 to Z=branchLength
const branchOuter = cylinder(branchLength, outerRadius)
  .translate(0, 0, branchLength / 2); // shift so base is at Z=0, top at Z=branchLength

// Union outer solids to form the T-shaped outer body
const outerUnion = runOuter.union(branchOuter);

// --- Inner hollow channels ---

// Run pipe inner bore: full length along X axis
const runInner = cylinder(runLength, innerRadius)
  .rotate([0, 1, 0], 90); // align along X axis

// Branch pipe inner bore: extend below Z=0 into run pipe to ensure open T-junction
// Extend from Z = -outerRadius to Z = branchLength so it fully punches through
const branchInnerLength = branchLength + outerRadius;
const branchInner = cylinder(branchInnerLength, innerRadius)
  .translate(0, 0, branchInnerLength / 2 - outerRadius); // base at Z=-outerRadius, top at Z=branchLength

// Union inner bores to form the T-shaped hollow
const innerUnion = runInner.union(branchInner);

// --- Subtract inner hollow from outer solid ---
const finalShape = outerUnion.subtract(innerUnion);

return {
  "pipe-tee-fitting-with-a-horizontal-run-p": finalShape,
};
