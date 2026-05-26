/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A coin-shaped disc with filleted circular edges.
 * Workflow ID : eval-T1_040-4ab4e8
 * Trace ID    : de17f439-bc22-4a48-9d10-f9dfdbc3a87c
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 38.0 × 38.0 × 3.0 mm
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
 *   STEP   : artifact://eval-T1_040-4ab4e8/step/T1_040_outer0_attempt0.step
 *   STL    : artifact://eval-T1_040-4ab4e8/stl/T1_040_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Create a cylinder of diameter 38mm and height 3mm centered at the origin. Apply a 0.5mm radius fillet to both the top and bottom circular edges. Ensure the final bounding box dimensions do not exceed 38x38x3mm.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: Coin-shaped Disc with Filleted Edges
 * 
 * A 38mm diameter, 3mm thick coin-shaped disc with 0.5mm fillets on both circular edges.
 */

// Define parameters for the coin disc
const diameter = Param.number("Diameter", 38.0, { min: 10.0, max: 100.0, unit: "mm" });
const thickness = Param.number("Thickness", 3.0, { min: 1.0, max: 20.0, unit: "mm" });
const filletRadius = Param.number("Fillet Radius", 0.5, { min: 0.1, max: 5.0, unit: "mm" });

// Calculate radius from diameter
const radius = diameter / 2;

// Create the main cylinder body (aligned along Z axis, starting from Z=0)
const discBody = cylinder(thickness, radius);

// Apply fillet to the top and bottom circular edges
const filletedDisc = discBody.fillet(filletRadius);

// Center the disc at the origin along the Z axis
const finalCoin = filletedDisc.translate(0, 0, -thickness / 2);

// Apply a gold/bronze-like color for a coin appearance
const coloredCoin = finalCoin.color("#d4af37");

// Return the final shape map
return {
  "a-coin-shaped-disc-with-filleted-circula": coloredCoin
};
