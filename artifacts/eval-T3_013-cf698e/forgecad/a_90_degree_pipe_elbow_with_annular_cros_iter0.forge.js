/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A 90-degree pipe elbow with annular cross-section swept along a quarter-circle arc in the XZ plane. Outer diameter 20mm, inner diameter 16mm, 2mm wall thickness. Bend centerline is a 40mm radius quarter-circle arc from origin heading +Z, curving to (40,0,40) heading +X.
 * Workflow ID : eval-T3_013-cf698e
 * Trace ID    : b625d4d6-83a6-4606-a2e8-2348a82668ec
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 60.0 × 20.0 × 60.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 16 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_013-cf698e/step/T3_013_outer0_attempt0.step
 *   STL    : artifact://eval-T3_013-cf698e/stl/T3_013_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Sweep an annular profile (OD=20mm, ID=16mm) along a quarter-circle arc path defined in the XZ plane. Arc center is at (0, 0, 40) in XYZ space, arc starts at (0, 0, 0) tangent to +Z direction and ends at (40, 0, 40) tangent to +X direction. The cross-section normal must remain perpendicular to the arc tangent at all points (Frenet-Serret frame). In CadQuery, use 'workplane XZ' to define the sweep path, create the arc with radiusArc from (0,0) to (40,40) with radius 40, then sweep the annular face. The bounding box spans X=[0,60], Y=[-10,10], Z=[0,60] accounting for the 10mm pipe radius extending beyond the arc endpoints. Volume estimate based on: pi/4*(20^2-16^2)*pi*40/2 ~ 7540 mm^3. Ensure the sweep uses makeRigid=False or equivalent so the cross-section stays normal to path.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 90-degree pipe elbow with annular cross-section swept along a quarter-circle arc in the XZ plane.
 * Outer diameter 20mm, inner diameter 16mm, 2mm wall thickness.
 * Bend centerline radius 40mm, arc from (0,0,0) heading +Z to (40,0,40) heading +X.
 *
 * Construction strategy:
 *   Since ForgeCAD has no native sweep, we approximate the elbow by stacking
 *   short toroidal segments. We build the elbow as:
 *     outerTorus - innerTorus  (both quarter-tori in the XZ plane)
 *   then cap with two short cylinders at each open end.
 *
 *   A torus of ring-radius R and tube-radius r, centered at origin with axis along Y,
 *   is built as: rotate a circle of radius r around the Y axis at distance R.
 *   In ForgeCAD we approximate this with a thick-walled torus by subtracting two tori.
 *
 *   Torus approximation: a full torus (ring R, tube r) swept 360° is
 *     cylinder(2r, R+r) - cylinder(2r, R-r)  stacked and revolved — not available.
 *
 *   Instead we use the direct approach:
 *     Build a full torus as revolution of a disc around an offset axis,
 *     approximated by many-step angular array of cylinders along the arc.
 *
 *   We use 8 angular steps (11.25° each) for the outer and inner solids,
 *   which is ≤12 boolean ops total and gives good approximation.
 *
 *   Each step: a short cylinder segment tangent to the arc, positioned correctly.
 */

// Parameters
const outerDiameter = Param.number("Outer Diameter", 20, { min: 10, max: 100, unit: "mm" });
const innerDiameter = Param.number("Inner Diameter", 16, { min: 5,  max: 90,  unit: "mm" });
const bendRadius    = Param.number("Bend Radius",    40, { min: 20, max: 200, unit: "mm" });
const numSteps      = 8; // fixed: 8 angular steps for the quarter-circle arc

const outerRadius = outerDiameter / 2;
const innerRadius = innerDiameter / 2;

// Arc spans 90 degrees; each step subtends stepAngle degrees
const stepAngleDeg = 90 / numSteps;
const stepAngleRad = (stepAngleDeg * Math.PI) / 180;

// Each cylindrical segment length along arc tangent
const segLength = bendRadius * stepAngleRad * 1.02; // slight overlap to avoid gaps

// Build one pipe segment (annular cylinder) for a given arc angle position.
// The arc is in the XZ plane. Arc center is at (bendRadius, 0, 0) = (40, 0, 0)
// Wait — re-reading the design: arc center is at (0, 0, 40).
// Arc starts at (0,0,0) heading +Z, ends at (40,0,40) heading +X.
// Arc center is at (40, 0, 0) — no:
//   Start (0,0,0), end (40,0,40), radius 40 in XZ plane.
//   Center must be equidistant from both points at radius 40.
//   From (0,0,0): center at distance 40.
//   From (40,0,40): center at distance 40.
//   Center = (40, 0, 0) — check: dist((40,0,0),(0,0,0))=40 ✓, dist((40,0,0),(40,0,40))=40 ✓
// So arc center in XZ plane is at X=40, Z=0.
// Parametric arc: angle measured from negative-X direction going upward in Z.
//   At angle=0: point is (40-40, 0, 0) = (0,0,0) ✓ heading in +Z direction ✓
//   At angle=90: point is (40, 0, 40) ✓ heading in +X direction ✓
// Point on arc at angle θ (degrees from start):
//   px = 40 - 40*cos(θ) = arcCx - R*cos(θ_rad)
//   pz = 40*sin(θ)      = R*sin(θ_rad)
// Tangent at angle θ (perpendicular to radius, pointing CCW):
//   tx = sin(θ),  tz = cos(θ)

