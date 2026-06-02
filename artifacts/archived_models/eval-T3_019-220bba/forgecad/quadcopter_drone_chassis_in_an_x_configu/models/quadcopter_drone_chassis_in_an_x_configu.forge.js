/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Quadcopter drone chassis in an X configuration, featuring a central disc hub, four diagonal arms, outer motor mount platforms, and necessary mounting and shaft holes.
 * Workflow ID : eval-T3_019-220bba
 * Trace ID    : 1d1f976d-8d92-4cce-9ab5-3a45edba9c33
 * Iteration   : 1
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 121.24 × 121.24 × 3.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 10.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_019-220bba/step/T3_019_outer1_attempt0.step
 *   STL    : artifact://eval-T3_019-220bba/stl/T3_019_outer1_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Recommend using rotated workplanes or coordinate transformations (polar rotation of 45, 135, 225, 315 degrees) to define the arms and motor mounts. Ensure all solid bodies are boolean-unioned into a single manifold chassis before subtracting the 4 central mounting holes and the 4 motor shaft holes. Coordinates of motor mounts are at (±51.62, ±51.62) on the XY plane. Center of the chassis is at (0,0,1.5) if Z ranges from 0 to 3.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Quadcopter Drone Chassis in an X Configuration
 * Centered at the origin, lying flat on the XY plane.
 */

// Define parametric dimensions
const thickness = Param.number("Chassis Thickness", 3.0, { min: 1.0, max: 10.0, unit: "mm" });
const hubDiameter = Param.number("Hub Diameter", 36.0, { min: 10.0, max: 100.0, unit: "mm" });
const armLength = Param.number("Arm Length", 55.0, { min: 10.0, max: 150.0, unit: "mm" });
const armWidth = Param.number("Arm Width", 10.0, { min: 2.0, max: 30.0, unit: "mm" });
const motorMountDiameter = Param.number("Motor Mount Diameter", 18.0, { min: 5.0, max: 50.0, unit: "mm" });
const motorMountDistance = Param.number("Motor Mount Distance", 73.0, { min: 20.0, max: 200.0, unit: "mm" });
const motorShaftDiameter = Param.number("Motor Shaft Hole Diameter", 5.0, { min: 1.0, max: 10.0, unit: "mm" });
const hubMountSpacing = Param.number("Hub Mounting Hole Spacing", 20.0, { min: 5.0, max: 50.0, unit: "mm" });
const hubMountDiameter = Param.number("Hub Mounting Hole Diameter", 3.2, { min: 1.0, max: 10.0, unit: "mm" });

// Calculate helper values
const hubRadius = hubDiameter / 2.0;
const armCenterPos = hubRadius + armLength / 2.0;
const hubMountOffset = hubMountSpacing / 2.0;

// Create the central hub
const centralHub = cylinder(thickness, hubRadius);

// Base components for a single arm branch pointing along the +X axis
const singleArmRect = box(armLength, armWidth, thickness).translate(armCenterPos, 0, 0);
const singleMotorMount = cylinder(thickness, motorMountDiameter / 2.0).translate(motorMountDistance, 0, 0);
const singleArmSolid = singleArmRect.union(singleMotorMount);

// Shaft hole template (height extended for a clean through-cut)
const singleShaftHole = cylinder(thickness + 2.0, motorShaftDiameter / 2.0).translate(motorMountDistance, 0, -1.0);

// Rotate the arms and shaft holes to 45, 135, 225, and 315 degrees
const arm45 = singleArmSolid.rotate([0, 0, 1], 45);
const arm135 = singleArmSolid.rotate([0, 0, 1], 135);
const arm225 = singleArmSolid.rotate([0, 0, 1], 225);
const arm315 = singleArmSolid.rotate([0, 0, 1], 315);

const shaftHole45 = singleShaftHole.rotate([0, 0, 1], 45);
const shaftHole135 = singleShaftHole.rotate([0, 0, 1], 135);
const shaftHole225 = singleShaftHole.rotate([0, 0, 1], 225);
const shaftHole315 = singleShaftHole.rotate([0, 0, 1], 315);

// Union all solid body parts together
let chassisSolid = centralHub
  .union(arm45)
  .union(arm135)
  .union(arm225)
  .union(arm315);

// Create the four central mounting holes
const hubHole1 = cylinder(thickness + 2.0, hubMountDiameter / 2.0).translate(hubMountOffset, hubMountOffset, -1.0);
const hubHole2 = cylinder(thickness + 2.0, hubMountDiameter / 2.0).translate(-hubMountOffset, hubMountOffset, -1.0);
const hubHole3 = cylinder(thickness + 2.0, hubMountDiameter / 2.0).translate(-hubMountOffset, -hubMountOffset, -1.0);
const hubHole4 = cylinder(thickness + 2.0, hubMountDiameter / 2.0).translate(hubMountOffset, -hubMountOffset, -1.0);

// Subtract motor shaft holes and central mounting holes from the chassis
let chassisWithHoles = chassisSolid
  .subtract(shaftHole45)
  .subtract(shaftHole135)
  .subtract(shaftHole225)
  .subtract(shaftHole315)
  .subtract(hubHole1)
  .subtract(hubHole2)
  .subtract(hubHole3)
  .subtract(hubHole4)
  .color("#4a4a4a"); // Apply a sleek dark grey color

// Return the final quadcopter chassis assembly
return {
  "quadcopter-drone-chassis-in-an-x-configu": chassisWithHoles,
};
