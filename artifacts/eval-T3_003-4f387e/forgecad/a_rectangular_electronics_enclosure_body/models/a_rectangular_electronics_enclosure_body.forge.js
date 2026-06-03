/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A rectangular electronics enclosure body with four internal screw bosses, open on top, shelled with 2mm thickness, featuring 4mm vertical edge fillets and through-holes in the bosses.
 * Workflow ID : eval-T3_003-4f387e
 * Trace ID    : 47925cf8-f3bf-4adc-9d16-107f7b4bea53
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
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_003-4f387e/step/T3_003_outer0_attempt0.step
 *   STL    : artifact://eval-T3_003-4f387e/stl/T3_003_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the box is centered at (0,0,0) with its base at Z=0. Perform the 2mm inward shell operation with the top face (+Z) removed before adding the screw bosses, or ensure the bosses are not hollowed out by the shell. The screw bosses should extend from the inner floor at Z=2 to the top rim at Z=30. The 3mm through-holes must penetrate completely through both the bosses and the floor (from Z=0 to Z=30).
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * @file electronics_enclosure.forge.js
 * @description Parametric rectangular electronics enclosure body with internal screw bosses and filleted edges.
 */

// --- PARAMETERS ---
const outerWidth = Param.number("Outer Width", 70, { min: 10, max: 200, unit: "mm" });
const outerDepth = Param.number("Outer Depth", 50, { min: 10, max: 200, unit: "mm" });
const outerHeight = Param.number("Outer Height", 30, { min: 5, max: 100, unit: "mm" });
const filletRadius = Param.number("Fillet Radius", 4, { min: 0.5, max: 15, unit: "mm" });
const wallThickness = Param.number("Wall Thickness", 2, { min: 1, max: 10, unit: "mm" });
const floorThickness = Param.number("Floor Thickness", 2, { min: 1, max: 10, unit: "mm" });
const bossOD = Param.number("Boss Outer Diameter", 8, { min: 4, max: 20, unit: "mm" });
const bossID = Param.number("Boss Inner Diameter", 3, { min: 1, max: 10, unit: "mm" });
const bossXOffset = Param.number("Boss X Offset", 27, { min: 0, max: 90, unit: "mm" });
const bossYOffset = Param.number("Boss Y Offset", 17, { min: 0, max: 90, unit: "mm" });

// --- HELPER FUNCTIONS ---
// Generates a rounded box centered on XY, extending up to height H
function createRoundedBox(w, d, h, r) {
  const b1 = box(w, d - 2 * r, h);
  const b2 = box(w - 2 * r, d, h);
  const c1 = cylinder(h, r).translate(w / 2 - r, d / 2 - r, 0);
  const c2 = cylinder(h, r).translate(-(w / 2 - r), d / 2 - r, 0);
  const c3 = cylinder(h, r).translate(w / 2 - r, -(d / 2 - r), 0);
  const c4 = cylinder(h, r).translate(-(w / 2 - r), -(d / 2 - r), 0);
  return b1.union(b2).union(c1).union(c2).union(c3).union(c4);
}

// --- GEOMETRY GENERATION ---

// 1. Create the outer filleted enclosure body
const outerBody = createRoundedBox(outerWidth, outerDepth, outerHeight, filletRadius);

// 2. Create the inner cavity to subtract
const innerWidth = outerWidth - 2 * wallThickness;
const innerDepth = outerDepth - 2 * wallThickness;
const innerHeight = outerHeight - floorThickness;
const innerRadius = Math.max(0.1, filletRadius - wallThickness);
const innerCavity = createRoundedBox(innerWidth, innerDepth, innerHeight, innerRadius)
  .translate(0, 0, floorThickness);

// 3. Shell the enclosure by subtracting the inner cavity
const shelledBody = outerBody.subtract(innerCavity);

// 4. Create the four solid screw bosses (from inner floor to rim height)
const bossHeight = outerHeight - floorThickness;
const bossRadius = bossOD / 2;
const b1 = cylinder(bossHeight, bossRadius).translate(bossXOffset, bossYOffset, floorThickness);
const b2 = cylinder(bossHeight, bossRadius).translate(-bossXOffset, bossYOffset, floorThickness);
const b3 = cylinder(bossHeight, bossRadius).translate(bossXOffset, -bossYOffset, floorThickness);
const b4 = cylinder(bossHeight, bossRadius).translate(-bossXOffset, -bossYOffset, floorThickness);
const bosses = b1.union(b2).union(b3).union(b4);

// 5. Union the bosses with the shelled enclosure
const bodyWithBosses = shelledBody.union(bosses);

// 6. Create the through-holes that penetrate the bosses and the floor
const holeRadius = bossID / 2;
const h1 = cylinder(outerHeight, holeRadius).translate(bossXOffset, bossYOffset, 0);
const h2 = cylinder(outerHeight, holeRadius).translate(-bossXOffset, bossYOffset, 0);
const h3 = cylinder(outerHeight, holeRadius).translate(bossXOffset, -bossYOffset, 0);
const h4 = cylinder(outerHeight, holeRadius).translate(-bossXOffset, -bossYOffset, 0);
const holes = h1.union(h2).union(h3).union(h4);

// 7. Subtract holes to produce final enclosure
const finalEnclosure = bodyWithBosses.subtract(holes).color("#2b5c8f");

// --- RETURN OUTPUT ---
return {
  "a-rectangular-electronics-enclosure-body": finalEnclosure,
};
