/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A compound gear set featuring two different-sized spur gears with star-polygon tooth profiles on a shared cylindrical hub with a central bore, oriented along the Z-axis.
 * Workflow ID : eval-T3_009-db2037
 * Trace ID    : bad44dbc-92d5-4ec6-b371-ecb485f83706
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 54.0 × 54.0 × 40.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 8.0 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_009-db2037/step/T3_009_outer0_attempt0.step
 *   STL    : artifact://eval-T3_009-db2037/stl/T3_009_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   To model the star-polygon gears, construct a 2D polygon in the XY plane by alternating vertices between the outer (tip) radius and inner (root) radius (2 * num_teeth total vertices), then extrude along Z. Use union to combine the hub and both gears, and finally subtract the central bore cylinder of diameter 8mm extending from Z=0 to Z=40.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file compound_gear_set.forge.js
 * @description A compound gear set featuring two different-sized spur gears on a shared hub.
 */

// Central hub parameters
const boreDiameter = Param.number("Bore Diameter", 8, { min: 2, max: 20, unit: "mm" });
const hubDiameter = Param.number("Hub Diameter", 16, { min: 10, max: 30, unit: "mm" });
const hubLength = Param.number("Hub Length", 40, { min: 10, max: 100, unit: "mm" });

// Large gear parameters
const largeGearZStart = Param.number("Large Gear Z Start", 3, { min: 0, max: 20, unit: "mm" });
const largeGearFaceWidth = Param.number("Large Gear Width", 10, { min: 2, max: 30, unit: "mm" });
const largeGearTeeth = Param.number("Large Gear Teeth", 24, { min: 8, max: 50, step: 1 });
const largeGearTipRadius = Param.number("Large Gear Tip Radius", 27, { min: 10, max: 100, unit: "mm" });
const largeGearRootRadius = Param.number("Large Gear Root Radius", 22, { min: 5, max: 90, unit: "mm" });

// Small gear parameters
const smallGearZStart = Param.number("Small Gear Z Start", 20, { min: 10, max: 50, unit: "mm" });
const smallGearFaceWidth = Param.number("Small Gear Width", 10, { min: 2, max: 30, unit: "mm" });
const smallGearTeeth = Param.number("Small Gear Teeth", 14, { min: 6, max: 30, step: 1 });
const smallGearTipRadius = Param.number("Small Gear Tip Radius", 16, { min: 5, max: 50, unit: "mm" });
const smallGearRootRadius = Param.number("Small Gear Root Radius", 13, { min: 4, max: 45, unit: "mm" });

// Calculate star-polygon vertices for the large gear
const largePoints = [];
for (let i = 0; i < largeGearTeeth * 2; i++) {
  const angle = (i * Math.PI) / largeGearTeeth;
  const r = i % 2 === 0 ? largeGearTipRadius : largeGearRootRadius;
  largePoints.push([r * Math.cos(angle), r * Math.sin(angle)]);
}

// Construct and extrude the 2D large gear shape
const largeGear2D = polygon(largePoints);
const largeGear3D = extrude(largeGear2D, 0, 0, largeGearFaceWidth).translate(0, 0, largeGearZStart);

// Calculate star-polygon vertices for the small gear
const smallPoints = [];
for (let i = 0; i < smallGearTeeth * 2; i++) {
  const angle = (i * Math.PI) / smallGearTeeth;
  const r = i % 2 === 0 ? smallGearTipRadius : smallGearRootRadius;
  smallPoints.push([r * Math.cos(angle), r * Math.sin(angle)]);
}

// Construct and extrude the 2D small gear shape
const smallGear2D = polygon(smallPoints);
const smallGear3D = extrude(smallGear2D, 0, 0, smallGearFaceWidth).translate(0, 0, smallGearZStart);

// Create the central solid hub cylinder
const hub = cylinder(hubLength, hubDiameter / 2);

// Create the bore cylinder, slightly extended to ensure a clean cut
const bore = cylinder(hubLength + 2, boreDiameter / 2).translate(0, 0, -1);

// Union the hub and both gears, then subtract the central bore
const solidGears = hub.union(largeGear3D).union(smallGear3D);
const finalShape = solidGears.subtract(bore).color("#5f87c6");

// Export the finished compound gear set
return {
  "a-compound-gear-set-featuring-two-differ": finalShape
};
