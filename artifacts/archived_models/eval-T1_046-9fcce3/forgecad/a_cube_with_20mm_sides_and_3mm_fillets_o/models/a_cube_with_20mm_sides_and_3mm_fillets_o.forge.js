/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A cube with 20mm sides and 3mm fillets on all 12 edges.
 * Workflow ID : eval-T1_046-9fcce3
 * Trace ID    : 27520bbd-9d2b-4e20-b81b-76df40924dbf
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 20.0 × 20.0 × 20.0 mm
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
 *   STEP   : artifact://eval-T1_046-9fcce3/step/T1_046_outer0_attempt0.step
 *   STL    : artifact://eval-T1_046-9fcce3/stl/T1_046_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure that the fillet operation is applied to all 12 edges of the 20mm cube. The bounding box must remain exactly 20x20x20mm as fillets should only subtract material from the corners/edges.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file filleted_cube.forge.js
 * @description A 20mm cube with 3mm fillets on all 12 edges.
 */

// Define parameters for the cube side length and the fillet radius
const side = Param.number("Side Length", 20.0, { min: 5.0, max: 100.0, unit: "mm" });
const radius = Param.number("Fillet Radius", 3.0, { min: 0.1, max: 10.0, unit: "mm" });

// Create the base box centered on the XY plane
const baseBox = box(side, side, side);

// Translate the box to center it completely on the Z axis as well
const centeredBox = baseBox.translate(0, 0, -side / 2);

// Apply fillet to all 12 edges of the cube
const filletedCube = centeredBox.fillet(radius);

// Return the final filleted cube geometry
return {
  "a-cube-with-20mm-sides-and-3mm-fillets-o": filletedCube,
};
