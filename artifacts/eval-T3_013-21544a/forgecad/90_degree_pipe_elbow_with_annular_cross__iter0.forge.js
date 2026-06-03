/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : 90-degree pipe elbow with annular cross-section swept along a quarter-circle arc in the XZ plane. Outer diameter 20mm, inner diameter 16mm (2mm wall), bend centerline radius 40mm.
 * Workflow ID : eval-T3_013-21544a
 * Trace ID    : b14598d0-47de-4183-bcae-cc167fbf9264
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
 *   STEP   : artifact://eval-T3_013-21544a/step/T3_013_outer0_attempt0.step
 *   STL    : artifact://eval-T3_013-21544a/stl/T3_013_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Sweep an annular profile (outer radius 10mm, inner radius 8mm) along a quarter-circle arc of radius 40mm in the XZ plane. Arc center is at (0, 0, 40) in XYZ space. Arc starts at (0, 0, 0) with tangent in +Z direction and ends at (40, 0, 40) with tangent in +X direction. The cross-section plane must be kept normal to the arc tangent throughout the sweep (Frenet-Serret frame). The bounding box spans X=[0,60], Y=[-10,10], Z=[0,60] accounting for the 10mm outer radius added to both ends of the centerline arc. Ensure the sweep uses a radiusArc (sagitta-based or center-point arc) correctly: the arc is a true circular arc, not a polyline approximation. CadQuery: use the workplane XZ, draw the arc with radiusArc from (0,0) to (40,40) with radius 40, then sweep the annular wire profile along this path with normal='frenet'. Volume estimate: pi*(10^2 - 8^2)*2*pi*40/4 = pi*36*20*pi ≈ 7117 mm^3 (analytic); allow up to 5% deviation.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 90-Degree Pipe Elbow - Annular cross-section swept along a quarter-circle arc
 * Arc in the XZ plane, bend radius 40mm, OD=20mm, ID=16mm
 *
 * Strategy: Approximate the swept elbow using a torus sector (toroidal shell).
 * A full torus with major radius R=40, minor radius r=10 (outer) minus
 * a full torus with major radius R=40, minor radius r=8 (inner),
 * then intersect with a wedge volume to extract the 90-degree sector.
 * The torus axis is along Y, centered at the arc center (0, 0, 40) in XYZ.
 * After extraction, the result spans X=[0,40+r], Z=[0,40+r] with Y=[-r,r].
 */

// Parameters
const outerDiameter = Param.number("Outer Diameter", 20, { min: 10, max: 100, unit: "mm" });
const innerDiameter = Param.number("Inner Diameter", 16, { min: 6,  max: 90,  unit: "mm" });
const bendRadius    = Param.number("Bend Radius",    40, { min: 20, max: 200, unit: "mm" });

// Derived radii
const outerR = outerDiameter / 2; // 10mm
const innerR = innerDiameter / 2; // 8mm

// The torus major radius equals the bend centerline radius
const majorR = bendRadius; // 40mm

// Build the outer torus shell: torus with major radius 40, minor radius 10
// A torus is approximated as a large cylinder minus a smaller bored cylinder
// using a box-based intersection to carve out the toroidal shape.
// Best approach with ForgeCAD primitives: revolve a disk-annulus via stacked
// boolean ops on cylinder segments placed along the arc.

// We'll use 8 arc segments (each 11.25 degrees) to approximate the 90-degree sweep.
// Segment count is kept at 8 to stay within the 20 boolean op limit.
// Each segment: a short cylinder section tilted along the arc.

const numSegs = 8;
const segAngleDeg = 90 / numSegs; // 11.25 degrees per segment
const segAngleRad = (segAngleDeg * Math.PI) / 180;

// Arc length per segment for the centerline
const segArcLen = majorR * segAngleRad; // ~5.497mm per segment

// The segment is a short cylinder (annular tube approximation):
// Use a thick cylinder (outer) minus thin cylinder (inner) = annular disk
// then place it at the midpoint angle of each segment along the arc.

// Build one annular segment (outer cylinder minus inner cylinder)
// Height = segArcLen, placed and rotated to each arc position

