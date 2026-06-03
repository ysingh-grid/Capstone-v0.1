/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Quadcopter drone chassis in an H-frame configuration, lying flat on the XY plane with 3mm thickness, featuring two side rails, a center plate, four circular motor mounts, and eight drilled holes.
 * Workflow ID : eval-T3_020-189b9d
 * Trace ID    : cac7d8d9-5544-42ef-ba43-8d2c31dd421f
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 182.0 × 82.0 × 3.0 mm
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
 *   STEP   : artifact://eval-T3_020-189b9d/step/T3_020_outer0_attempt0.step
 *   STL    : artifact://eval-T3_020-189b9d/stl/T3_020_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the coordinate origin (0,0,0) is at the exact center of the frame on the bottom face (Z=0). The bounding box extends from X = -91 to +91 and Y = -41 to +41 due to the 22mm diameter motor mounts centered at (+/-80, +/-30). Use boolean operations to cleanly merge the rails, center plate, and mounts before subtracting the 8 through-holes.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Quadcopter H-frame drone chassis
 */

// Key design parameters exposed as UI sliders
const thickness = Param.number("Thickness", 3.0, { min: 1, max: 10, unit: "mm" });
const railLength = Param.number("Rail Length", 160.0, { min: 50, max: 300, unit: "mm" });
const railWidth = Param.number("Rail Width", 12.0, { min: 5, max: 30, unit: "mm" });
const railYOffset = Param.number("Rail Y Offset", 30.0, { min: 10, max: 100, unit: "mm" });
const centerPlateLength = Param.number("Center Plate Length", 50.0, { min: 10, max: 150, unit: "mm" });
const centerPlateWidth = Param.number("Center Plate Width", 72.0, { min: 20, max: 200, unit: "mm" });
const motorMountRadius = Param.number("Motor Mount Radius", 11.0, { min: 5, max: 25, unit: "mm" });
const motorHoleRadius = Param.number("Motor Hole Radius", 2.5, { min: 0.5, max: 10, unit: "mm" });
const mountHoleRadius = Param.number("Mounting Hole Radius", 1.6, { min: 0.5, max: 5, unit: "mm" });

// Side structural rails
const railL = box(railLength, railWidth, thickness).translate(0, -railYOffset, 0);
const railR = box(railLength, railWidth, thickness).translate(0, railYOffset, 0);

// Center structural connection plate
const center = box(centerPlateLength, centerPlateWidth, thickness);

// Circular motor mounts located at the ends of the rails
const mount1 = cylinder(thickness, motorMountRadius).translate(railLength / 2, railYOffset, 0);
const mount2 = cylinder(thickness, motorMountRadius).translate(railLength / 2, -railYOffset, 0);
const mount3 = cylinder(thickness, motorMountRadius).translate(-railLength / 2, railYOffset, 0);
const mount4 = cylinder(thickness, motorMountRadius).translate(-railLength / 2, -railYOffset, 0);

// Combine all primary structure elements into a single body
const base = railL
  .union(railR)
  .union(center)
  .union(mount1)
  .union(mount2)
  .union(mount3)
  .union(mount4);

// Prep slightly oversized cylinders for high quality boolean subtraction
const cutH = thickness + 2;

// Motor axis shaft holes
const mh1 = cylinder(cutH, motorHoleRadius).translate(railLength / 2, railYOffset, -1);
const mh2 = cylinder(cutH, motorHoleRadius).translate(railLength / 2, -railYOffset, -1);
const mh3 = cylinder(cutH, motorHoleRadius).translate(-railLength / 2, railYOffset, -1);
const mh4 = cylinder(cutH, motorHoleRadius).translate(-railLength / 2, -railYOffset, -1);

// M3 mounting holes centered on the middle platform
const ch1 = cylinder(cutH, mountHoleRadius).translate(10, 10, -1);
const ch2 = cylinder(cutH, mountHoleRadius).translate(10, -10, -1);
const ch3 = cylinder(cutH, mountHoleRadius).translate(-10, 10, -1);
const ch4 = cylinder(cutH, mountHoleRadius).translate(-10, -10, -1);

// Consolidate cutouts to streamline the geometry evaluation path
const allHoles = mh1
  .union(mh2)
  .union(mh3)
  .union(mh4)
  .union(ch1)
  .union(ch2)
  .union(ch3)
  .union(ch4);

// Final carbon fiber style composite chassis
const finalChassis = base.subtract(allHoles).color("#3a3d40");

return {
  "quadcopter-drone-chassis-in-an-h-frame-c": finalChassis,
};
