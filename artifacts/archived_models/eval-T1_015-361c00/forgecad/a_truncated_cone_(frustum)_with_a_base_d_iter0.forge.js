/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A truncated cone (frustum) with a base diameter of 40mm, a top diameter of 20mm, and a height of 30mm.
 * Workflow ID : eval-T1_015-361c00
 * Trace ID    : 7d1e02de-a27c-41b9-bb0d-3b44c24afc49
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 40.0 × 40.0 × 30.0 mm
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
 *   STEP   : artifact://eval-T1_015-361c00/step/T1_015_outer0_attempt0.step
 *   STL    : artifact://eval-T1_015-361c00/stl/T1_015_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Align the center of the base with the origin (0, 0, 0). This shape can be easily generated using a revolve operation of a right trapezoid about the Z-axis, or by lofting between two circular sketches of diameter 40mm and 20mm spaced 30mm apart along the Z-axis.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Truncated Cone (Frustum)
 * Base Diameter: 40mm (Radius: 20mm)
 * Top Diameter: 20mm (Radius: 10mm)
 * Height: 30mm
 */

// Define parameters for the truncated cone
const baseDiameter = Param.number("Base Diameter", 40, { min: 5, max: 200, unit: "mm" });
const topDiameter = Param.number("Top Diameter", 20, { min: 0, max: 200, unit: "mm" });
const height = Param.number("Height", 30, { min: 5, max: 300, unit: "mm" });

// Calculate radii from diameters
const r1 = baseDiameter / 2;
const r2 = topDiameter / 2;

// Create the truncated cone using the cone primitive (r1, r2, height)
const frustum = cone(r1, r2, height).color("#5f87c6");

// Return the final shape
return {
  "a-truncated-cone-(frustum)-with-a-base-d": frustum,
};
