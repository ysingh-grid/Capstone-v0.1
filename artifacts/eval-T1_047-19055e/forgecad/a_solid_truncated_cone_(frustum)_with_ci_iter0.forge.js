/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A solid truncated cone (frustum) with circular base and top faces, centered on the Z-axis.
 * Workflow ID : eval-T1_047-19055e
 * Trace ID    : fd27300d-1fd5-4880-b769-6f82830dd566
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 60.0 × 60.0 × 35.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 2.0%
 *   BBox IoU       : ≥ 0.98
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T1_047-19055e/step/T1_047_outer0_attempt0.step
 *   STL    : artifact://eval-T1_047-19055e/stl/T1_047_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The coder should create a solid frustum. In OpenCASCADE, this can be achieved using gp_Cone and cutting/limiting it, or creating a cylinder/cone-like shape, or using BRepPrimAPI_MakeCone with two radii (r1 = 30, r2 = 20, height = 35).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Solid Truncated Cone (Frustum)
 * Centered on the Z-axis, transitioning from a larger base radius to a smaller top radius.
 */

// Define parameters for the truncated cone
const base_radius = Param.number("Base Radius", 30, { min: 5, max: 150, unit: "mm" });
const top_radius  = Param.number("Top Radius", 20, { min: 0, max: 150, unit: "mm" });
const height      = Param.number("Height", 35, { min: 5, max: 200, unit: "mm" });

// Create the truncated cone using the cone primitive (r1, r2, height)
// This creates a solid cone centered on XY, extending from Z=0 to Z=height
const frustum = cone(base_radius, top_radius, height)
  .color("#5f87c6"); // Assign a clean blue color

// Return the final shape
return {
  "a-solid-truncated-cone-(frustum)-with-ci": frustum,
};
