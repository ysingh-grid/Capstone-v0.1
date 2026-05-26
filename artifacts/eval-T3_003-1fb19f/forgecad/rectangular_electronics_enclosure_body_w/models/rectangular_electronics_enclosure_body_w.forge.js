/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Rectangular electronics enclosure body with 4mm filleted vertical corners, open top, 2mm wall thickness (shelled inward), and four 8mm diameter internal screw bosses with 3mm through-holes.
 * Workflow ID : eval-T3_003-1fb19f
 * Trace ID    : 0ab43b33-cba2-4b9d-a28a-b215b2624a12
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 70.0 × 50.0 × 30.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 4 hole(s) of diameter 3.0 mm (×4)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.98
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_003-1fb19f/step/T3_003_outer0_attempt0.step
 *   STL    : artifact://eval-T3_003-1fb19f/stl/T3_003_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the 2mm shell is applied inward from the outer filleted box. The floor thickness should end up at 2mm (Z=0 to Z=2). The four screw bosses must be modeled as cylinders starting at Z=2 and ending at Z=30. The 3mm holes must cut completely through both the bosses and the bottom floor (Z=0 to Z=30).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Rectangular Electronics Enclosure Body
 * 
 * A parametric electronics enclosure featuring filleted corners,
 * an open top with a 2mm shell, and 4 internal screw bosses with through-holes.
 */

// Define parameters
const outerWidth = Param.number("Outer Width (X)", 70, { min: 10, max: 500, unit: "mm" });
const outerDepth = Param.number("Outer Depth (Y)", 50, { min: 10, max: 500, unit: "mm" });
const outerHeight = Param.number("Outer Height (Z)", 30, { min: 5, max: 300, unit: "mm" });
const outerFillet = Param.number("Corner Fillet Radius", 4, { min: 0.1, max: 20, unit: "mm" });
const wallThickness = Param.number("Wall Thickness", 2, { min: 0.5, max: 10, unit: "mm" });
const floorThickness = Param.number("Floor Thickness", 2, { min: 0.5, max: 10, unit: "mm" });
const bossDiameter = Param.number("Boss Outer Diameter", 8, { min: 2, max: 30, unit: "mm" });
const bossHoleDiameter = Param.number("Boss Hole Diameter", 3, { min: 1, max: 20, unit: "mm" });
const bossPosX = Param.number("Boss Position X", 27, { min: 0, max: 250, unit: "mm" });
const bossPosY = Param.number("Boss Position Y", 17, { min: 0, max: 250, unit: "mm" });

// Calculate helper dimensions
const innerHeight = outerHeight - floorThickness;
const innerFillet = Math.max(0.1, outerFillet - wallThickness);
const bossRadius = bossDiameter / 2;
const holeRadius = bossHoleDiameter / 2;

// Corner centers for the fillets
const cx = outerWidth / 2 - outerFillet;
const cy = outerDepth / 2 - outerFillet;

// 1. Build the outer filleted box
const outerBoxX = box(outerWidth - 2 * outerFillet, outerDepth, outerHeight);
const outerBoxY = box(outerWidth, outerDepth - 2 * outerFillet, outerHeight);
const oc1 = cylinder(outerHeight, outerFillet).translate(cx, cy, 0);
const oc2 = cylinder(outerHeight, outerFillet).translate(-cx, cy, 0);
const oc3 = cylinder(outerHeight, outerFillet).translate(cx, -cy, 0);
const oc4 = cylinder(outerHeight, outerFillet).translate(-cx, -cy, 0);
const outerShape = outerBoxX.union(outerBoxY).union(oc1).union(oc2).union(oc3).union(oc4);

// 2. Build the inner cavity to subtract (shelled inward)
const innerBoxX = box(outerWidth - 2 * outerFillet, outerDepth - 2 * wallThickness, innerHeight);
const innerBoxY = box(outerWidth - 2 * wallThickness, outerDepth - 2 * outerFillet, innerHeight);
const ic1 = cylinder(innerHeight, innerFillet).translate(cx, cy, 0);
const ic2 = cylinder(innerHeight, innerFillet).translate(-cx, cy, 0);
const ic3 = cylinder(innerHeight, innerFillet).translate(cx, -cy, 0);
const ic4 = cylinder(innerHeight, innerFillet).translate(-cx, -cy, 0);
const innerCavity = innerBoxX.union(innerBoxY).union(ic1).union(ic2).union(ic3).union(ic4).translate(0, 0, floorThickness);

// 3. Subtract the cavity to form the basic shelled enclosure
const shelledBody = outerShape.subtract(innerCavity);

// 4. Create the four internal screw bosses
const bossHeight = outerHeight - floorThickness;
const b1 = cylinder(bossHeight, bossRadius).translate(bossPosX, bossPosY, floorThickness);
const b2 = cylinder(bossHeight, bossRadius).translate(-bossPosX, bossPosY, floorThickness);
const b3 = cylinder(bossHeight, bossRadius).translate(bossPosX, -bossPosY, floorThickness);
const b4 = cylinder(bossHeight, bossRadius).translate(-bossPosX, -bossPosY, floorThickness);
const bodyWithBosses = shelledBody.union(b1).union(b2).union(b3).union(b4);

// 5. Create the through-holes to subtract
const holeHeight = outerHeight + 2;
const h1 = cylinder(holeHeight, holeRadius).translate(bossPosX, bossPosY, -1);
const h2 = cylinder(holeHeight, holeRadius).translate(-bossPosX, bossPosY, -1);
const h3 = cylinder(holeHeight, holeRadius).translate(bossPosX, -bossPosY, -1);
const h4 = cylinder(holeHeight, holeRadius).translate(-bossPosX, -bossPosY, -1);

// 6. Subtract the holes to get the final enclosure design
const finalEnclosure = bodyWithBosses.subtract(h1).subtract(h2).subtract(h3).subtract(h4).color("#3a4f7c");

// Return the constructed part
return {
  "rectangular-electronics-enclosure-body-w": finalEnclosure,
};
