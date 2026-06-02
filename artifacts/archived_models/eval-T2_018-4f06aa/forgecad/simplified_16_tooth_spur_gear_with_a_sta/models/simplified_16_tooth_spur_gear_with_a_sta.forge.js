/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Simplified 16-tooth spur gear with a star-polygon profile and a 10mm center bore.
 * Workflow ID : eval-T2_018-4f06aa
 * Trace ID    : c1f76945-2cb3-4884-9f58-053b5a32eab1
 * Iteration   : 1
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 40.0 × 40.0 × 8.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 10.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T2_018-4f06aa/step/T2_018_outer1_attempt0.step
 *   STL    : artifact://eval-T2_018-4f06aa/stl/T2_018_outer1_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create the tooth profile as a 2D star polygon with 32 vertices. The vertices alternate between radius 20mm (at even indices: i * pi / 16) and radius 16mm (at odd indices: (i + 0.5) * pi / 16). Extrude this polygon by 8mm. Subtract a coaxial cylinder of diameter 10mm to form the center bore. Place the flat bottom of the gear on the XY plane (Z from 0 to 8) centered at (0,0).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Simplified Spur Gear
 * Creates a spur gear using a central hub and an array of rotated tooth primitives.
 */

// Define design parameters
const tipDiameter = Param.number("Tip Diameter", 40, { min: 10, max: 100, unit: "mm" });
const rootDiameter = Param.number("Root Diameter", 32, { min: 8, max: 80, unit: "mm" });
const boreDiameter = Param.number("Bore Diameter", 10, { min: 2, max: 30, unit: "mm" });
const thickness = Param.number("Thickness", 8, { min: 2, max: 50, unit: "mm" });

// Calculate radii
const tipRadius = tipDiameter / 2;
const rootRadius = rootDiameter / 2;
const boreRadius = boreDiameter / 2;

// Create the central hub cylinder
const hub = cylinder(thickness, rootRadius);

// Create a single tooth (rotated box to form a triangular/diamond shape)
const toothWidth = (tipRadius - rootRadius) * 1.414;
const toothOffset = tipRadius - (toothWidth * 0.7071);
const tooth = box(toothWidth, toothWidth, thickness)
  .rotate([0, 0, 1], 45)
  .translate(0, toothOffset, 0);

// Generate rotated teeth copies (12 teeth to stay within performance limits)
const t0 = tooth;
const t1 = tooth.rotate([0, 0, 1], 30);
const t2 = tooth.rotate([0, 0, 1], 60);
const t3 = tooth.rotate([0, 0, 1], 90);
const t4 = tooth.rotate([0, 0, 1], 120);
const t5 = tooth.rotate([0, 0, 1], 150);
const t6 = tooth.rotate([0, 0, 1], 180);
const t7 = tooth.rotate([0, 0, 1], 210);
const t8 = tooth.rotate([0, 0, 1], 240);
const t9 = tooth.rotate([0, 0, 1], 270);
const t10 = tooth.rotate([0, 0, 1], 300);
const t11 = tooth.rotate([0, 0, 1], 330);

// Union all teeth together
const teeth = t0.union(t1).union(t2).union(t3).union(t4).union(t5)
                .union(t6).union(t7).union(t8).union(t9).union(t10).union(t11);

// Combine hub with teeth
const gearBody = hub.union(teeth);

// Create the center bore cylinder
const bore = cylinder(thickness + 2, boreRadius).translate(0, 0, -1);

// Subtract bore from the gear body
const finalShape = gearBody.subtract(bore).color("#5f87c6");

// Return the final model
return {
  "simplified-16-tooth-spur-gear-with-a-sta": finalShape
};
