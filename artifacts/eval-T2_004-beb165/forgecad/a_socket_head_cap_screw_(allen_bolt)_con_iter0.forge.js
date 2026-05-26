/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A socket head cap screw (allen bolt) consisting of an 8mm diameter shaft, a 13mm diameter head, and a 6mm (across flats) hexagonal socket recess.
 * Workflow ID : eval-T2_004-beb165
 * Trace ID    : 677031d4-a535-4f31-9867-298f7056d899
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 13.0 × 13.0 × 33.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 6.93 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T2_004-beb165/step/T2_004_outer0_attempt0.step
 *   STL    : artifact://eval-T2_004-beb165/stl/T2_004_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The shaft starts at Z=0 and goes up to Z=25. The head is positioned from Z=25 to Z=33. The hexagonal socket is subtracted from the top of the head, starting at Z=33 and going down to Z=29 (depth of 4mm). The model must be centered at X=0, Y=0.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Socket Head Cap Screw (Allen Bolt)
 * A parametric model of an M8-style socket head cap screw.
 */

// Define parameters for live sliders in the studio
const shaftDiameter = Param.number("Shaft Diameter", 8.0, { min: 1.0, max: 50.0, unit: "mm" });
const shaftLength   = Param.number("Shaft Length", 25.0, { min: 1.0, max: 200.0, unit: "mm" });
const headDiameter  = Param.number("Head Diameter", 13.0, { min: 2.0, max: 100.0, unit: "mm" });
const headHeight    = Param.number("Head Height", 8.0, { min: 1.0, max: 100.0, unit: "mm" });
const hexFlats      = Param.number("Hex Across Flats", 6.0, { min: 1.0, max: 50.0, unit: "mm" });
const hexCorners    = Param.number("Hex Across Corners", 6.93, { min: 1.1, max: 60.0, unit: "mm" });
const hexDepth      = Param.number("Hex Socket Depth", 4.0, { min: 1.0, max: 50.0, unit: "mm" });

// 1. Create the cylindrical shaft (aligned along Z, starts at Z=0)
const shaft = cylinder(shaftLength, shaftDiameter / 2);

// 2. Create the cylindrical head on top of the shaft
const head = cylinder(headHeight, headDiameter / 2).translate(0, 0, shaftLength);

// 3. Create the hexagonal socket tool using intersection of three rotated boxes
const toolHeight = hexDepth + 1.0; // Extra height to ensure a clean cut through the top face
const box1 = box(hexCorners, hexFlats, toolHeight);
const box2 = box(hexCorners, hexFlats, toolHeight).rotate([0, 0, 1], 60);
const box3 = box(hexCorners, hexFlats, toolHeight).rotate([0, 0, 1], 120);
const hexTool = box1.intersect(box2).intersect(box3).translate(0, 0, shaftLength + headHeight - hexDepth);

// 4. Assemble the parts using boolean operations
const blankScrew = shaft.union(head);
const finalScrew = blankScrew.subtract(hexTool).color("#8a95a5");

// 5. Return the completed geometry mapping to the expected part name
return {
  "a-socket-head-cap-screw-(allen-bolt)-con": finalScrew,
};
