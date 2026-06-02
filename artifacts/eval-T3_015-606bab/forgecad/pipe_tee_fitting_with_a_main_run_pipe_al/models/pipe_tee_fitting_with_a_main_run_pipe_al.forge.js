/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Pipe tee fitting with a main run pipe along the X axis and a perpendicular branch pipe along the +Z axis, forming a T-shaped hollow interior. All pipes share the same 30mm OD / 24mm ID cross-section.
 * Workflow ID : eval-T3_015-606bab
 * Trace ID    : 50e029d0-b9ef-4413-bf57-a4d8a96e8759
 * Iteration   : 1
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 100.0 × 30.0 × 65.0 mm
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
 *   STEP   : artifact://eval-T3_015-606bab/step/T3_015_outer1_attempt0.step
 *   STL    : artifact://eval-T3_015-606bab/stl/T3_015_outer1_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Construction approach: (1) Create outer solid of main pipe as a cylinder of radius 15mm, length 100mm, oriented along X axis, centered at origin. (2) Create outer solid of branch pipe as a cylinder of radius 15mm, length 50mm, oriented along +Z axis, with base at Z=0 and top at Z=50 (center at Z=25). (3) Union the two outer cylinders. (4) Create inner hollow of main pipe as a cylinder of radius 12mm, length 100mm (or slightly longer to ensure clean boolean), oriented along X axis, centered at origin. (5) Create inner hollow of branch pipe as a cylinder of radius 12mm, length 50mm (or slightly longer), oriented along +Z axis, center at Z=25. (6) Union the two inner hollow cylinders to form the T-shaped void. (7) Subtract the T-shaped void from the outer union to produce the final part. Ensure the branch pipe inner bore fully intersects and connects with the main pipe inner bore at Z=0. The branch outer cylinder should start at Z=0 (flush with the main pipe outer surface top) rather than Z=-15, since the branch only goes in the +Z direction. The overall bounding box Z dimension is 50 (branch top) - (-15) (main pipe bottom at Y) = but since main pipe is along X, bounding box Y is 30mm (diameter), Z runs from -15 (bottom of main pipe) to +50 (top of branch), giving zlen=65mm. Coder should use CadQuery or similar CSG approach for clean boolean operations.
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
 * Main run pipe along X axis, branch pipe along +Z axis.
 * 30mm OD / 24mm ID, 3mm wall thickness throughout.
 */

// Parameters
const outerRadius  = Param.number("Outer Radius",  15, { min: 5,  max: 100, unit: "mm" });
const innerRadius  = Param.number("Inner Radius",  12, { min: 3,  max: 95,  unit: "mm" });
const mainLength   = Param.number("Main Length",  100, { min: 20, max: 500, unit: "mm" });
const branchLength = Param.number("Branch Length", 50, { min: 10, max: 300, unit: "mm" });

// Half-lengths for centering
const mainHalf   = mainLength   / 2;
const branchHalf = branchLength / 2;

// --- Outer solids ---

// Main run pipe outer solid: cylinder along Z by default, rotate to X axis
const mainOuter = cylinder(mainLength, outerRadius)
    .rotate([0, 1, 0], 90); // now axis along X, centered at origin

// Branch pipe outer solid: cylinder along +Z, base at Z=0, center at Z=branchHalf
const branchOuter = cylinder(branchLength, outerRadius)
    .translate(0, 0, branchHalf); // center at Z=25, spans Z=0 to Z=50

// Union of outer solids
const outerUnion = mainOuter.union(branchOuter);

// --- Inner void solids (slightly oversized for clean booleans) ---

const eps = 2; // small epsilon for clean cuts

// Main inner bore: slightly longer than main pipe
const mainInner = cylinder(mainLength + eps, innerRadius)
    .rotate([0, 1, 0], 90); // axis along X

// Branch inner bore: extends slightly below Z=0 to ensure full intersection with main bore
const branchInnerLen = branchLength + eps;
const branchInner = cylinder(branchInnerLen, innerRadius)
    .translate(0, 0, (branchInnerLen / 2) - eps); // shift so it starts at -eps, ends at branchLength

// Union of inner void to form T-shaped hollow
const innerVoid = mainInner.union(branchInner);

// --- Final part: subtract T-shaped void from outer union ---
const finalShape = outerUnion.subtract(innerVoid).color("#5f87c6");

return {
    "pipe-tee-fitting-with-a-main-run-pipe-al": finalShape,
};
