/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Open-top rectangular container with rounded vertical corners, 60x40x30mm, shelled with 2mm wall thickness.
 * Workflow ID : eval-T3_001-ae832c
 * Trace ID    : f2e7b7dd-b8e3-44a6-a954-9da288e9e950
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
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_001-ae832c/step/T3_001_outer0_attempt0.step
 *   STL    : artifact://eval-T3_001-ae832c/stl/T3_001_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Position the container centered at (0,0) on the XY plane, with the bottom at Z=0. The inner cavity must have a depth of 28mm (leaving a 2mm thick bottom floor) and wall thickness of 2mm. Manual subtraction of an inner rounded box (radius 3mm) is recommended for stability over a general shell operation.
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
 */

// Define parametric inputs
const width = Param.number("Outer Width X", 60, { min: 10, max: 200, unit: "mm" });
const depth = Param.number("Outer Depth Y", 40, { min: 10, max: 200, unit: "mm" });
const height = Param.number("Outer Height Z", 30, { min: 5, max: 200, unit: "mm" });
const wallThickness = Param.number("Wall Thickness", 2, { min: 0.5, max: 10, unit: "mm" });
const cornerRadius = Param.number("Outer Corner Radius", 5, { min: 1, max: 20, unit: "mm" });

// Helper function to construct a rounded box centered on XY, extending +Z
function createRoundedBox(w, d, h, r) {
  // Safe limit for radius to avoid geometry self-intersection
  const safeR = Math.min(r, w / 2 - 0.1, d / 2 - 0.1);
  
  // Return standard box if radius is effectively zero
  if (safeR <= 0.1) {
    return box(w, d, h);
  }
  
  // Create overlapping central boxes
  const boxA = box(w - 2 * safeR, d, h);
  const boxB = box(w, d - 2 * safeR, h);
  
  // Position corner columns
  const cx = w / 2 - safeR;
  const cy = d / 2 - safeR;
  
  const c1 = cylinder(h, safeR).translate(cx, cy, 0);
  const c2 = cylinder(h, safeR).translate(-cx, cy, 0);
  const c3 = cylinder(h, safeR).translate(cx, -cy, 0);
  const c4 = cylinder(h, safeR).translate(-cx, -cy, 0);
  
  // Union all parts to form the solid rounded box
  return boxA.union(boxB).union(c1).union(c2).union(c3).union(c4);
}

// Generate the outer container body
const outerBody = createRoundedBox(width, depth, height, cornerRadius);

// Calculate inner cavity dimensions
const innerWidth = width - 2 * wallThickness;
const innerDepth = depth - 2 * wallThickness;
const innerRadius = cornerRadius - wallThickness;

// Generate the inner cavity, translated upwards to preserve bottom floor thickness
const innerCavity = createRoundedBox(innerWidth, innerDepth, height, innerRadius)
  .translate(0, 0, wallThickness);

// Subtract cavity from outer body and apply material color
const container = outerBody.subtract(innerCavity).color("#2196f3");

// Return the final assembly map
return {
  "open-top-rectangular-container-with-roun": container
};
