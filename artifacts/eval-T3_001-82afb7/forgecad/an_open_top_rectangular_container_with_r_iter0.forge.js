/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : An open-top rectangular container with rounded vertical corners, shelled inward.
 * Workflow ID : eval-T3_001-82afb7
 * Trace ID    : ef3fc8ab-03fe-43c3-abae-e6b33e8922c5
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 60.0 × 40.0 × 30.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_001-82afb7/step/T3_001_outer0_attempt0.step
 *   STL    : artifact://eval-T3_001-82afb7/stl/T3_001_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Model the outer box centered at (0,0,15) so the base is at Z=0. Fillet the four vertical edges with a radius of 5mm before performing the shell operation. Shell inward with a thickness of 2mm, removing the top face (+Z).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Open-top rectangular container with rounded vertical corners.
 * Centered at the origin on the XY plane (Z=0).
 */

// User-adjustable parameters
const width = Param.number("Width", 60, { min: 10, max: 500, unit: "mm" });
const depth = Param.number("Depth", 40, { min: 10, max: 500, unit: "mm" });
const height = Param.number("Height", 30, { min: 5, max: 300, unit: "mm" });
const filletRadius = Param.number("Fillet Radius", 5, { min: 1, max: 50, unit: "mm" });
const wallThickness = Param.number("Wall Thickness", 2, { min: 0.5, max: 20, unit: "mm" });

// Derived values for the layout
const r = filletRadius;
const t = wallThickness;
const cx = width / 2 - r;
const cy = depth / 2 - r;

// --- Outer Solid Construction ---
// Create the two intersecting central boxes
const outerBox1 = box(width - 2 * r, depth, height);
const outerBox2 = box(width, depth - 2 * r, height);

// Create the four corner cylinders
const oc1 = cylinder(height, r).translate(cx, cy, 0);
const oc2 = cylinder(height, r).translate(-cx, cy, 0);
const oc3 = cylinder(height, r).translate(-cx, -cy, 0);
const oc4 = cylinder(height, r).translate(cx, -cy, 0);

// Union all outer components to form the solid rounded container outer shell
const outerSolid = outerBox1
  .union(outerBox2)
  .union(oc1)
  .union(oc2)
  .union(oc3)
  .union(oc4);

// --- Inner Cavity Construction ---
// The inner cavity height is extended upward to ensure a clean cut through the top
const innerHeight = height - t + 10;
const innerR = r - t;

// Create the two intersecting inner boxes
const innerBox1 = box(width - 2 * r, depth - 2 * t, innerHeight);
const innerBox2 = box(width - 2 * t, depth - 2 * r, innerHeight);

// Create the four inner corner cylinders
const ic1 = cylinder(innerHeight, innerR).translate(cx, cy, 0);
const ic2 = cylinder(innerHeight, innerR).translate(-cx, cy, 0);
const ic3 = cylinder(innerHeight, innerR).translate(-cx, -cy, 0);
const ic4 = cylinder(innerHeight, innerR).translate(cx, -cy, 0);

// Union all inner components and translate upward by the floor thickness
const innerSolid = innerBox1
  .union(innerBox2)
  .union(ic1)
  .union(ic2)
  .union(ic3)
  .union(ic4);

const innerCavity = innerSolid.translate(0, 0, t);

// --- Final Boolean Operation ---
// Subtract the cavity from the outer solid to shell the container
const container = outerSolid.subtract(innerCavity).color("#5f87c6");

// Export the final model
return {
  "an-open-top-rectangular-container-with-r": container,
};
