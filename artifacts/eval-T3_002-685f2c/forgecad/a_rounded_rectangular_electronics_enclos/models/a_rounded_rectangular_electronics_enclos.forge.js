/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A rounded rectangular electronics enclosure body, open on top, with a 2mm wall thickness and four 3.2mm mounting holes in the bottom.
 * Workflow ID : eval-T3_002-685f2c
 * Trace ID    : b5f24faa-8012-418f-9166-116939dfdb71
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 80.0 × 50.0 × 25.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 4 hole(s) of diameter 3.2 mm (×4)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_002-685f2c/step/T3_002_outer0_attempt0.step
 *   STL    : artifact://eval-T3_002-685f2c/stl/T3_002_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the part is centered on the origin in X and Y, with the bottom face resting on the Z=0 plane (Z ranges from 0 to 25). The outer vertical corners must have an 8mm fillet before or during the shelling operation so that the inner corners naturally have a 6mm radius (8mm - 2mm wall thickness).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Rounded Rectangular Electronics Enclosure Body
 * 
 * A parametric, open-top electronics enclosure with rounded outer/inner corners,
 * uniform wall thickness, and four mounting holes in the base.
 */

// Define parameters for live sliders in ForgeCAD Studio
const width = Param.number("Width (X)", 80, { min: 30, max: 300, unit: "mm" });
const depth = Param.number("Depth (Y)", 50, { min: 30, max: 300, unit: "mm" });
const height = Param.number("Height (Z)", 25, { min: 10, max: 150, unit: "mm" });
const filletRadius = Param.number("Corner Fillet Radius", 8, { min: 1, max: 20, unit: "mm" });
const wallThickness = Param.number("Wall Thickness", 2, { min: 1, max: 5, unit: "mm" });
const baseThickness = Param.number("Base Thickness", 2, { min: 1, max: 5, unit: "mm" });
const holeDia = Param.number("Hole Diameter", 3.2, { min: 1, max: 10, unit: "mm" });
const holePitchX = Param.number("Hole Spacing X", 64, { min: 10, max: 280, unit: "mm" });
const holePitchY = Param.number("Hole Spacing Y", 34, { min: 10, max: 280, unit: "mm" });

// Calculate helper dimensions
const rOuter = filletRadius;
const rInner = Math.max(0.5, filletRadius - wallThickness);

// Outer body components
const outerBox1 = box(width - 2 * rOuter, depth, height);
const outerBox2 = box(width, depth - 2 * rOuter, height);

const cxOuter = width / 2 - rOuter;
const cyOuter = depth / 2 - rOuter;

const c1 = cylinder(height, rOuter).translate(cxOuter, cyOuter, 0);
const c2 = cylinder(height, rOuter).translate(-cxOuter, cyOuter, 0);
const c3 = cylinder(height, rOuter).translate(cxOuter, -cyOuter, 0);
const c4 = cylinder(height, rOuter).translate(-cxOuter, -cyOuter, 0);

// Union outer body components (5 operations)
const outerBody = outerBox1
  .union(outerBox2)
  .union(c1)
  .union(c2)
  .union(c3)
  .union(c4);

// Inner cavity components
const innerWidth = width - 2 * wallThickness;
const innerDepth = depth - 2 * wallThickness;
const innerHeight = height; // Extends out the top for a clean cut

const innerBox1 = box(innerWidth - 2 * rInner, innerDepth, innerHeight);
const innerBox2 = box(innerWidth, innerDepth - 2 * rInner, innerHeight);

const cxInner = innerWidth / 2 - rInner;
const cyInner = innerDepth / 2 - rInner;

const ic1 = cylinder(innerHeight, rInner).translate(cxInner, cyInner, 0);
const ic2 = cylinder(innerHeight, rInner).translate(-cxInner, cyInner, 0);
const ic3 = cylinder(innerHeight, rInner).translate(cxInner, -cyInner, 0);
const ic4 = cylinder(innerHeight, rInner).translate(-cxInner, -cyInner, 0);

// Union inner cavity components (5 operations) and translate up by baseThickness
const cavity = innerBox1
  .union(innerBox2)
  .union(ic1)
  .union(ic2)
  .union(ic3)
  .union(ic4)
  .translate(0, 0, baseThickness);

// Subtract cavity from outer body to form the shell (1 operation)
const shelledBody = outerBody.subtract(cavity);

// Create the 4 mounting holes through the bottom base
const holeRadius = holeDia / 2;
const holeHeight = baseThickness + 4; // Extra height to ensure clean cuts through Z=0
const holeZ = -2;

const h1 = cylinder(holeHeight, holeRadius).translate(holePitchX / 2, holePitchY / 2, holeZ);
const h2 = cylinder(holeHeight, holeRadius).translate(-holePitchX / 2, holePitchY / 2, holeZ);
const h3 = cylinder(holeHeight, holeRadius).translate(holePitchX / 2, -holePitchY / 2, holeZ);
const h4 = cylinder(holeHeight, holeRadius).translate(-holePitchX / 2, -holePitchY / 2, holeZ);

// Subtract mounting holes from the shelled body (4 operations)
const finalEnclosure = shelledBody
  .subtract(h1)
  .subtract(h2)
  .subtract(h3)
  .subtract(h4)
  .color("#3a4454"); // Aesthetic dark slate grey

// Return the final assembly under the requested key
return {
  "a-rounded-rectangular-electronics-enclos": finalEnclosure,
};
