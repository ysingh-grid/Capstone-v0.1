/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Spoked handwheel lying flat on the XY plane, centered at origin. Comprises a central hub cylinder with a bore, four rectangular spokes at 90-degree intervals, and an outer rim ring.
 * Workflow ID : eval-T3_022-54a380
 * Trace ID    : 25376061-c7a1-4c6f-8885-3e8b2eda55bb
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
 *   STEP   : artifact://eval-T3_022-54a380/step/T3_022_outer0_attempt0.step
 *   STL    : artifact://eval-T3_022-54a380/stl/T3_022_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   1. Spoke length is exactly 29mm (from hub outer edge at r=15mm to rim inner edge at r=44mm: 44-15=29mm). Each spoke box should be positioned with its long axis radially, centered at r=29.5mm from origin. For X-aligned spokes (0 and 180 deg): box dimensions are length=29mm along X, width=8mm along Y, height=8mm along Z, centered at (±29.5, 0, 4). For Y-aligned spokes (90 and 270 deg): box dimensions are length=29mm along Y, width=8mm along X, height=8mm along Z, centered at (0, ±29.5, 4). 2. Hub cylinder is taller (12mm) than rim and spokes (8mm); final shape is a union of hub+spokes+rim minus the center bore. 3. In CadQuery, construct as: hub cylinder (r=15, h=12) union outer rim (annulus OD=100, ID=88, h=8) union four spoke boxes, then cut center bore (r=7, h=12). 4. Volume estimate breakdown: hub solid ~8482mm3, bore removal ~1847mm3, rim annulus ~3770mm3, four spokes ~4x(29x8x8)=7424mm3, minus spoke-hub and spoke-rim overlaps (approximate). Net estimated volume ~34800mm3 (rough). 5. All geometry centered at origin in XY; Z range is 0 to 12.
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
 * Hub: 30mm OD, 12mm tall | Rim: 100mm OD / 88mm ID, 8mm tall | 4 spokes | 14mm bore
 */

// Parameters
const hubDiameter     = Param.number("Hub Diameter",      30,  { min: 10,  max: 100,  unit: "mm" });
const hubHeight       = Param.number("Hub Height",        12,  { min: 4,   max: 40,   unit: "mm" });
const boreDiameter    = Param.number("Bore Diameter",     14,  { min: 4,   max: 28,   unit: "mm" });
const rimOD           = Param.number("Rim Outer Diameter",100, { min: 40,  max: 300,  unit: "mm" });
const rimID           = Param.number("Rim Inner Diameter", 88, { min: 30,  max: 280,  unit: "mm" });
const rimHeight       = Param.number("Rim Height",         8,  { min: 2,   max: 30,   unit: "mm" });
const spokeWidth      = Param.number("Spoke Width",        8,  { min: 2,   max: 20,   unit: "mm" });
const spokeHeight     = Param.number("Spoke Height",       8,  { min: 2,   max: 30,   unit: "mm" });
const spokeLength     = Param.number("Spoke Length",      29,  { min: 5,   max: 150,  unit: "mm" });
const spokeRadCenter  = Param.number("Spoke Radial Center",29.5,{ min: 5,  max: 140,  unit: "mm" });

// Derived radii
const hubRadius  = hubDiameter  / 2;
const boreRadius = boreDiameter / 2;
const rimORadius = rimOD / 2;
const rimIRadius = rimID / 2;

// Hub: solid cylinder, axis along Z, centered at origin in XY, then shifted to Z=0..hubHeight
const hubSolid = cylinder(hubHeight, hubRadius)
    .translate(0, 0, hubHeight / 2);

// Outer rim: outer cylinder minus inner cylinder to form ring, Z=0..rimHeight
const rimOuter = cylinder(rimHeight, rimORadius)
    .translate(0, 0, rimHeight / 2);
const rimInner = cylinder(rimHeight, rimIRadius)
    .translate(0, 0, rimHeight / 2);
const rim = rimOuter.subtract(rimInner);

// Spoke along X axis (0 deg): box(length=spokeLength, depth=spokeWidth, height=spokeHeight)
// box(width, depth, height) is centered on XY, extends +Z; translate so Z=0..spokeHeight
const spokeX = box(spokeLength, spokeWidth, spokeHeight)
    .translate(spokeRadCenter, 0, spokeHeight / 2);

// Spoke at 180 deg (negative X direction)
const spokeNegX = box(spokeLength, spokeWidth, spokeHeight)
    .translate(-spokeRadCenter, 0, spokeHeight / 2);

// Spoke along Y axis (90 deg): rotate X-spoke 90 degrees around Z
const spokeY = box(spokeWidth, spokeLength, spokeHeight)
    .translate(0, spokeRadCenter, spokeHeight / 2);

// Spoke at 270 deg (negative Y direction)
const spokeNegY = box(spokeWidth, spokeLength, spokeHeight)
    .translate(0, -spokeRadCenter, spokeHeight / 2);

// Union all spokes together
const spokes = spokeX.union(spokeNegX).union(spokeY).union(spokeNegY);

// Union hub + rim + spokes
const wheelBody = hubSolid.union(rim).union(spokes);

// Center bore: cylindrical cutout through full hub height
const bore = cylinder(hubHeight, boreRadius)
    .translate(0, 0, hubHeight / 2);

// Subtract bore from wheel body
const finalShape = wheelBody.subtract(bore)
    .color("#7a9cbf");

return {
    "spoked-handwheel-lying-flat-on-the-xy-pl": finalShape,
};
