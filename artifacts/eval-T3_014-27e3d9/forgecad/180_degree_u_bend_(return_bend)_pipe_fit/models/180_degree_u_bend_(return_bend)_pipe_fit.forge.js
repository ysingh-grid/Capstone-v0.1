/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : 180-degree U-bend (return bend) pipe fitting swept in the XZ plane, with two parallel vertical legs 70mm apart and a semicircular crown of 35mm centerline radius.
 * Workflow ID : eval-T3_014-27e3d9
 * Trace ID    : b1bda656-7a38-4ac4-8900-14edc334d9f6
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 70.0 × 20.0 × 55.0 mm
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
 *   STEP   : artifact://eval-T3_014-27e3d9/step/T3_014_outer0_attempt0.step
 *   STL    : artifact://eval-T3_014-27e3d9/stl/T3_014_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Sweep an annular profile (OD=20mm, ID=16mm) along a 180-degree arc path in the XZ plane. Arc center is at (35, 0, 0), radius=35mm, starting at (0,0,0) sweeping counterclockwise (through apex at (35,0,35)) to endpoint (70,0,0). The sweep normal/profile plane must remain perpendicular to the arc tangent at each point. In CadQuery use a workplane on the XZ plane, define a radiusArc from (0,0) to (70,0) with sagitta/radius=35, then sweep the annular face. The overall bounding box Z dimension is 35mm (centerline) + 10mm (pipe OD radius) = 45mm total Z height; X span is 70mm + 10mm (half OD each side) = 80mm but centerline legs are exactly at X=0 and X=70. Verify open pipe bore is clear at both leg terminations. No fillets or end caps required unless specified.
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
 * Swept in the XZ plane with OD=20mm, ID=16mm, bend radius=35mm
 */

// Parameters
const outerDiameter = Param.number("Outer Diameter", 20, { min: 10, max: 100, unit: "mm" });
const innerDiameter = Param.number("Inner Diameter", 16, { min: 6,  max: 90,  unit: "mm" });
const bendRadius    = Param.number("Bend Radius",    35, { min: 15, max: 150, unit: "mm" });
const legLength     = Param.number("Leg Length",     30, { min: 5,  max: 200, unit: "mm" });

// Derived values
const outerR = outerDiameter / 2;  // 10mm
const innerR = innerDiameter / 2;  // 8mm

// ── Crown (toroidal half-ring in XZ plane) ────────────────────────────────────
// Approximate the 180-degree swept annulus with a torus intersected by a half-space,
// then subtract the inner torus bore.

// Outer torus half: torus with major=bendRadius, minor=outerR
// We build it as a cylinder shell rotated, but ForgeCAD has no torus primitive.
// Strategy: build the crown from stacked arc-segment cylinders (max 12 explicit).

// We use 12 angular steps over 180 degrees for the crown approximation.
// Each segment is a short cylinder placed along the arc and rotated to follow tangent.

const seg = Math.PI * bendRadius / 12; // arc length per step (~9.16mm)

// Helper: build one pipe-ring segment (annular disk of thickness=seg)
// The outer shell minus inner bore for one slice
const makeSlice = (angleDeg) => {
  const angleRad = angleDeg * Math.PI / 180;
  // Center of this slice on the arc
  const cx = bendRadius - bendRadius * Math.cos(angleRad); // X: 0 at angle=0, 2*R at angle=180
  const cz = bendRadius * Math.sin(angleRad);              // Z: peaks at angle=90

  // Outer cylinder for slice
  const outerCyl = cylinder(seg + 0.1, outerR);
  // Inner cylinder (bore) for slice
  const innerCyl = cylinder(seg + 0.2, innerR);
  // Annular slice
  const annSlice = outerCyl.subtract(innerCyl);

  // The slice axis must be tangent to the arc at this angle.
  // Arc tangent direction at angle: (sin(angle), 0, cos(angle)) in XZ plane.
  // cylinder() axis is +Z by default, so we rotate to align with tangent.
  // Tangent vector: dx=sin(angle), dz=cos(angle) → rotate around Y axis by -angleDeg
  // (rotating +Z toward +X by angleDeg means rotate([0,1,0], -angleDeg))
  const oriented = annSlice.rotate([0, 1, 0], -angleDeg);

  // Translate to arc center position, offset by half-seg along tangent to center slice
  const halfSeg = seg / 2;
  const tx = cx + halfSeg * Math.sin(angleRad);
  const tz = cz + halfSeg * Math.cos(angleRad);

  return oriented.translate(tx, 0, tz);
};

// 12 segments at midpoints: angles 7.5, 22.5, 37.5, ... 172.5
const s0  = makeSlice(7.5);
const s1  = makeSlice(22.5);
const s2  = makeSlice(37.5);
const s3  = makeSlice(52.5);
const s4  = makeSlice(67.5);
const s5  = makeSlice(82.5);
const s6  = makeSlice(97.5);
const s7  = makeSlice(112.5);
const s8  = makeSlice(127.5);
const s9  = makeSlice(142.5);
const s10 = makeSlice(157.5);
const s11 = makeSlice(172.5);

// Union crown segments in pairs to stay within boolean budget
const crownA = s0.union(s1).union(s2).union(s3);
const crownB = s4.union(s5).union(s6).union(s7);
const crownC = s8.union(s9).union(s10).union(s11);
const crown  = crownA.union(crownB).union(crownC);

// ── Left leg at X=0, running in +Z direction (from Z=-legLength to Z=0) ──────
const leftOuter = cylinder(legLength, outerR).translate(0, 0, -legLength / 2);
const leftInner = cylinder(legLength + 0.1, innerR).translate(0, 0, -legLength / 2);
const leftLeg   = leftOuter.subtract(leftInner);

// ── Right leg at X=2*bendRadius=70, running in +Z direction ──────────────────
const rightOuter = cylinder(legLength, outerR).translate(2 * bendRadius, 0, -legLength / 2);
const rightInner = cylinder(legLength + 0.1, innerR).translate(2 * bendRadius, 0, -legLength / 2);
const rightLeg   = rightOuter.subtract(rightInner);

// ── Combine all parts ─────────────────────────────────────────────────────────
const allParts = crown.union(leftLeg).union(rightLeg);

// Color the part
const finalShape = allParts.color("#5f87c6");

return {
  "180-degree-u-bend-(return-bend)-pipe-fit": finalShape,
};
