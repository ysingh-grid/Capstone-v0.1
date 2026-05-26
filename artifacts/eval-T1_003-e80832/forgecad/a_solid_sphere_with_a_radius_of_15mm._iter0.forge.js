/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A solid sphere with a radius of 15mm.
 * Workflow ID : eval-T1_003-e80832
 * Trace ID    : 43863214-43e7-4b92-8510-2f7811719970
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 30.0 × 30.0 × 30.0 mm
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
 *   STEP   : artifact://eval-T1_003-e80832/step/T1_003_outer0_attempt0.step
 *   STL    : artifact://eval-T1_003-e80832/stl/T1_003_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The sphere should be centered at the origin (0, 0, 0) with a radius of 15mm. No holes or complex features are required.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file A solid sphere with a radius of 15mm.
 */

// Define the parametric radius for the sphere, defaulted to 15mm
const radius = Param.number("Radius", 15, { min: 1, max: 100, unit: "mm" });

// Create the sphere centered at the origin (0, 0, 0)
const sphereSolid = sphere(radius).color("#5f87c6");

// Return the final geometry
return {
  "a-solid-sphere-with-a-radius-of-15mm.": sphereSolid
};
