/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A quadcopter drone chassis in a plus (+) configuration with a central square hub, four extending arms, outer motor mount platforms, and pre-drilled holes for motors and a flight controller.
 * Workflow ID : eval-T3_018-cafb39
 * Trace ID    : b133345c-bc63-4eb0-bf4b-df80a218cf29
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
 *   STEP   : artifact://eval-T3_018-cafb39/step/T3_018_outer0_attempt0.step
 *   STL    : artifact://eval-T3_018-cafb39/stl/T3_018_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the arms and central hub are merged seamlessly into a single solid before subtracting the holes. The motor mounts are centered at (±60, 0, 1.5) and (0, ±60, 1.5). The flight controller holes should be at coordinates (±10, ±10) on the XY plane.
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
 *
 * This model defines a lightweight, parametric drone chassis with a central square hub,
 * four extending rectangular arms, motor mount platforms at the tips, and pre-drilled
 * mounting holes for both the motors and a standard flight controller.
 */

// --- PARAMETERS ---
const hubSize = Param.number("Hub Size", 30, { min: 10, max: 100, unit: "mm" });
const hubThickness = Param.number("Hub Thickness", 3, { min: 1, max: 10, unit: "mm" });
const armLength = Param.number("Arm Length", 45, { min: 10, max: 150, unit: "mm" });
const armWidth = Param.number("Arm Width", 10, { min: 4, max: 30, unit: "mm" });
const motorMountDia = Param.number("Motor Mount Dia", 18, { min: 8, max: 40, unit: "mm" });
const motorShaftDia = Param.number("Motor Shaft Dia", 5, { min: 1, max: 10, unit: "mm" });
const fcHoleDia = Param.number("FC Hole Dia", 3.2, { min: 1, max: 6, unit: "mm" });
const fcPatternSize = Param.number("FC Pattern Size", 20, { min: 10, max: 80, unit: "mm" });

// --- CALCULATED VALUES ---
const armOffset = hubSize / 2 + armLength / 2;
const mountDist = hubSize / 2 + armLength;
const fcOffset = fcPatternSize / 2;
const holeHeight = hubThickness + 2; // Extra height for clean subtraction

// --- CENTRAL HUB & ARMS ---
// Central square hub
const hub = box(hubSize, hubSize, hubThickness);

// Four rectangular arms extending along the axes
const armXPlus = box(armLength, armWidth, hubThickness).translate(armOffset, 0, 0);
const armXMinus = box(armLength, armWidth, hubThickness).translate(-armOffset, 0, 0);
const armYPlus = box(armWidth, armLength, hubThickness).translate(0, armOffset, 0);
const armYMinus = box(armWidth, armLength, hubThickness).translate(0, -armOffset, 0);

// --- MOTOR MOUNT PLATFORMS ---
// Circular platforms at the end of each arm
const mountXPlus = cylinder(hubThickness, motorMountDia / 2).translate(mountDist, 0, 0);
const mountXMinus = cylinder(hubThickness, motorMountDia / 2).translate(-mountDist, 0, 0);
const mountYPlus = cylinder(hubThickness, motorMountDia / 2).translate(0, mountDist, 0);
const mountYMinus = cylinder(hubThickness, motorMountDia / 2).translate(0, -mountDist, 0);

// --- UNION SOLID BODY ---
// Merge the hub, arms, and motor mounts into one single seamless solid
const chassisSolid = hub
  .union(armXPlus)
  .union(armXMinus)
  .union(armYPlus)
  .union(armYMinus)
  .union(mountXPlus)
  .union(mountXMinus)
  .union(mountYPlus)
  .union(mountYMinus);

// --- HOLES ---
// Motor shaft holes centered on each motor mount platform
const shaftHoleXPlus = cylinder(holeHeight, motorShaftDia / 2).translate(mountDist, 0, -1);
const shaftHoleXMinus = cylinder(holeHeight, motorShaftDia / 2).translate(-mountDist, 0, -1);
const shaftHoleYPlus = cylinder(holeHeight, motorShaftDia / 2).translate(0, mountDist, -1);
const shaftHoleYMinus = cylinder(holeHeight, motorShaftDia / 2).translate(0, -mountDist, -1);

// Flight controller mounting holes in a square pattern on the hub
const fcHole1 = cylinder(holeHeight, fcHoleDia / 2).translate(fcOffset, fcOffset, -1);
const fcHole2 = cylinder(holeHeight, fcHoleDia / 2).translate(-fcOffset, fcOffset, -1);
const fcHole3 = cylinder(holeHeight, fcHoleDia / 2).translate(fcOffset, -fcOffset, -1);
const fcHole4 = cylinder(holeHeight, fcHoleDia / 2).translate(-fcOffset, -fcOffset, -1);

// --- SUBTRACT ALL HOLES ---
// Apply subtraction of all internal and external mounting holes
const finalChassis = chassisSolid
  .subtract(shaftHoleXPlus)
  .subtract(shaftHoleXMinus)
  .subtract(shaftHoleYPlus)
  .subtract(shaftHoleYMinus)
  .subtract(fcHole1)
  .subtract(fcHole2)
  .subtract(fcHole3)
  .subtract(fcHole4)
  .color("#4a90e2"); // Premium blue anodized look

// --- RETURN OUTPUT ---
return {
  "a-quadcopter-drone-chassis-in-a-plus-(+)": finalChassis,
};
