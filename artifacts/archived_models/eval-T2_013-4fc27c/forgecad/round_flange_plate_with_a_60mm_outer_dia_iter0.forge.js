/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Round flange plate with a 60mm outer diameter, 8mm thickness, 20mm center bore, and six 5.5mm bolt holes arranged on a 45mm pitch circle diameter.
 * Workflow ID : eval-T2_013-4fc27c
 * Trace ID    : 97f552d2-c8d2-47ca-9045-a7a3cb6f099c
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 60.0 × 60.0 × 8.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 7 hole(s) of diameter 5.5 mm (×7)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T2_013-4fc27c/step/T2_013_outer0_attempt0.step
 *   STL    : artifact://eval-T2_013-4fc27c/stl/T2_013_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The flange must be centered at (0,0) on the XY plane. The 6 bolt holes are located at a radius of 22.5mm from the center, at angles of 0, 60, 120, 180, 240, and 300 degrees relative to the positive X-axis. All holes must be through-holes spanning the entire 8mm thickness of the plate.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Round Flange Plate
 * 
 * A solid disc 60mm in diameter and 8mm thick with a 20mm center bore
 * and six 5.5mm diameter bolt holes on a 45mm pitch circle diameter (PCD).
 */

// --- Parameters ---
const outerDia = Param.number("Outer Diameter", 60, { min: 10, max: 200, unit: "mm" });
const thickness = Param.number("Thickness", 8, { min: 1, max: 50, unit: "mm" });
const centerBoreDia = Param.number("Center Bore Diameter", 20, { min: 5, max: 100, unit: "mm" });
const pcd = Param.number("Pitch Circle Diameter", 45, { min: 10, max: 150, unit: "mm" });
const boltHoleDia = Param.number("Bolt Hole Diameter", 5.5, { min: 1, max: 20, unit: "mm" });

// --- Calculated Radii ---
const outerRadius = outerDia / 2;
const centerBoreRadius = centerBoreDia / 2;
const pcdRadius = pcd / 2;
const boltHoleRadius = boltHoleDia / 2;

// --- Main Flange Disc ---
const disc = cylinder(thickness, outerRadius);

// --- Center Bore ---
const bore = cylinder(thickness, centerBoreRadius);

// --- Base Plate with Center Hole ---
const basePlate = disc.subtract(bore);

// --- Bolt Holes (Positioned parametrically) ---
const baseHole = cylinder(thickness, boltHoleRadius).translate(pcdRadius, 0, 0);

// Rotate the base hole to the 6 target angles (0, 60, 120, 180, 240, 300)
const hole0 = baseHole;
const hole1 = baseHole.rotate([0, 0, 1], 60);
const hole2 = baseHole.rotate([0, 0, 1], 120);
const hole3 = baseHole.rotate([0, 0, 1], 180);
const hole4 = baseHole.rotate([0, 0, 1], 240);
const hole5 = baseHole.rotate([0, 0, 1], 300);

// --- Subtract Holes Successively ---
const finalFlange = basePlate
  .subtract(hole0)
  .subtract(hole1)
  .subtract(hole2)
  .subtract(hole3)
  .subtract(hole4)
  .subtract(hole5)
  .color("#8fa9c4");

// --- Export ---
return {
  "round-flange-plate-with-a-60mm-outer-dia": finalFlange,
};
