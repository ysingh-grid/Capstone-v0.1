/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Quadcopter drone chassis in a plus (+) configuration, 3mm thick, featuring a central square hub, four extending arms, circular motor mounts with shaft holes, and flight controller mounting holes.
 * Workflow ID : eval-T3_018-588b68
 * Trace ID    : df349a53-d1ba-4bfe-b180-2d94122c8dc7
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 138.0 × 138.0 × 3.0 mm
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
 *   STEP   : artifact://eval-T3_018-588b68/step/T3_018_outer0_attempt0.step
 *   STL    : artifact://eval-T3_018-588b68/stl/T3_018_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure that the four arms are modeled precisely along the X and Y axes, merging seamlessly with the central hub and the motor mount circles at their tips. The flight controller holes must be placed at (+-10, +-10) in the XY plane, and all holes must be aligned and cut entirely through the 3mm thickness (Z=0 to Z=3).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Quadcopter Drone Chassis in a Plus (+) Configuration
 * Modeled parametrically with a central hub, arms, motor mounts, and FC mounting holes.
 */

// --- Parameters ---
const thickness = Param.number("Thickness", 3.0, { min: 1, max: 10, unit: "mm" });
const hubSize = Param.number("Hub Size", 30.0, { min: 10, max: 100, unit: "mm" });
const armLength = Param.number("Arm Length", 45.0, { min: 10, max: 200, unit: "mm" });
const armWidth = Param.number("Arm Width", 10.0, { min: 5, max: 50, unit: "mm" });
const motorMountDia = Param.number("Motor Mount Diameter", 18.0, { min: 5, max: 50, unit: "mm" });
const motorShaftDia = Param.number("Motor Shaft Diameter", 5.0, { min: 1, max: 20, unit: "mm" });
const fcHoleDia = Param.number("FC Hole Diameter", 3.2, { min: 1, max: 10, unit: "mm" });
const fcPatternSize = Param.number("FC Pattern Size", 20.0, { min: 5, max: 80, unit: "mm" });

// --- Derivations ---
const armSpan = hubSize + (armLength * 2);
const motorMountRadius = motorMountDia / 2;
const motorMountDist = (hubSize / 2) + armLength;
const motorShaftRadius = motorShaftDia / 2;
const fcHoleRadius = fcHoleDia / 2;
const fcOffset = fcPatternSize / 2;
const holeHeight = thickness + 2.0; // Extend slightly for clean subtraction

// --- Base Components ---
// Central square hub
const hub = box(hubSize, hubSize, thickness);

// Arm structures crossing the hub
const armX = box(armSpan, armWidth, thickness);
const armY = box(armWidth, armSpan, thickness);

// Circular motor mount platforms at the arm tips
const mount1 = cylinder(thickness, motorMountRadius).translate(motorMountDist, 0, 0);
const mount2 = cylinder(thickness, motorMountRadius).translate(-motorMountDist, 0, 0);
const mount3 = cylinder(thickness, motorMountRadius).translate(0, motorMountDist, 0);
const mount4 = cylinder(thickness, motorMountRadius).translate(0, -motorMountDist, 0);

// --- Assemble Solid Body ---
const solidBody = hub
  .union(armX)
  .union(armY)
  .union(mount1)
  .union(mount2)
  .union(mount3)
  .union(mount4);

// --- Cutter Geometries ---
// Central motor shaft holes
const shaftHole1 = cylinder(holeHeight, motorShaftRadius).translate(motorMountDist, 0, -1);
const shaftHole2 = cylinder(holeHeight, motorShaftRadius).translate(-motorMountDist, 0, -1);
const shaftHole3 = cylinder(holeHeight, motorShaftRadius).translate(0, motorMountDist, -1);
const shaftHole4 = cylinder(holeHeight, motorShaftRadius).translate(0, -motorMountDist, -1);

// Flight controller mounting holes
const fcHole1 = cylinder(holeHeight, fcHoleRadius).translate(fcOffset, fcOffset, -1);
const fcHole2 = cylinder(holeHeight, fcHoleRadius).translate(-fcOffset, fcOffset, -1);
const fcHole3 = cylinder(holeHeight, fcHoleRadius).translate(fcOffset, -fcOffset, -1);
const fcHole4 = cylinder(holeHeight, fcHoleRadius).translate(-fcOffset, -fcOffset, -1);

// --- Subtraction and Finalization ---
const finalChassis = solidBody
  .subtract(shaftHole1)
  .subtract(shaftHole2)
  .subtract(shaftHole3)
  .subtract(shaftHole4)
  .subtract(fcHole1)
  .subtract(fcHole2)
  .subtract(fcHole3)
  .subtract(fcHole4)
  .color("#2c2c2c"); // Sleek carbon fiber / dark plastic look

// --- Return Output ---
return {
  "quadcopter-drone-chassis-in-a-plus-(+)-c": finalChassis,
};
