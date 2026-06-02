/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Parametric FPV 250 drone unibody bottom mainplate in X-configuration with 4mm uniform thickness, featuring motor mounting pads, flight controller mounting holes, and a secondary accessory mounting pattern.
 * Workflow ID : design-generated_part-ae23cae0
 * Trace ID    : 30f38472-91cb-4f49-a0be-770179191764
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 204.8 × 204.8 × 4.0 mm
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
 *   STEP   : artifact://design-generated_part-ae23cae0/step/generated_part_outer0_attempt1.step
 *   STL    : artifact://design-generated_part-ae23cae0/stl/generated_part_outer0_attempt1.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The motor centers should be located at X/Y offsets calculated from the 250mm diagonal distance. Assuming a square layout, the offsets from the origin for the motor centers are approximately +/- 88.39 mm on both X and Y axes. The secondary 20x20mm hole pattern should be offset along the Y-axis (e.g., -35mm offset from origin) to place it 'directly behind' the central stack.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

// Define parameters for the FPV 250 drone frame
const diagonal = Param.number("Diagonal Distance", 250, { min: 100, max: 400, unit: "mm" });
const fuseWidth = Param.number("Fuselage Width", 40, { min: 20, max: 100, unit: "mm" });
const fuseLength = Param.number("Fuselage Length", 120, { min: 50, max: 250, unit: "mm" });
const thickness = Param.number("Thickness", 4, { min: 1, max: 10, unit: "mm" });
const armWidth = Param.number("Arm Width", 12, { min: 5, max: 30, unit: "mm" });
const padDiam = Param.number("Motor Pad Diameter", 28, { min: 10, max: 50, unit: "mm" });
const padCenterHole = Param.number("Motor Center Hole", 5, { min: 1, max: 10, unit: "mm" });
const padScrewHole = Param.number("Motor Screw Hole", 3, { min: 1, max: 5, unit: "mm" });
const padBcd = Param.number("Motor BCD", 16, { min: 5, max: 30, unit: "mm" });
const fcPattern = Param.number("FC Hole Pattern", 30.5, { min: 15, max: 50, unit: "mm" });
const fcHole = Param.number("FC Hole Size", 3, { min: 1, max: 5, unit: "mm" });
const secPattern = Param.number("Secondary Hole Pattern", 20, { min: 10, max: 40, unit: "mm" });
const secHole = Param.number("Secondary Hole Size", 2, { min: 1, max: 5, unit: "mm" });
const secOffset = Param.number("Secondary Pattern Offset", -35, { min: -100, max: 0, unit: "mm" });

// Calculate motor coordinates based on diagonal distance (square layout)
const motorOffset = (diagonal / 2) * Math.sin(Math.PI / 4);

// Create central fuselage main body
const fuselage = box(fuseWidth, fuseLength, thickness);

// Create the diagonal arm structures
const arm1 = box(armWidth, diagonal, thickness).rotate([0, 0, 1], 45);
const arm2 = box(armWidth, diagonal, thickness).rotate([0, 0, 1], -45);

// Create motor mounting pads at each motor location
const padSolid = cylinder(thickness, padDiam / 2);
const pad1 = padSolid.translate(motorOffset, motorOffset, 0);
const pad2 = padSolid.translate(-motorOffset, motorOffset, 0);
const pad3 = padSolid.translate(motorOffset, -motorOffset, 0);
const pad4 = padSolid.translate(-motorOffset, -motorOffset, 0);

// Combine all solid structures into a single body
const solidBody = fuselage
  .union(arm1)
  .union(arm2)
  .union(pad1)
  .union(pad2)
  .union(pad3)
  .union(pad4);

// Define helper function to create motor mount hole patterns
function makeMotorHoles(x, y, hThickness, cRadius, bRadius, sRadius) {
  const ch = cylinder(hThickness, cRadius).translate(x, y, 0);
  const sh1 = cylinder(hThickness, sRadius).translate(x + bRadius, y, 0);
  const sh2 = cylinder(hThickness, sRadius).translate(x - bRadius, y, 0);
  const sh3 = cylinder(hThickness, sRadius).translate(x, y + bRadius, 0);
  const sh4 = cylinder(hThickness, sRadius).translate(x, y - bRadius, 0);
  return ch.union(sh1).union(sh2).union(sh3).union(sh4);
}

// Generate motor hole patterns
const hP1 = makeMotorHoles(motorOffset, motorOffset, thickness, padCenterHole / 2, padBcd / 2, padScrewHole / 2);
const hP2 = makeMotorHoles(-motorOffset, motorOffset, thickness, padCenterHole / 2, padBcd / 2, padScrewHole / 2);
const hP3 = makeMotorHoles(motorOffset, -motorOffset, thickness, padCenterHole / 2, padBcd / 2, padScrewHole / 2);
const hP4 = makeMotorHoles(-motorOffset, -motorOffset, thickness, padCenterHole / 2, padBcd / 2, padScrewHole / 2);

// Create flight controller mounting hole patterns
const fc1 = cylinder(thickness, fcHole / 2).translate(fcPattern / 2, fcPattern / 2, 0);
const fc2 = cylinder(thickness, fcHole / 2).translate(-fcPattern / 2, fcPattern / 2, 0);
const fc3 = cylinder(thickness, fcHole / 2).translate(fcPattern / 2, -fcPattern / 2, 0);
const fc4 = cylinder(thickness, fcHole / 2).translate(-fcPattern / 2, -fcPattern / 2, 0);

// Create secondary accessory stack mounting hole patterns
const sec1
