/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Quadcopter drone H-frame chassis lying flat on the XY plane (Z=0 to Z=3) centered at the origin, featuring two parallel side rails, a center bridging plate, four circular motor mounts at the rail ends, and eight drilled holes (four motor shaft holes and four M3 mounting holes).
 * Workflow ID : eval-T3_020-da644c
 * Trace ID    : 6ec0fdd2-d38b-479d-bbc1-ac972471477a
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
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_020-da644c/step/T3_020_outer0_attempt0.step
 *   STL    : artifact://eval-T3_020-da644c/stl/T3_020_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The chassis is lying flat (Z=0 to Z=3). Side rails are centered at Y = -30 and Y = +30. The center plate is 50x72x3, centered at (0,0,1.5). The circular motor mounts are centered at (+/-80, +/-30). The 4 motor shaft holes (5mm diameter) are centered at (+/-80, +/-30). The 4 mounting holes (3.2mm diameter) are centered at (+/-10, +/-10). Ensure 3D boolean operations (unions and subtractions) are executed cleanly.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Quadcopter Drone H-Frame Chassis Model
 * Lying flat on the XY plane (Z=0 to Z=3), centered at the origin.
 */

// Define parameters for customisation in the ForgeCAD Studio
const thickness = Param.number("Thickness", 3, { min: 1, max: 10, unit: "mm" });
const railLength = Param.number("Rail Length", 160, { min: 50, max: 300, unit: "mm" });
const railWidth = Param.number("Rail Width", 12, { min: 5, max: 30, unit: "mm" });
const railYOffset = Param.number("Rail Y Offset", 30, { min: 10, max: 100, unit: "mm" });

const centerPlateLength = Param.number("Center Plate Length", 50, { min: 20, max: 150, unit: "mm" });
const centerPlateWidth = Param.number("Center Plate Width", 72, { min: 20, max: 200, unit: "mm" });

const motorMountDia = Param.number("Motor Mount Diameter", 22, { min: 10, max: 50, unit: "mm" });
const motorShaftDia = Param.number("Motor Shaft Diameter", 5, { min: 1, max: 10, unit: "mm" });
const mountingHoleDia = Param.number("Mounting Hole Diameter", 3.2, { min: 1, max: 8, unit: "mm" });

const motorMountRadius = motorMountDia / 2;
const motorShaftRadius = motorShaftDia / 2;
const mountingHoleRadius = mountingHoleDia / 2;

// Calculated positions based on symmetric layout
const halfRailLength = railLength / 2;
const halfPlateLength = centerPlateLength / 2;
const halfPlateWidth = centerPlateWidth / 2;

// Create side rails
const leftRail = box(railLength, railWidth, thickness).translate(0, -railYOffset, 0);
const rightRail = box(railLength, railWidth, thickness).translate(0, railYOffset, 0);
const rails = leftRail.union(rightRail);

// Create center bridging plate
const centerPlate = box(centerPlateLength, centerPlateWidth, thickness);
const frameBase = rails.union(centerPlate);

// Create four circular motor mounts
const mm1 = cylinder(thickness, motorMountRadius).translate(halfRailLength, railYOffset, 0);
const mm2 = cylinder(thickness, motorMountRadius).translate(halfRailLength, -railYOffset, 0);
const mm3 = cylinder(thickness, motorMountRadius).translate(-halfRailLength, railYOffset, 0);
const mm4 = cylinder(thickness, motorMountRadius).translate(-halfRailLength, -railYOffset, 0);

const mounts12 = mm1.union(mm2);
const mounts34 = mm3.union(mm4);
const allMounts = mounts12.union(mounts34);

// Combine the frame base structure with the motor mounts
const solidBody = frameBase.union(allMounts);

// Create cutter cylinders for the motor shaft holes (slightly taller than thickness for a clean cut)
const cutterHeight = thickness + 2;
const cutterZOffset = -1;

const h1 = cylinder(cutterHeight, motorShaftRadius).translate(halfRailLength, railYOffset, cutterZOffset);
const h2 = cylinder(cutterHeight, motorShaftRadius).translate(halfRailLength, -railYOffset, cutterZOffset);
const h3 = cylinder(cutterHeight, motorShaftRadius).translate(-halfRailLength, railYOffset, cutterZOffset);
const h4 = cylinder(cutterHeight, motorShaftRadius).translate(-halfRailLength, -railYOffset, cutterZOffset);

const shaftHoles12 = h1.union(h2);
const shaftHoles34 = h3.union(h4);
const allShaftHoles = shaftHoles12.union(shaftHoles34);

// Create cutter cylinders for the M3 mounting holes (at positions +/-10, +/-10)
const m1 = cylinder(cutterHeight, mountingHoleRadius).translate(10, 10, cutterZOffset);
const m2 = cylinder(cutterHeight, mountingHoleRadius).translate(10, -10, cutterZOffset);
const m3 = cylinder(cutterHeight, mountingHoleRadius).translate(-10, 10, cutterZOffset);
const m4 = cylinder(cutterHeight, mountingHoleRadius).translate(-10, -10, cutterZOffset);

const mHoles12 = m1.union(m2);
const mHoles34 = m3.union(m4);
const allMHoles = mHoles12.union(mHoles34);

// Combine all hole cutters
const allCutters = allShaftHoles.union(allMHoles);

// Perform final subtraction to drill all holes
const finalChassis = solidBody.subtract(allCutters).color("#4A4A4A");

// Return the final part mapped to the specific name
return {
  "quadcopter-drone-h-frame-chassis-lying-f": finalChassis,
};
