/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Compound gear set with two spur gears of different sizes mounted on a shared cylindrical hub, centered at the origin in XY, standing upright along the Z axis, with a central bore through the full hub length.
 * Workflow ID : eval-T3_009-705b21
 * Trace ID    : 304cbeb5-20b9-41c3-868b-bcb5746fe62a
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 54.0 × 54.0 × 40.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 8 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_009-705b21/step/T3_009_outer0_attempt0.step
 *   STL    : artifact://eval-T3_009-705b21/stl/T3_009_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   1. Model all geometry as a single unified solid (hub + both gears - bore). 2. Each spur gear profile should be constructed as a star-polygon (alternating tip and root radii with N teeth) extruded along Z; use linear_extrude in OpenSCAD or equivalent. 3. The tooth profile for each gear: large gear alternates between tip radius 27mm and root radius 22mm at 24 equally spaced angular positions (15 degrees per tooth, tip and root each at 7.5 deg half-pitch); small gear alternates between tip radius 16mm and root radius 13mm at 14 equally spaced angular positions (~25.71 deg per tooth). 4. For a smooth involute-like approximation, use a polygon with 2*N points (alternating tip/root vertices) or add intermediate points for tooth flanks. 5. The bore (8mm dia) is subtracted from the full hub along the Z axis (Z=0 to Z=40), centered at XY origin. 6. Ensure the hub (radius 8mm) fully underlies both gear root circles (large root radius 22mm > 8mm, small root radius 13mm > 8mm) so the union is clean. 7. Overall bounding box is 54mm x 54mm x 40mm, centered in XY at origin.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Compound Gear Set - Two spur gears on a shared hub with central bore
 * Large gear: 24 teeth, tip R=27mm, root R=22mm, Z=3 to Z=13
 * Small gear: 14 teeth, tip R=16mm, root R=13mm, Z=20 to Z=30
 * Hub: 16mm dia, 40mm long, Z=0 to Z=40
 * Bore: 8mm dia, full length
 */

// Hub parameters
const hubDiameter   = Param.number("Hub Diameter",   16,  { min: 8,   max: 40,  unit: "mm" });
const hubLength     = Param.number("Hub Length",      40,  { min: 20,  max: 80,  unit: "mm" });
const boreDiameter  = Param.number("Bore Diameter",    8,  { min: 2,   max: 14,  unit: "mm" });

// Large gear parameters
const lgTipRadius   = Param.number("Large Tip Radius",   27, { min: 15, max: 50, unit: "mm" });
const lgRootRadius  = Param.number("Large Root Radius",  22, { min: 10, max: 45, unit: "mm" });
const lgTeeth       = Param.number("Large Tooth Count",  24, { min: 6,  max: 48  });
const lgZStart      = Param.number("Large Gear Z Start",  3, { min: 0,  max: 20, unit: "mm" });
const lgFaceWidth   = Param.number("Large Face Width",   10, { min: 3,  max: 30, unit: "mm" });

// Small gear parameters
const sgTipRadius   = Param.number("Small Tip Radius",   16, { min: 8,  max: 30, unit: "mm" });
const sgRootRadius  = Param.number("Small Root Radius",  13, { min: 5,  max: 25, unit: "mm" });
const sgTeeth       = Param.number("Small Tooth Count",  14, { min: 4,  max: 36  });
const sgZStart      = Param.number("Small Gear Z Start", 20, { min: 0,  max: 35, unit: "mm" });
const sgFaceWidth   = Param.number("Small Face Width",   10, { min: 3,  max: 30, unit: "mm" });

// Hub: cylinder centered in XY, Z=0 to Z=hubLength
const hubRadius = hubDiameter / 2;
const hub = cylinder(hubLength, hubRadius)
  .translate(0, 0, hubLength / 2);

// Large gear tooth profile: 24 teeth star polygon (2*24 = 48 vertices)
// Vertices alternate tip/root at equally spaced angles
const lgN = 24;
const lgAngleStep = 360 / lgN;

// Build large gear as root cylinder plus 24 tooth tip segments
// Root disk for large gear
const lgRoot = cylinder(lgFaceWidth, lgRootRadius)
  .translate(0, 0, lgZStart + lgFaceWidth / 2);

// Large gear tooth 1 at angle 0
const lgT0 = cylinder(lgFaceWidth, lgTipRadius)
  .translate(0, 0, lgZStart + lgFaceWidth / 2)
  .intersect(
    box(lgTipRadius * 2, lgTipRadius * 2 * Math.sin(Math.PI * lgAngleStep / 360), lgFaceWidth)
      .translate(lgTipRadius / 2, 0, lgZStart + lgFaceWidth / 2)
  );

// Use small box wedges at each tooth tip to build gear teeth
// Each tooth tip is a narrow cylinder slice: width = 2*R*sin(halfAngle)
const lgHalfAngle = (lgAngleStep / 2) * Math.PI / 180;
const lgToothWidth = 2 * lgTipRadius * Math.sin(lgHalfAngle);
const lgToothDepth = lgTipRadius - lgRootRadius;

// Each tooth as a box: depth=(tip-root), width=chord, height=faceWidth
// centered at (lgRootRadius + lgToothDepth/2) from origin, rotated to position
const lgTooth = box(lgToothDepth, lgToothWidth, lgFaceWidth)
  .translate(lgRootRadius + lgToothDepth / 2, 0, lgZStart + lgFaceWidth / 2);

