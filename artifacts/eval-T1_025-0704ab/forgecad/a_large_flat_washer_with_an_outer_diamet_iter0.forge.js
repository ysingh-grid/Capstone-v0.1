/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A large flat washer with an outer diameter of 50mm, inner diameter of 25mm, and thickness of 4mm.
 * Workflow ID : eval-T1_025-0704ab
 * Trace ID    : 4cfb3196-c7a5-4577-b72b-011c9e48d1c2
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 50.0 × 50.0 × 4.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 25.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_025-0704ab/step/T1_025_outer0_attempt0.step
 *   STL    : artifact://eval-T1_025-0704ab/stl/T1_025_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create a cylinder of diameter 50mm and height 4mm, then subtract a concentric cylinder of diameter 25mm and height 4mm (or slightly larger for a clean cut). Center the washer on the XY plane for symmetry.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: Flat Washer
 * Outer Diameter: 50mm, Inner Diameter: 25mm, Thickness: 4mm
 */

// Define parameters for interactive customization in the UI
const outerDiameter = Param.number("Outer Diameter", 50, { min: 5, max: 200, unit: "mm" });
const innerDiameter = Param.number("Inner Diameter", 25, { min: 2, max: 190, unit: "mm" });
const thickness = Param.number("Thickness", 4, { min: 0.5, max: 50, unit: "mm" });

// Calculate the radius values from the diameter parameters
const outerRadius = outerDiameter / 2;
const innerRadius = innerDiameter / 2;

// Create the main outer cylinder body of the washer
const outerCylinder = cylinder(thickness, outerRadius);

// Create the inner cutting cylinder, made slightly taller and offset for a clean boolean cut
const cutter = cylinder(thickness + 2, innerRadius).translate(0, 0, -1);

// Perform the subtraction to create the central hole of the washer
const finalWasher = outerCylinder.subtract(cutter).color("#b0bec5");

// Return the final washer component map
return {
  "a-large-flat-washer-with-an-outer-diamet": finalWasher
};
