/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : 180-degree U-bend (return bend) pipe fitting swept in the XZ plane, with two parallel legs 70mm apart, 20mm OD, 16mm ID, 2mm wall thickness, centerline radius 35mm
 * Workflow ID : eval-T3_014-865951
 * Trace ID    : 97826488-50cf-488a-b429-8046a7c56b6f
 * Iteration   : 5
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 90.0 × 20.0 × 55.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 2 hole(s) of diameter 16 mm (×2)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_014-865951/step/T3_014_outer5_attempt1.step
 *   STL    : artifact://eval-T3_014-865951/stl/T3_014_outer5_attempt1.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Use CadQuery to build this as a swept annular cross-section along a semicircular arc path in the XZ plane. The sweep path is a 180-degree arc (semicircle) of radius 35mm centered at (35, 0, 0) in the XZ plane, starting at (0, 0, 0) and ending at (70, 0, 0), arcing through the apex at (35, 0, 35). The cross-section is an annulus (circle OD=20mm minus circle ID=16mm). The sweep must be performed on the XZ workplane (normal is Y-axis). Use cadquery Wire.makeHelix or Edge.makeCircle arc approach: define the arc center at (35,0,0), arc in XZ plane, start angle 180deg, end angle 0deg (or equivalently use a 3-point arc through start=(0,0,0), mid=(35,0,35), end=(70,0,0)). After sweep, the bounding box in X should be ~0 to 70 (plus wall: -10 to 80), in Y should be -10 to +10, in Z should be -10 to +45 (leg stubs extend slightly below Z=0 if added, or 0 to 45 for pure bend). If leg stubs are added (10mm each), Z range becomes -10 to +45. The overall bbox xlen accounts for wall: leg centers at x=0 and x=70, so outer walls at x=-10 and x=80, giving xlen=90. The apex outer wall reaches z=35+10=45, so zlen=55 if legs extend to z=-10. Volume estimate: annular cross-section area = pi*(10^2 - 8^2) = pi*36 ~ 113.1 mm^2; semicircle path length = pi*35 ~ 109.96mm; sweep volume ~ 113.1 * 109.96 ~ 12,436 mm^3 for the bend alone; add two leg stubs of 10mm each: 2 * 113.1 * 10 = 2262 mm^3; total ~ 14,700 mm^3. Estimate rounded to ~15000 mm^3. Symmetry axis is X=35 plane.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 180-degree U-bend (return bend) pipe fitting
 * Sweep approximated using torus segments and cylinder stubs
 * Bend in XZ plane, centerline radius 35mm, OD 20mm, ID 16mm
 */

// Parameters
const outerRadius = Param.number("Outer Radius", 10, { min: 5, max: 50, unit: "mm" });
const innerRadius = Param.number("Inner Radius", 8, { min: 3, max: 48, unit: "mm" });
const bendRadius = Param.number("Bend Radius", 35, { min: 15, max: 150, unit: "mm" });
const legLength = Param.number("Leg Length", 10, { min: 2, max: 50, unit: "mm" });

// The U-bend is approximated by a torus cut to a half (180 degrees).
// A full torus with major radius=bendRadius, minor radius=outerRadius,
// then subtract a torus with minor radius=innerRadius.
// The torus axis is along Y, centered at (bendRadius, 0, 0) in XZ.

// Build outer torus half: full torus then cut away one half with a box
const outerTorusFull = cylinder(outerRadius * 2, bendRadius + outerRadius)
  .subtract(cylinder(outerRadius * 2, bendRadius - outerRadius));

// Use a different approach: model as swept annulus approximation
// Outer solid: large cylinder disk minus inner cylinder disk (annular disk),
// then use a torus-like construction.

// Torus approximation: outer shell torus
// A torus can be made by revolving a circle. Since ForgeCAD has box/cylinder only,
// we build the torus from a thick washer (annular cylinder) - this gives a flat ring.
// Instead, use concentric cylinders rotated 90 degrees to approximate the bend.

// Better approach: Use a large cylinder (the sweep envelope) and subtract inner void
// The bend is a half-torus. We model it as:
// - Outer half-torus = halfcylinder_donut (box-intersect of outer torus)
// - Inner half-torus = subtracted

// Build full annular torus (flat washer shape) aligned in XZ plane:
// Major radius = bendRadius (35mm), minor radius = outerRadius (10mm)
// Washer: outer disk radius = bendRadius + outerRadius, inner disk radius = bendRadius - outerRadius
// Height of washer = 2 * outerRadius

const washOuterR = bendRadius + outerRadius;
const washInnerR = bendRadius - outerRadius;
const washHeight = outerRadius * 2;

// Outer torus approximation: thick washer (cylinder disk minus center hole)
const outerWasherFull = cylinder(washHeight, washOuterR)
  .subtract(cylinder(washHeight, washInnerR));

// Inner void torus approximation
const innerWashOuterR = bendRadius + innerRadius;
const innerWashInnerR = bendRadius - innerRadius;
const innerWasherFull = cylinder(washHeight - 0, innerWashOuterR)
  .subtract(cylinder(washHeight, innerWashInnerR));

// Subtract inner from outer to get annular torus ring
const fullRing = outerWasherFull.subtract(innerWasherFull);

// The washer lies flat in XY plane, centered at origin, extending Z = -outerRadius to +outerRadius
// We need the bend in XZ plane: rotate 90 degrees around X axis
const bendRing = fullRing.rotate([1, 0, 0], 90);
// Now ring lies in XZ plane, centered at origin

// Cut to half: keep only Z >= 0 half (the U-bend arcs upward)
// Use a large box to cut away Z < 0 portion
const cutBox = box(washOuterR * 4, washOuterR * 4, washOuterR * 2)
  .translate(0, 0, -washOuterR);

const halfBend = bendRing.subtract(cutBox);

// Translate so that the two leg openings are at X=0 and X=70 (=2*bendRadius)
// Center of the ring is at origin, legs are at X=-bendRadius and X=+bendRadius
// Shift by +bendRadius in X so legs are at X=0 and X=70
const bendPositioned = halfBend.translate(bendRadius, 0, 0);

// Add left leg stub at X=0, running in Z direction (downward from Z=0)
// Leg is a cylinder of length=legLength, radius=outerRadius, axis along Z
const leftLegOuter = cylinder(legLength, outerRadius)
  .translate(0, 0, -legLength / 2);
const leftLegInner = cylinder(legLength, innerRadius)
  .translate(0, 0, -legLength / 2);
const leftLeg = leftLegOuter.subtract(leftLegInner);

// Add right leg stub at X=70, running in Z direction
const rightLegOuter = cylinder(legLength, outerRadius)
  .translate(bendRadius * 2, 0, -legLength / 2);
const rightLegInner = cylinder(legLength, innerRadius)
  .translate(bendRadius * 2, 0, -legLength / 2);
const rightLeg = rightLegOuter.subtract(rightLegInner);

// Combine bend with leg stubs
const withLeftLeg = bendPositioned.union(leftLeg);
const finalShape = withLeftLeg.union(rightLeg);

return {
  "180-degree-u-bend-(return-bend)-pipe-fit": finalShape.color("#5f87c6"),
};