// Place 24 teeth explicitly (max 12 per union batch to stay within limits)
const lgT_0  = lgTooth;
const lgT_1  = lgTooth.rotate([0,0,1],  15);
const lgT_2  = lgTooth.rotate([0,0,1],  30);
const lgT_3  = lgTooth.rotate([0,0,1],  45);
const lgT_4  = lgTooth.rotate([0,0,1],  60);
const lgT_5  = lgTooth.rotate([0,0,1],  75);
const lgT_6  = lgTooth.rotate([0,0,1],  90);
const lgT_7  = lgTooth.rotate([0,0,1], 105);
const lgT_8  = lgTooth.rotate([0,0,1], 120);
const lgT_9  = lgTooth.rotate([0,0,1], 135);
const lgT_10 = lgTooth.rotate([0,0,1], 150);
const lgT_11 = lgTooth.rotate([0,0,1], 165);
const lgT_12 = lgTooth.rotate([0,0,1], 180);
const lgT_13 = lgTooth.rotate([0,0,1], 195);
const lgT_14 = lgTooth.rotate([0,0,1], 210);
const lgT_15 = lgTooth.rotate([0,0,1], 225);
const lgT_16 = lgTooth.rotate([0,0,1], 240);
const lgT_17 = lgTooth.rotate([0,0,1], 255);
const lgT_18 = lgTooth.rotate([0,0,1], 270);
const lgT_19 = lgTooth.rotate([0,0,1], 285);
const lgT_20 = lgTooth.rotate([0,0,1], 300);
const lgT_21 = lgTooth.rotate([0,0,1], 315);
const lgT_22 = lgTooth.rotate([0,0,1], 330);
const lgT_23 = lgTooth.rotate([0,0,1], 345);

// Union large gear root with all teeth in batches
const lgBatch1 = lgRoot.union(lgT_0).union(lgT_1).union(lgT_2).union(lgT_3);
const lgBatch2 = lgT_4.union(lgT_5).union(lgT_6).union(lgT_7);
const lgBatch3 = lgT_8.union(lgT_9).union(lgT_10).union(lgT_11);
const lgBatch4 = lgT_12.union(lgT_13).union(lgT_14).union(lgT_15);
const lgBatch5 = lgT_16.union(lgT_17).union(lgT_18).union(lgT_19);
const lgBatch6 = lgT_20.union(lgT_21).union(lgT_22).union(lgT_23);
const lgGear = lgBatch1.union(lgBatch2).union(lgBatch3).union(lgBatch4).union(lgBatch5).union(lgBatch6);

// Small gear tooth profile: 14 teeth
const sgN = 14;
const sgAngleStep = 360 / sgN; // ~25.714 degrees per tooth
const sgHalfAngle = (sgAngleStep / 2) * Math.PI / 180;
const sgToothWidth = 2 * sgTipRadius * Math.sin(sgHalfAngle);
const sgToothDepth = sgTipRadius - sgRootRadius;

// Small gear root disk
const sgRoot = cylinder(sgFaceWidth, sgRootRadius)
  .translate(0, 0, sgZStart + sgFaceWidth / 2);

// Each small gear tooth box
const sgTooth = box(sgToothDepth, sgToothWidth, sgFaceWidth)
  .translate(sgRootRadius + sgToothDepth / 2, 0, sgZStart + sgFaceWidth / 2);

// Place 14 teeth at ~25.714 degree intervals
const sgT_0  = sgTooth;
const sgT_1  = sgTooth.rotate([0,0,1],  25.714);
const sgT_2  = sgTooth.rotate([0,0,1],  51.429);
const sgT_3  = sgTooth.rotate([0,0,1],  77.143);
const sgT_4  = sgTooth.rotate([0,0,1], 102.857);
const sgT_5  = sgTooth.rotate([0,0,1], 128.571);
const sgT_6  = sgTooth.rotate([0,0,1], 154.286);
const sgT_7  = sgTooth.rotate([0,0,1], 180.000);
const sgT_8  = sgTooth.rotate([0,0,1], 205.714);
const sgT_9  = sgTooth.rotate([0,0,1], 231.429);
const sgT_10 = sgTooth.rotate([0,0,1], 257.143);
const sgT_11 = sgTooth.rotate([0,0,1], 282.857);
const sgT_12 = sgTooth.rotate([0,0,1], 308.571);
const sgT_13 = sgTooth.rotate([0,0,1], 334.286);

// Union small gear in batches
const sgBatch1 = sgRoot.union(sgT_0).union(sgT_1).union(sgT_2).union(sgT_3);
const sgBatch2 = sgT_4.union(sgT_5).union(sgT_6).union(sgT_7);
const sgBatch3 = sgT_8.union(sgT_9).union(sgT_10).union(sgT_11);
const sgBatch4 = sgT_12.union(sgT_13);
const sgGear = sgBatch1.union(sgBatch2).union(sgBatch3).union(sgBatch4);

// Bore: 8mm diameter cylinder through full hub length
const boreRadius = boreDiameter / 2;
const bore = cylinder(hubLength, boreRadius)
  .translate(0, 0, hubLength / 2);

// Combine hub + large gear + small gear, then subtract bore
const combined = hub.union(lgGear).union(sgGear);
const finalShape = combined.subtract(bore).color("#5f87c6");

return {
  "compound-gear-set-with-two-spur-gears-of": finalShape,
};
