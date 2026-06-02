/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A solid upright cylinder shaft centered at the origin with a full-length rectangular keyway cut along its +X side.
 * Workflow ID : eval-T2_015-4f3a9e
 * Trace ID    : b7a9c893-9263-4fae-bcbd-f35320be402a
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 20.0 × 20.0 × 60.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.98
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T2_015-4f3a9e/step/T2_015_outer0_attempt0.step
 *   STL    : artifact://eval-T2_015-4f3a9e/stl/T2_015_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The shaft is centered at the origin (X=0, Y=0, Z from -30 to 30). The keyway is a subtractive box spanning the full Z length (60mm), with Y from -3 to 3, and X from 7 to 10 (and beyond to ensure clean cut).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file shaft_with_keyway.forge.js
 * @description A solid upright cylinder shaft centered at the origin with a full-length rectangular keyway cut along its +X side.
 */

// Define parameters for live sliders in ForgeCAD Studio
const shaftDiameter = Param.number("Shaft Diameter", 20.0, { min: 5, max: 100, unit: "mm" });
const shaftLength = Param.number("Shaft Length", 60.0, { min: 10, max: 300, unit: "mm" });
const keywayWidth = Param.number("Keyway Width", 6.0, { min: 1, max: 20, unit: "mm" });
const keywayDepth = Param.number("Keyway Depth", 3.0, { min: 0.5, max: 10, unit: "mm" });

// Calculate helper values based on parameters
const shaftRadius = shaftDiameter / 2;
const keywayBottomX = shaftRadius - keywayDepth;
const keywayBoxX = 10.0; // Oversized X dimension to ensure it cuts through the outer edge of the cylinder
const keywayBoxZ = shaftLength + 2.0; // Oversized Z dimension to ensure clean cuts at the ends

// Create the main upright cylinder and center it along the Z axis
const mainShaft = cylinder(shaftLength, shaftRadius)
  .translate([0, 0, -shaftLength / 2])
  .color("#94a3b8");

// Create the subtractive keyway box and position it correctly on the +X side
// box(width, depth, height) -> centered on XY, extends in +Z
const keywayCutout = box(keywayBoxX, keywayWidth, keywayBoxZ)
  .translate([keywayBottomX + (keywayBoxX / 2), 0, -keywayBoxZ / 2]);

// Subtract the keyway box from the main shaft cylinder
const finalShaft = mainShaft.subtract(keywayCutout);

// Return the final model mapped to the requested key
return {
  "a-solid-upright-cylinder-shaft-centered-": finalShaft,
};
