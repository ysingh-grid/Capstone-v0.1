/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A hollow 90-degree pipe elbow in the XZ plane, with a 20mm outer diameter, 16mm inner diameter, and a 40mm bend radius, created by sweeping an annular cross-section along a quarter-circle arc.
 * Workflow ID : eval-T3_013-ccb740
 * Trace ID    : eaeb2f49-4b69-423d-a76d-ceaa8691b731
 * Iteration   : 5
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 50.0 × 20.0 × 50.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 16.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_013-ccb740/step/T3_013_outer5_attempt1.step
 *   STL    : artifact://eval-T3_013-ccb740/stl/T3_013_outer5_attempt1.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The profile sketch should be created on the XY plane centered at (0,0,0) with concentric circles of diameters 20mm and 16mm. The sweep path should be sketched on the XZ plane as a 40mm radius arc starting at (0,0) and ending at (40,40) with the arc center at (40,0).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * A hollow 90-degree pipe elbow in the XZ plane.
 * Follows a quarter-circle arc of a given bend radius.
 */

// User-adjustable parameters
const bendRadius = Param.number("Bend Radius", 40, { min: 10, max: 200, unit: "mm" });
const outerDiameter = Param.number("Outer Diameter", 20, { min: 5, max: 100, unit: "mm" });
const innerDiameter = Param.number("Inner Diameter", 16, { min: 2, max: 95, unit: "mm" });

// Calculate radii from diameters
const rOut = outerDiameter / 2;
const rIn = innerDiameter / 2;

// Create the outer and inner tori representing the full circular sweep
const outerTorus = torus(bendRadius, rOut);
const innerTorus = torus(bendRadius, rIn);

// Subtract the inner torus from the outer torus to make it hollow
const hollowTorus = outerTorus.subtract(innerTorus);

// Rotate the torus from the XY plane to the XZ plane
const orientedTorus = hollowTorus.rotate([1, 0, 0], 90);

// Translate the torus so the sweep start is at the origin (0, 0, 0)
const positionedTorus = orientedTorus.translate(bendRadius, 0, 0);

// Define a box to clip the torus to a 90-degree segment (X <= bendRadius, Z >= 0)
const clipWidth = bendRadius * 4;
const clipDepth = outerDiameter * 4;
const clipHeight = bendRadius * 4;
const clipper = box(clipWidth, clipDepth, clipHeight).translate(-bendRadius, 0, 0);

// Intersect the torus with the clipper to get the final 90-degree elbow shape
const finalElbow = positionedTorus.intersect(clipper).color("#3a86ff");

// Return the final shape
return {
  "a-hollow-90-degree-pipe-elbow-in-the-xz-": finalElbow,
};