// Helper: build an annular disk (short tube segment)
const makeSegOuter = (h) => cylinder(h, outerR);
const makeSegInner = (h) => cylinder(h, innerR);

// Each segment: annular cylinder, oriented so its axis is tangent to the arc
// Arc is in XZ plane, arc center at (0, 0, 40), starts at (0,0,0) heading +Z,
// ends at (40,0,40) heading +X.
// Parameterize by angle theta from 0 to 90 degrees, measured from -Z axis at arc center.
// At theta=0: point is (0,0,0), tangent is +Z
// At theta=90: point is (40,0,40), tangent is +X
// Position along arc: x = 40 - 40*cos(theta), z = 40 - 40*sin(theta)... 
// Actually: arc center is (0,0,40).
// Point on arc at angle theta (0=start, 90=end):
//   x = arcCx + majorR * sin(theta) = 0 + 40*sin(theta)
//   z = arcCz - majorR * cos(theta) = 40 - 40*cos(theta)
// Tangent direction at theta: dx/dtheta = 40*cos(theta), dz/dtheta = 40*sin(theta)
// Normalized tangent: (cos(theta), 0, sin(theta))

// For each segment i, midpoint angle = (i + 0.5) * segAngleDeg
// Cylinder default axis is +Z. We need to rotate it to align with tangent.
// Tangent at theta: (cos(theta), 0, sin(theta))
// Rotate cylinder: default +Z -> tangent direction
// Rotation needed: rotate around Y axis by -theta (so Z tips toward +X as theta increases)

// Then translate to midpoint on arc, minus half segment length along tangent direction

const buildSegment = (i, r) => {
    const thetaDeg = (i + 0.5) * segAngleDeg;
    const thetaRad = (thetaDeg * Math.PI) / 180;
    // Midpoint on arc centerline
    const mx = majorR * Math.sin(thetaRad);
    const mz = majorR - majorR * Math.cos(thetaRad);
    // Cylinder created along Z, rotate around Y by -thetaDeg to align tangent
    return cylinder(segArcLen * 1.05, r)
        .rotate([0, 1, 0], -thetaDeg)
        .translate(mx, 0, mz);
};

// Build 8 outer segments, union them together (pairs to reduce op count)
const outerSeg0 = buildSegment(0, outerR);
const outerSeg1 = buildSegment(1, outerR);
const outerSeg2 = buildSegment(2, outerR);
const outerSeg3 = buildSegment(3, outerR);
const outerSeg4 = buildSegment(4, outerR);
const outerSeg5 = buildSegment(5, outerR);
const outerSeg6 = buildSegment(6, outerR);
const outerSeg7 = buildSegment(7, outerR);

// Union outer segments in pairs (4 ops), then pairs of pairs (2 ops), then final (1 op)
const outerA = outerSeg0.union(outerSeg1);
const outerB = outerSeg2.union(outerSeg3);
const outerC = outerSeg4.union(outerSeg5);
const outerD = outerSeg6.union(outerSeg7);
const outerAB = outerA.union(outerB);
const outerCD = outerC.union(outerD);
const outerTube = outerAB.union(outerCD);

// Build 8 inner segments for subtraction
const innerSeg0 = buildSegment(0, innerR);
const innerSeg1 = buildSegment(1, innerR);
const innerSeg2 = buildSegment(2, innerR);
const innerSeg3 = buildSegment(3, innerR);
const innerSeg4 = buildSegment(4, innerR);
const innerSeg5 = buildSegment(5, innerR);
const innerSeg6 = buildSegment(6, innerR);
const innerSeg7 = buildSegment(7, innerR);

// Union inner segments similarly
const innerA = innerSeg0.union(innerSeg1);
const innerB = innerSeg2.union(innerSeg3);
const innerC = innerSeg4.union(innerSeg5);
const innerD = innerSeg6.union(innerSeg7);
const innerAB = innerA.union(innerB);
const innerCD = innerC.union(innerD);
const innerTube = innerAB.union(innerCD);

// Subtract inner from outer to create hollow annular elbow
const finalShape = outerTube.subtract(innerTube).color("#5f87c6");

return {
    "90-degree-pipe-elbow-with-annular-cross-": finalShape,
};
