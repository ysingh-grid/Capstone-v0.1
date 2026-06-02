/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A solid wedge (triangular prism) centered at the origin, with a 60mm x 30mm base on the XY plane and a central ridge at Z=25mm.
 * Workflow ID : eval-T1_021-c74a9e
 * Trace ID    : 180da3cb-74bb-408b-9626-6f31a884eb3b
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 60.0 × 30.0 × 25.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_021-c74a9e/step/T1_021_outer0_attempt0.step
 *   STL    : artifact://eval-T1_021-c74a9e/stl/T1_021_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The wedge is a triangular prism. In the YZ plane, the cross-section is an isosceles triangle with a base of 30mm (from Y=-15 to Y=15 at Z=0) and an apex at Y=0, Z=25. This cross-section is extruded along the X-axis from X=-30 to X=30.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: Solid Wedge (Triangular Prism)
 * A parametric triangular prism symmetric along the Y-axis, centered at the origin.
 */

// Design Parameters
const baseLengthX = Param.number("Base Length X", 60, { min: 10, max: 500, unit: "mm" });
const baseWidthY = Param.number("Base Width Y", 30, { min: 10, max: 500, unit: "mm" });
const heightZ = Param.number("Height Z", 25, { min: 1, max: 200, unit: "mm" });

// Create the main bounding box centered on XY, extending up to heightZ
const mainBody = box(baseLengthX, baseWidthY, heightZ);

// Calculate the slope angle for the triangular faces
const slopeAngleRad = Math.atan2(heightZ, baseWidthY / 2);
const slopeAngleDeg = slopeAngleRad * 180 / Math.PI;

// Create an oversized cutter block to cleanly shear off the sides
const cutterWidth = baseWidthY * 3;
const cutterHeight = heightZ * 3;
const cutterLength = baseLengthX * 1.5;
const cutter = box(cutterLength, cutterWidth, cutterHeight);

// Rotate and translate the first cutter to align with the positive Y slope
const cutter1 = cutter.rotate([1, 0, 0], -slopeAngleDeg).translate(0, 0, heightZ);

// Mirror the cutter across the XZ plane to align with the negative Y slope
const cutter2 = cutter1.mirror([0, 1, 0]);

// Subtract both cutters from the main block to produce the perfect wedge
const wedge = mainBody.subtract(cutter1).subtract(cutter2);

// Return the final wedge part
return {
  "a-solid-wedge-(triangular-prism)-centere": wedge,
};
