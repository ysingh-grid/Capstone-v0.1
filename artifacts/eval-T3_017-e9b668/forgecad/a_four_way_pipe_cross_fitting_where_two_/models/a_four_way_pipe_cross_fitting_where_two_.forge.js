/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A four-way pipe cross fitting where two identical hollow cylindrical pipes intersect perpendicularly at the origin, forming a '+' shaped hollow interior. One pipe runs along the X axis, the other along the Z axis.
 * Workflow ID : eval-T3_017-e9b668
 * Trace ID    : 20aed442-78f5-4027-b619-3f8aed29e270
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
 *   STEP   : artifact://eval-T3_017-e9b668/step/T3_017_outer0_attempt0.step
 *   STL    : artifact://eval-T3_017-e9b668/stl/T3_017_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Construction approach: (1) Create outer_x: cylinder of radius 15mm, height 100mm, oriented along X axis (rotate 90deg around Y), centered at origin. (2) Create outer_z: cylinder of radius 15mm, height 100mm, oriented along Z axis, centered at origin. (3) Union outer_x and outer_z to form the combined outer shell. (4) Create inner_x: cylinder of radius 12mm, height 100mm, oriented along X axis, centered at origin. (5) Create inner_z: cylinder of radius 12mm, height 100mm, oriented along Z axis, centered at origin. (6) Union inner_x and inner_z to form the combined bore. (7) Subtract combined bore from combined outer shell to produce the final part. Note: the inner bore union creates a continuous '+' shaped hollow interior at the intersection. Volume estimate accounts for the union overlap removal: two outer cylinders union minus two inner cylinders union. Single cylinder volume = pi*(15^2)*100 = 70686 mm3; union of two cylinders (subtract intersection) ~ 2*70686 - intersection_volume; inner single = pi*(12^2)*100 = 45239 mm3. Approximate final solid volume ~ 38956 mm3. Use CadQuery with cadquery.Workplane or direct OCCT boolean operations. The Y axis extent is determined solely by the outer diameter (30mm), so ylen=30mm.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Four-way pipe cross fitting: two hollow pipes intersecting perpendicularly at origin.
 * One pipe runs along X axis, the other along Z axis.
 */

// Parameters
const outerDiameter = Param.number("Outer Diameter", 30, { min: 10, max: 200, unit: "mm" });
const innerDiameter = Param.number("Inner Diameter", 24, { min: 4,  max: 190, unit: "mm" });
const pipeLength    = Param.number("Pipe Length",    100, { min: 20, max: 500, unit: "mm" });

// Derived radii
const outerRadius = outerDiameter / 2;
const innerRadius = innerDiameter / 2;

// Outer cylinder along Z axis (default cylinder orientation is Z)
const outerZ = cylinder(pipeLength, outerRadius);

// Outer cylinder along X axis: rotate 90 degrees around Y axis
const outerX = cylinder(pipeLength, outerRadius)
    .rotate([0, 1, 0], 90);

// Union the two outer cylinders to form the combined outer shell
const outerShell = outerZ.union(outerX);

// Inner bore along Z axis
const innerZ = cylinder(pipeLength, innerRadius);

// Inner bore along X axis: rotate 90 degrees around Y axis
const innerX = cylinder(pipeLength, innerRadius)
    .rotate([0, 1, 0], 90);

// Union the two inner bores to form the combined hollow interior
const innerBore = innerZ.union(innerX);

// Subtract the combined bore from the outer shell to create the hollow cross fitting
const finalShape = outerShell.subtract(innerBore).color("#5f87c6");

return {
    "a-four-way-pipe-cross-fitting-where-two-": finalShape,
};
