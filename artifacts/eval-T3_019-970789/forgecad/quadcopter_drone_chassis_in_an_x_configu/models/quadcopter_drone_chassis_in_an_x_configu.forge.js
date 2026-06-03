/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Quadcopter drone chassis in an X configuration with a central hub, four diagonal arms, motor mounts, and mounting/shaft holes.
 * Workflow ID : eval-T3_019-970789
 * Trace ID    : 2dfd7206-50c7-4b6a-8adc-6908ba577106
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 116.0 × 116.0 × 3.0 mm
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
 *   STEP   : artifact://eval-T3_019-970789/step/T3_019_outer0_attempt0.step
 *   STL    : artifact://eval-T3_019-970789/stl/T3_019_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create the central hub at the origin. Rotate workplanes by 45, 135, 225, and 315 degrees to construct the arms and motor mounts precisely. The arms should start from radial distance 18mm and end at 73mm. Construct the motor mounts (diameter 18mm) centered at radial distance 73mm. Cut the 5mm shaft holes centered on the mounts. Cut the four 3.2mm mounting holes in a 20x20mm square pattern centered at the origin (at X=±10, Y=±10).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Quadcopter Drone Chassis in X-Configuration
 * Fully parametric model of a lightweight drone frame.
 */

// --- PARAMETERS ---
const thickness = Param.number("Thickness", 3, { min: 1, max: 10, unit: "mm" });
const hubDia = Param.number("Hub Diameter", 36, { min: 20, max: 100, unit: "mm" });
const armLen = Param.number("Arm Length", 55, { min: 20, max: 150, unit: "mm" });
const armWid = Param.number("Arm Width", 10, { min: 5, max: 30, unit: "mm" });
const motorMountDia = Param.number("Motor Mount Diameter", 18, { min: 10, max: 40, unit: "mm" });
const motorShaftDia = Param.number("Motor Shaft Hole Diameter", 5, { min: 1, max: 10, unit: "mm" });
const mountPitch = Param.number("Mounting Hole Pitch", 20, { min: 10, max: 50, unit: "mm" });
const mountHoleDia = Param.number("Mounting Hole Diameter", 3.2, { min: 1, max: 8, unit: "mm" });

// --- DERIVED VALUES ---
const hubRad = hubDia / 2;
const motorMountRad = motorMountDia / 2;
const motorShaftRad = motorShaftDia / 2;
const mountHoleRad = mountHoleDia / 2;
const armCenter = hubRad + (armLen / 2);
const motorMountCenter = hubRad + armLen;
const holeOffset = mountPitch / 2;
const cutHeight = thickness + 2;

// --- BASE COMPONENTS ---
// Central hub base disc
const hub = cylinder(thickness, hubRad);

// Individual arm assembly pointing along +X
const armBar = box(armLen, armWid, thickness).translate(armCenter, 0, 0);
const motorMount = cylinder(thickness, motorMountRad).translate(motorMountCenter, 0, 0);
const motorShaftHole = cylinder(cutHeight, motorShaftRad).translate(motorMountCenter, 0, -1);

// Combine arm bar, motor mount, and subtract the shaft hole to make a single arm unit
const singleArm = armBar.union(motorMount).subtract(motorShaftHole);

// Rotate the arm unit into 4 symmetric positions (45, 135, 225, 315 degrees)
const arm1 = singleArm.rotate([0, 0, 1], 45);
const arm2 = singleArm.rotate([0, 0, 1], 135);
const arm3 = singleArm.rotate([0, 0, 1], 225);
const arm4 = singleArm.rotate([0, 0, 1], 315);

// Union all arms to the central hub
const chassisWithArms = hub.union(arm1).union(arm2).union(arm3).union(arm4);

// Create the 4 hub mounting holes in a square pattern
const hole1 = cylinder(cutHeight, mountHoleRad).translate(holeOffset, holeOffset, -1);
const hole2 = cylinder(cutHeight, mountHoleRad).translate(-holeOffset, holeOffset, -1);
const hole3 = cylinder(cutHeight, mountHoleRad).translate(holeOffset, -holeOffset, -1);
const hole4 = cylinder(cutHeight, mountHoleRad).translate(-holeOffset, -holeOffset, -1);

// Subtract mounting holes from the chassis
const finalChassis = chassisWithArms
  .subtract(hole1)
  .subtract(hole2)
  .subtract(hole3)
  .subtract(hole4)
  .color("#5f87c6");

// Return the final assembly
return {
  "quadcopter-drone-chassis-in-an-x-configu": finalChassis,
};
