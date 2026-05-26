/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A solid elliptical cylinder with a major axis of 40mm, minor axis of 20mm, and a height of 25mm.
 * Workflow ID : eval-T1_016-2937a7
 * Trace ID    : 02117445-07d3-424d-898d-328cb8cc590c
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 40.0 × 20.0 × 25.0 mm
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
 *   STEP   : artifact://eval-T1_016-2937a7/step/T1_016_outer0_attempt0.step
 *   STL    : artifact://eval-T1_016-2937a7/stl/T1_016_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The major axis (40mm) aligns with the X direction and the minor axis (20mm) aligns with the Y direction. The height of 25mm is along the Z direction. The volume calculation is based on the formula: Volume = pi * semi_major * semi_minor * height.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: Solid Elliptical Cylinder
 * 
 * This model represents a solid elliptical cylinder with parametric controls
 * for the major axis, minor axis, and height.
 */

// Define parameters for the elliptical cylinder
const majorAxis = Param.number("Major Axis", 40, { min: 5, max: 200, unit: "mm" });
const minorAxis = Param.number("Minor Axis", 20, { min: 5, max: 200, unit: "mm" });
const height = Param.number("Height", 25, { min: 1, max: 200, unit: "mm" });

// Calculate semi-axes
const semiMajor = majorAxis / 2;
const semiMinor = minorAxis / 2;

// Create a base unit cylinder of radius 1 and the target height
const baseCylinder = cylinder(height, 1);

// Scale the cylinder non-uniformly to create the elliptical profile
// Scaling X by semiMajor, Y by semiMinor, and keeping Z at 1 (since height is already correct)
const ellipticalCylinder = baseCylinder.scale(semiMajor, semiMinor, 1).color("#5f87c6");

// Return the final shape
return {
  "a-solid-elliptical-cylinder-with-a-major": ellipticalCylinder
};
