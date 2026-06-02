/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Spoked handwheel lying flat on XY plane, centered at origin. Comprises a central hub cylinder with center bore, four rectangular spokes at 90-degree intervals, and an outer ring rim. All components share a common base at Z=0.
 * Workflow ID : eval-T3_022-3831c2
 * Trace ID    : ad8d5aef-2a61-4d32-929b-dbc2db09a65b
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 100.0 × 100.0 × 12.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 14 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_022-3831c2/step/T3_022_outer0_attempt0.step
 *   STL    : artifact://eval-T3_022-3831c2/stl/T3_022_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Construction strategy: (1) Create hub cylinder radius=15, height=12, centered at origin. (2) Subtract center bore cylinder radius=7, height=12. (3) Create rim as outer cylinder radius=50 height=8 minus inner cylinder radius=44 height=8. (4) Create four spokes as rectangular boxes: for X-aligned spokes use Box(length=29, width=8, height=8) centered at (±29.5, 0, 4); for Y-aligned spokes use Box(length=8, width=29, height=8) centered at (0, ±29.5, 4). (5) Union hub + rim + all four spokes, then subtract bore. Spoke length of 29mm exactly bridges from hub outer edge (r=15) to rim inner edge (r=44): 44-15=29mm. Spokes are centered at Z=4 (half of 8mm height) matching rim height. Hub protrudes 4mm above rim/spokes (Z=8 to Z=12). Ensure boolean union is clean with no gap between spoke ends and hub/rim surfaces.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Spoked Handwheel - lying flat on XY plane, centered at origin
 * Hub (30mm OD, 12mm tall) + outer rim (100mm OD / 88mm ID, 8mm tall)
 * + four rectangular spokes at 0/90/180/270 degrees + 14mm center bore
 */

// Parameters
const hubRadius       = Param.number("Hub Radius",        15,   { min: 5,   max: 50,  unit: "mm" });
const hubHeight       = Param.number("Hub Height",        12,   { min: 4,   max: 30,  unit: "mm" });
const boreRadius      = Param.number("Bore Radius",        7,   { min: 1,   max: 20,  unit: "mm" });
const rimOuterRadius  = Param.number("Rim Outer Radius",  50,   { min: 20,  max: 200, unit: "mm" });
const rimInnerRadius  = Param.number("Rim Inner Radius",  44,   { min: 15,  max: 190, unit: "mm" });
const rimHeight       = Param.number("Rim Height",         8,   { min: 2,   max: 20,  unit: "mm" });
const spokeWidth      = Param.number("Spoke Width",        8,   { min: 2,   max: 20,  unit: "mm" });
const spokeLength     = Param.number("Spoke Length",      29,   { min: 5,   max: 150, unit: "mm" });
const spokeCenterR    = Param.number("Spoke Center R",    29.5, { min: 5,   max: 150, unit: "mm" });

// Hub cylinder: radius=hubRadius, height=hubHeight, base at Z=0
// box() is centered on XY; cylinder(height, radius) axis along Z
const hubSolid = cylinder(hubHeight, hubRadius)
    .translate(0, 0, hubHeight / 2);

// Center bore cylinder: radius=boreRadius, height=hubHeight
const bore = cylinder(hubHeight, boreRadius)
    .translate(0, 0, hubHeight / 2);

// Hub with bore subtracted
const hub = hubSolid.subtract(bore);

// Outer rim: outer cylinder minus inner cylinder, height=rimHeight, base at Z=0
const rimOuter = cylinder(rimHeight, rimOuterRadius)
    .translate(0, 0, rimHeight / 2);
const rimInner = cylinder(rimHeight, rimInnerRadius)
    .translate(0, 0, rimHeight / 2);
const rim = rimOuter.subtract(rimInner);

// Spokes: box(width, depth, height) centered on XY, extends in +Z
// Spoke at 0 deg: aligned along X, length=spokeLength, width=spokeWidth, height=rimHeight
// box centered at (spokeCenterR, 0, rimHeight/2)
const spokeX_pos = box(spokeLength, spokeWidth, rimHeight)
    .translate(spokeCenterR, 0, rimHeight / 2);

// Spoke at 180 deg: aligned along X, centered at (-spokeCenterR, 0)
const spokeX_neg = box(spokeLength, spokeWidth, rimHeight)
    .translate(-spokeCenterR, 0, rimHeight / 2);

// Spoke at 90 deg: aligned along Y, length=spokeWidth, depth=spokeLength
const spokeY_pos = box(spokeWidth, spokeLength, rimHeight)
    .translate(0, spokeCenterR, rimHeight / 2);

// Spoke at 270 deg: aligned along Y, centered at (0, -spokeCenterR)
const spokeY_neg = box(spokeWidth, spokeLength, rimHeight)
    .translate(0, -spokeCenterR, rimHeight / 2);

// Union all spokes together
const spokes = spokeX_pos.union(spokeX_neg).union(spokeY_pos).union(spokeY_neg);

// Union rim and spokes, then union with hub
const rimAndSpokes = rim.union(spokes);
const finalShape = rimAndSpokes.union(hub).color("#8899aa");

return {
    "spoked-handwheel-lying-flat-on-xy-plane,": finalShape,
};
