/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Rectangular-to-round duct transition adapter centered at XY origin, standing upright along Z axis. Comprises a rectangular mounting flange at the base, a smooth lofted transition body, and a cylindrical neck at the top.
 * Workflow ID : eval-T3_007-7f54d2
 * Trace ID    : d028a78f-7f1d-47ca-8d21-f6ebe286618e
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 70.0 × 50.0 × 63.0 mm
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
 *   STEP   : artifact://eval-T3_007-7f54d2/step/T3_007_outer0_attempt0.step
 *   STL    : artifact://eval-T3_007-7f54d2/stl/T3_007_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   1) The mounting flange (Z=0 to Z=3) is a full solid rectangular box 70x50x3mm centered at origin. 2) The lofted transition (Z=3 to Z=53) must loft smoothly from a 60mm x 40mm centered rectangle at Z=3 to a 30mm diameter circle at Z=53; use CadQuery loft() with a wire profile at each end — the rectangular wire should have rounded or sharp corners per default CadQuery rectangle, and the circular wire is a standard circle. Ensure both wires are coplanar workplane faces at their respective Z heights. 3) The cylindrical neck (Z=53 to Z=63) is a solid cylinder of radius 15mm extruded 10mm upward from Z=53. 4) All three components should be unioned into a single solid. 5) The transition body and neck share the same circular cross-section at Z=53 so the union should be seamless there. 6) The flange footprint (70x50) is larger than the transition base (60x40), creating a 5mm ledge on X sides and 5mm ledge on Y sides — this is intentional for mounting purposes. 7) Use CadQuery; loft between a rectangular wire and circular wire at specified Z planes. Confirm final bounding box is exactly 70 x 50 x 63 mm.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Rectangular-to-Round Duct Transition Adapter
 * Flange (Z=0..3) → Lofted transition (Z=3..53) → Cylindrical neck (Z=53..63)
 * All sections centered at XY origin.
 */

// --- Parameters ---
const flangeX         = Param.number("Flange X",         70,  { min: 20,  max: 300, unit: "mm" });
const flangeY         = Param.number("Flange Y",         50,  { min: 20,  max: 300, unit: "mm" });
const flangeThickness = Param.number("Flange Thickness",  3,  { min: 1,   max: 20,  unit: "mm" });
const transRectX      = Param.number("Trans Rect X",     60,  { min: 10,  max: 280, unit: "mm" });
const transRectY      = Param.number("Trans Rect Y",     40,  { min: 10,  max: 280, unit: "mm" });
const transHeight     = Param.number("Transition Height",50,  { min: 10,  max: 400, unit: "mm" });
const neckDiameter    = Param.number("Neck Diameter",    30,  { min: 5,   max: 200, unit: "mm" });
const neckHeight      = Param.number("Neck Height",      10,  { min: 2,   max: 100, unit: "mm" });

// --- Derived values ---
const neckRadius = neckDiameter / 2;
const neckZ      = flangeThickness + transHeight; // Z=53

// --- Component 1: Rectangular mounting flange (Z=0 to Z=3) ---
// box() is centered in XY and extends in +Z; translate up by half thickness to sit on Z=0
const flange = box(flangeX, flangeY, flangeThickness)
    .translate(0, 0, flangeThickness / 2);

// --- Component 3: Cylindrical neck (Z=53 to Z=63) ---
// cylinder centered in XY; translate so base sits at neckZ
const neck = cylinder(neckHeight, neckRadius)
    .translate(0, 0, neckZ + neckHeight / 2);

// --- Component 2: Lofted transition approximation ---
// ForgeCAD lacks a native loft, so we approximate the smooth transition
// using a series of interpolated cross-sections unioned together.
// We use 4 explicit intermediate stages to stay within the 20 boolean ops limit.

// Helper: at parameter t in [0,1], interpolate between rect and circle cross-section
// We approximate each cross-section as a box whose corners are chamfered by using
// a cylinder intersection trick at that level.

// t=0: rect 60x40 at Z=flangeThickness
// t=1: circle r=15 at Z=neckZ
// We build 5 slabs (t=0, 0.25, 0.5, 0.75, 1.0) each as intersection of scaled box & cylinder,
// then union their extruded slabs.

const slabCount = 5;
const slabH = transHeight / (slabCount - 1); // segment height between stations

// Station t=0.0: rect 60x40, no rounding needed — full rectangle cross-section
const w0 = transRectX, d0 = transRectY, r0 = Math.max(w0, d0); // big cylinder = no clipping
const s0 = box(w0, d0, slabH).translate(0, 0, flangeThickness + slabH / 2);

// Station t=0.25
const t1 = 0.25;
const w1 = transRectX * (1 - t1) + neckDiameter * t1; // lerp X size
const d1 = transRectY * (1 - t1) + neckDiameter * t1; // lerp Y size
const r1 = neckRadius + (Math.min(w1, d1) / 2 - neckRadius) * (1 - t1) * 1.5;
const slab1raw = box(w1, d1, slabH);
const slab1cyl = cylinder(slabH, r1 + (w1 - neckDiameter) * 0.3);
const s1 = slab1raw.intersect(slab1cyl)
    .translate(0, 0, flangeThickness + slabH + slabH / 2);

// Station t=0.5
const t2 = 0.5;
const w2 = transRectX * (1 - t2) + neckDiameter * t2;
const d2 = transRectY * (1 - t2) + neckDiameter * t2;
const r2 = neckRadius + (Math.min(w2, d2) / 2 - neckRadius) * 0.6;
const slab2raw = box(w2, d2, slabH);
const slab2cyl = cylinder(slabH, r2);
const s2 = slab2raw.intersect(slab2cyl)
    .translate(0, 0, flangeThickness + slabH * 2 + slabH / 2);

// Station t=0.75
const t3 = 0.75;
const w3 = transRectX * (1 - t3) + neckDiameter * t3;
const d3 = transRectY * (1 - t3) + neckDiameter * t3;
const r3 = neckRadius + (Math.min(w3, d3) / 2 - neckRadius) * 0.25;
const slab3raw = box(w3, d3, slabH);
const slab3cyl = cylinder(slabH, r3);
const s3 = slab3raw.intersect(slab3cyl)
    .translate(0, 0, flangeThickness + slabH * 3 + slabH / 2);

// Station t=1.0: pure circle r=15 at top of transition
const s4 = cylinder(slabH, neckRadius)
    .translate(0, 0, flangeThickness + slabH * 4 + slabH / 2);

// --- Union the transition slabs ---
const transition = s0.union(s1).union(s2).union(s3).union(s4);

// --- Union all three main components ---
const body = flange.union(transition).union(neck);

// --- Appearance ---
const finalShape = body.color("#5a9fd4");

return {
    "rectangular-to-round-duct-transition-ada": finalShape,
};
