/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A pipe cross fitting (four-way intersection) with two perpendicular hollow cylindrical pipes of equal dimensions crossing at the origin, forming a continuous '+' shaped hollow interior.
 * Workflow ID : eval-T3_017-132c84
 * Trace ID    : 477aaddd-7f51-453e-ba3d-a239f4b9a1b8
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 100.0 × 30.0 × 100.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 4 hole(s) of diameter 24 mm (×4)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_017-132c84/step/T3_017_outer0_attempt0.step
 *   STL    : artifact://eval-T3_017-132c84/stl/T3_017_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Construction approach: (1) Create outer solid cylinder along X axis (radius=15, length=100, axis aligned to X). (2) Create outer solid cylinder along Z axis (radius=15, length=100, axis aligned to Z). (3) Union the two outer cylinders to form the combined outer body. (4) Create inner bore cylinder along X axis (radius=12, length=100, axis aligned to X). (5) Create inner bore cylinder along Z axis (radius=12, length=100, axis aligned to Z). (6) Union the two inner bore cylinders to form the continuous '+' shaped hollow interior. (7) Subtract the unioned inner bore from the unioned outer body to produce the final hollow cross fitting. All cylinders are centered at the origin. The Y axis extent is governed by the pipe outer diameter (±15mm). Ensure boolean union and subtraction operations correctly handle the overlapping intersection region at the origin so that the interior is fully connected and open at all four ends.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Pipe Cross Fitting (Four-Way Intersection)
 * Two perpendicular hollow pipes crossing at the origin forming a '+' shaped interior.
 */

// Parameters for the cross fitting dimensions
const outerRadius   = Param.number("Outer Radius",   15, { min: 5,  max: 100, unit: "mm" });
const innerRadius   = Param.number("Inner Radius",   12, { min: 2,  max: 95,  unit: "mm" });
const pipeLength    = Param.number("Pipe Length",   100, { min: 20, max: 500, unit: "mm" });

// Outer cylinder along X axis: cylinder is along Z by default, rotate to align with X
const outerCylX = cylinder(pipeLength, outerRadius)
    .rotate([0, 1, 0], 90); // rotate 90deg around Y to align cylinder axis with X

// Outer cylinder along Z axis: cylinder is already along Z by default
const outerCylZ = cylinder(pipeLength, outerRadius);

// Union the two outer cylinders to form the combined outer body
const outerBody = outerCylX.union(outerCylZ);

// Inner bore cylinder along X axis (to be subtracted for hollow interior)
const innerCylX = cylinder(pipeLength, innerRadius)
    .rotate([0, 1, 0], 90); // rotate 90deg around Y to align bore with X

// Inner bore cylinder along Z axis
const innerCylZ = cylinder(pipeLength, innerRadius);

// Union the two inner bore cylinders to form continuous '+' shaped hollow
const innerBore = innerCylX.union(innerCylZ);

// Subtract the inner bore from the outer body to produce the hollow cross fitting
const finalShape = outerBody.subtract(innerBore)
    .color("#5f87c6");

return {
    "a-pipe-cross-fitting-(four-way-intersect": finalShape,
};
