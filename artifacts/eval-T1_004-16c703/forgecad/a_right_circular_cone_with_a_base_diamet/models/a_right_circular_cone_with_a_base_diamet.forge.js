/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A right circular cone with a base diameter of 30mm and a height of 45mm.
 * Workflow ID : eval-T1_004-16c703
 * Trace ID    : 630dbcad-be82-4fca-a7e3-a82e7cbf9a71
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 30.0 × 30.0 × 45.0 mm
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
 *   STEP   : artifact://eval-T1_004-16c703/step/T1_004_outer0_attempt0.step
 *   STL    : artifact://eval-T1_004-16c703/stl/T1_004_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The cone should be oriented vertically with its base on the XY plane (Z=0) and centered at (0,0). Can be modeled using a cone primitive or by revolving a right triangle of width 15mm and height 45mm about the Z-axis.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file cone.forge.js
 * @description A right circular cone with a base diameter of 30mm and a height of 45mm.
 */

// Define parameters for the cone
const baseDiameter = Param.number("Base Diameter", 30, { min: 10, max: 200, unit: "mm" });
const height = Param.number("Height", 45, { min: 10, max: 200, unit: "mm" });

// Calculate base radius
const baseRadius = baseDiameter / 2;

// Create the cone primitive with base radius, top radius (0 for a sharp point), and height
const coneBody = cone(baseRadius, 0, height)
  .color("#5f87c6");

// Return the final shape
return {
  "a-right-circular-cone-with-a-base-diamet": coneBody,
};
