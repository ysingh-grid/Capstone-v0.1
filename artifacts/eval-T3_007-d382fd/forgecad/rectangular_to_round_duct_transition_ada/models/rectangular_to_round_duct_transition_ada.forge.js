/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Rectangular-to-round duct transition adapter with bottom rectangular flange, smooth lofted midsection, and top cylindrical neck, centered at XY origin, standing upright along Z axis.
 * Workflow ID : eval-T3_007-d382fd
 * Trace ID    : 42087059-8f8f-4a65-8eaa-033df4d0124d
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
 *   STEP   : artifact://eval-T3_007-d382fd/step/T3_007_outer0_attempt0.step
 *   STL    : artifact://eval-T3_007-d382fd/stl/T3_007_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Use CadQuery loft operation between a 60x40mm rectangular wire at Z=3 and a 30mm-diameter circular wire at Z=53 for the transition section. Ensure all three sections share the same XY centroid at the origin. The flange is a solid rectangular box (70x50x3mm) from Z=0 to Z=3. The loft should be a smooth ruled/spline surface — no sharp kinks. The cylindrical neck is a simple solid cylinder of diameter 30mm from Z=53 to Z=63. Union all three solids together. No through-holes or bolt patterns are specified. Wall thickness is not specified (treat as solid geometry). Volume estimate is approximate for solid construction.
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
 * Flange (Z=0..3) → Lofted Transition (Z=3..53) → Cylindrical Neck (Z=53..63)
 */

// Parameters
const flangeX      = Param.number("Flange X",          70,  { min: 20,  max: 300, unit: "mm" });
const flangeY      = Param.number("Flange Y",          50,  { min: 10,  max: 200, unit: "mm" });
const flangeThick  = Param.number("Flange Thickness",   3,  { min: 1,   max: 20,  unit: "mm" });
const transBottomX = Param.number("Transition Bot X",  60,  { min: 10,  max: 280, unit: "mm" });
const transBottomY = Param.number("Transition Bot Y",  40,  { min: 10,  max: 180, unit: "mm" });
const transHeight  = Param.number("Transition Height", 50,  { min: 5,   max: 400, unit: "mm" });
const neckDiam     = Param.number("Neck Diameter",     30,  { min: 5,   max: 150, unit: "mm" });
const neckHeight   = Param.number("Neck Height",       10,  { min: 2,   max: 100, unit: "mm" });

// Derived values
const neckRadius   = neckDiam / 2;
const transZStart  = flangeThick;
const transZEnd    = flangeThick + transHeight;
const neckZStart   = transZEnd;

// --- Section 1: Rectangular mounting flange (Z=0 to Z=flangeThick) ---
// box() is centered on XY and extends in +Z
const flange = box(flangeX, flangeY, flangeThick)
    .translate(0, 0, flangeThick / 2)
    .color("#5f87c6");

// --- Section 3: Cylindrical neck (Z=neckZStart to Z=neckZStart+neckHeight) ---
// cylinder centered on XY, translated so base sits at neckZStart
const neck = cylinder(neckHeight, neckRadius)
    .translate(0, 0, neckZStart + neckHeight / 2)
    .color("#5f87c6");

// --- Section 2: Lofted transition approximation ---
// ForgeCAD has no loft primitive, so we approximate the smooth transition
// using a stack of interpolated cross-sections unioned together.
// We use 4 intermediate steps (total 5 slabs) to keep boolean count low.

// Helper: at normalized t in [0,1], interpolate from rect (transBottomX x transBottomY)
// to circle of neckRadius. We approximate the circular top as a small box capped cylinder.
// Strategy: build a tapered outer hull as a subtraction of a large cylinder from a
// box-taper stack, but simplest valid approach is a pyramid-like taper using 4 slabs.

const slabCount = 4; // 4 slabs → 3 boolean unions, well within limit
const slabH = transHeight / slabCount;

// t=0: rect 60x40, t=1: circle ~ square inscribed then blend
// We approximate each cross-section as an ellipse-like box that tapers
// from transBottomX x transBottomY to neckDiam x neckDiam

// Slab 0: bottom of transition (t=0 → t=0.25)
const t0 = 0;
const t1 = 0.25;
const t2 = 0.5;
const t3 = 0.75;
const t4 = 1.0;

const sx0 = transBottomX;
const sy0 = transBottomY;
const sx1 = transBottomX + (neckDiam - transBottomX) * t1;
const sy1 = transBottomY + (neckDiam - transBottomY) * t1;
const sx2 = transBottomX + (neckDiam - transBottomX) * t2;
const sy2 = transBottomY + (neckDiam - transBottomY) * t2;
const sx3 = transBottomX + (neckDiam - transBottomX) * t3;
const sy3 = transBottomY + (neckDiam - transBottomY) * t3;
const sx4 = neckDiam;
const sy4 = neckDiam;

// Build each slab as a box sized to its bottom face, placed at the correct Z
// Each slab spans one interval; width/height is the average of bottom and top of interval

const slabW0 = (sx0 + sx1) / 2;
const slabD0 = (sy0 + sy1) / 2;
const slabZ0 = transZStart + slabH * 0;

const slabW1 = (sx1 + sx2) / 2;
const slabD1 = (sy1 + sy2) / 2;
const slabZ1 = transZStart + slabH * 1;

const slabW2 = (sx2 + sx3) / 2;
const slabD2 = (sy2 + sy3) / 2;
const slabZ2 = transZStart + slabH * 2;

const slabW3 = (sx3 + sx4) / 2;
const slabD3 = (sy3 + sy4) / 2;
const slabZ3 = transZStart + slabH * 3;

// Create slab boxes, each centered on XY, translated to sit in their Z band
const slab0 = box(slabW0, slabD0, slabH).translate(0, 0, slabZ0 + slabH / 2);
const slab1 = box(slabW1, slabD1, slabH).translate(0, 0, slabZ1 + slabH / 2);
const slab2 = box(slabW2, slabD2, slabH).translate(0, 0, slabZ2 + slabH / 2);
const slab3 = box(slabW3, slabD3, slabH).translate(0, 0, slabZ3 + slabH / 2);

// Union slabs into transition body
const transBody = slab0.union(slab1).union(slab2).union(slab3).color("#5f87c6");

// --- Final assembly: union all three sections ---
const finalShape = flange.union(transBody).union(neck).color("#5f87c6");

return {
    "rectangular-to-round-duct-transition-ada": finalShape,
};