// We build each segment as a short cylinder (outer) minus short cylinder (inner),
// placed at the midpoint of each arc segment, oriented along the tangent.

// Helper: build one segment (outer solid cylinder) at arc parameter midAngleDeg
// Returns a translated+rotated cylinder

// We'll build arrays of outer and inner cylinders, then union outer ones, union inner ones,
// then subtract inner from outer.
// 8 outer + 8 inner = 16 boolean ops total (within limit of 20).

const arcCx = bendRadius; // = 40
const arcCz = 0;

// Midpoint angles for each of the 8 segments
const a0 = stepAngleDeg * 0.5;  // 5.625°
const a1 = stepAngleDeg * 1.5;  // 16.875°
const a2 = stepAngleDeg * 2.5;  // 28.125°
const a3 = stepAngleDeg * 3.5;  // 39.375°
const a4 = stepAngleDeg * 4.5;  // 50.625°
const a5 = stepAngleDeg * 5.5;  // 61.875°
const a6 = stepAngleDeg * 6.5;  // 73.125°
const a7 = stepAngleDeg * 7.5;  // 84.375°

// Convert degrees to radians helper
const toRad = (deg) => deg * Math.PI / 180;

// For each segment mid-angle alpha (in degrees):
//   position: px = arcCx - bendRadius*cos(alpha), py = 0, pz = arcCz + bendRadius*sin(alpha)
//             but arcCz=0, arcCx=40
//   tangent direction: tx = sin(alpha), tz = cos(alpha)  (in XZ plane, Y=0)
//   We need to rotate a Z-axis-aligned cylinder to point along (sin(alpha), 0, cos(alpha))
//   Rotation: from [0,0,1] to [sin(alpha), 0, cos(alpha)]
//   This is a rotation in the XZ plane by angle alpha around the Y axis.
//   rotate([0,1,0], -alpha) maps +Z to (sin(alpha), 0, cos(alpha))  ← check:
//     rotate Y by -alpha: x' = cos(-alpha)*0 + sin(-alpha)*1 ... 
//     Actually rotate([0,1,0], alpha_deg) in right-hand: 
//       x' = x*cos + z*sin, z' = -x*sin + z*cos
//     For (0,0,1): x'=sin(alpha), z'=cos(alpha) ✓ if we use negative alpha convention.
//     Let's use rotate([0,1,0], -alpha) to get the tangent direction right.
//     rotate Y by angle A: new_x = cos(A)*old_x + sin(A)*old_z
//                          new_z = -sin(A)*old_x + cos(A)*old_z
//     (0,0,1) → (sin(A), 0, cos(A)) when A = alpha. So rotate([0,1,0], alpha).

// Build a single outer segment cylinder at mid-angle alpha (degrees)
// Cylinder axis along Z, height = segLength, radius = outerRadius
// Translate so cylinder center is at arc position, then rotate around Y by alpha

const buildOuterSeg = (alphaDeg) => {
    const alphaRad = toRad(alphaDeg);
    const px = arcCx - bendRadius * Math.cos(alphaRad);
    const pz = bendRadius * Math.sin(alphaRad);
    return cylinder(segLength, outerRadius)
        .rotate([0, 1, 0], alphaDeg)
        .translate(px, 0, pz);
};

const buildInnerSeg = (alphaDeg) => {
    const alphaRad = toRad(alphaDeg);
    const px = arcCx - bendRadius * Math.cos(alphaRad);
    const pz = bendRadius * Math.sin(alphaRad);
    return cylinder(segLength, innerRadius)
        .rotate([0, 1, 0], alphaDeg)
        .translate(px, 0, pz);
};

// Build 8 outer segments and union them
const o0 = buildOuterSeg(a0);
const o1 = buildOuterSeg(a1);
const o2 = buildOuterSeg(a2);
const o3 = buildOuterSeg(a3);
const o4 = buildOuterSeg(a4);
const o5 = buildOuterSeg(a5);
const o6 = buildOuterSeg(a6);
const o7 = buildOuterSeg(a7);

// Union all outer segments (7 union ops)
const outerSolid = o0.union(o1).union(o2).union(o3).union(o4).union(o5).union(o6).union(o7);

// Build 8 inner segments and union them (7 union ops)
const i0 = buildInnerSeg(a0);
const i1 = buildInnerSeg(a1);
const i2 = buildInnerSeg(a2);
const i3 = buildInnerSeg(a3);
const i4 = buildInnerSeg(a4);
const i5 = buildInnerSeg(a5);
const i6 = buildInnerSeg(a6);
const i7 = buildInnerSeg(a7);

// Union all inner segments (7 union ops)
const innerSolid = i0.union(i1).union(i2).union(i3).union(i4).union(i5).union(i6).union(i7);

// Subtract inner from outer to form annular elbow (1 subtract op)
const elbowShape = outerSolid.subtract(innerSolid);

// Apply color
const finalShape = elbowShape.color("#5f87c6");

return {
    "a-90-degree-pipe-elbow-with-annular-cros": finalShape,
};
