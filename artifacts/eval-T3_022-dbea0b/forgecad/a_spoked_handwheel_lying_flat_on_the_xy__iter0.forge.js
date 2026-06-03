/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A spoked handwheel lying flat on the XY plane, consisting of a central cylindrical hub with a through-hole, an outer ring rim, and four connecting rectangular spokes aligned along the X and Y axes.
 * Workflow ID : eval-T3_022-dbea0b
 * Trace ID    : e5af84f3-30fb-43a9-aebe-fecfeeafae43
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 100.0 × 100.0 × 12.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 14.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_022-dbea0b/step/T3_022_outer0_attempt0.step
 *   STL    : artifact://eval-T3_022-dbea0b/stl/T3_022_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the hub is centered at the origin from Z=0 to Z=12. The rim and spokes should be positioned from Z=0 to Z=8. The 4 spokes can be modeled as rectangular boxes of size 29mm x 8mm x 8mm positioned at the specified angles, perfectly bridging the gap between the hub (R=15) and rim (R=44).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Spoked Handwheel
 * A parametric spoked handwheel lying flat on the XY plane.
 */

// Define parameters for the handwheel
const hubDiameter = Param.number("Hub Diameter", 30, { min: 10, max: 100, unit: "mm" });
const hubHeight = Param.number("Hub Height", 12, { min: 5, max: 50, unit: "mm" });
const boreDiameter = Param.number("Bore Diameter", 14, { min: 5, max: 50, unit: "mm" });
const rimOuterDiameter = Param.number("Rim Outer Diameter", 100, { min: 50, max: 300, unit: "mm" });
const rimInnerDiameter = Param.number("Rim Inner Diameter", 88, { min: 40, max: 280, unit: "mm" });
const rimHeight = Param.number("Rim Height", 8, { min: 2, max: 50, unit: "mm" });
const spokeWidth = Param.number("Spoke Width", 8, { min: 2, max: 30, unit: "mm" });
const spokeHeight = Param.number("Spoke Height", 8, { min: 2, max: 50, unit: "mm" });

// Create the central solid hub
const hubOuter = cylinder(hubHeight, hubDiameter / 2);

// Create the outer rim by subtracting the inner cylinder from the outer cylinder
const rimOuter = cylinder(rimHeight, rimOuterDiameter / 2);
const rimInner = cylinder(rimHeight + 1, rimInnerDiameter / 2); // Slightly taller to ensure clean subtraction
const rim = rimOuter.subtract(rimInner);

// Create the two orthogonal spoke bars that bridge across the inner diameter
const spokeX = box(rimInnerDiameter, spokeWidth, spokeHeight);
const spokeY = box(spokeWidth, rimInnerDiameter, spokeHeight);

// Create the center bore hole
const bore = cylinder(hubHeight + 2, boreDiameter / 2).translate(0, 0, -1); // Extended for clean through-cut

// Combine the solid parts together and subtract the central bore
const wheelSolid = hubOuter.union(rim).union(spokeX).union(spokeY);
const finalWheel = wheelSolid.subtract(bore).color("#5f87c6");

// Return the final handwheel assembly
return {
  "a-spoked-handwheel-lying-flat-on-the-xy-": finalWheel,
};
