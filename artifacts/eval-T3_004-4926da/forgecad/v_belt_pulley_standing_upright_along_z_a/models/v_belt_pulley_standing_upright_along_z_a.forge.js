/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : V-belt pulley standing upright along Z axis, centered at XY origin. Outer diameter 60mm, 20mm wide, 12mm central bore, with V-groove profile revolved 360 degrees and a keyway slot cut into the bore.
 * Workflow ID : eval-T3_004-4926da
 * Trace ID    : 336499dc-0c67-46cd-a124-a1e14025571e
 * Iteration   : 2
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 60.0 × 60.0 × 20.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   [hole] hole_group_1: 1 hole(s) of diameter 12 mm
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T3_004-4926da/step/T3_004_outer2_attempt0.step
 *   STL    : artifact://eval-T3_004-4926da/stl/T3_004_outer2_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Profile vertices for the revolved solid in (X, Z) order: (6,0) -> (30,0) -> (30,5) -> (20,10) -> (30,15) -> (30,20) -> (6,20) -> (6,0). Revolve this closed polygon 360 degrees around the Z axis using CadQuery or similar. The keyway is a box cut: X from 6 to 8.5 (radial depth 2.5mm from bore surface), Y from -2 to +2 (4mm wide centered on XZ plane), Z from 0 to 20. The keyway is positioned on the +X side, so it cuts into the bore wall radially outward. Ensure the revolved profile is treated as a closed wire/face before revolving. The bore is implicit in the profile (inner edge at X=6), so no separate bore subtraction is needed if the profile correctly starts and ends at X=6. Double-check that the polygon is closed and non-self-intersecting before revolving.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * V-Belt Pulley - Standing upright along Z axis
 * Outer diameter 60mm, 20mm wide, 12mm bore, V-groove profile
 */

// Parameters
const outerRadius     = Param.number("Outer Radius",     30,   { min: 10,  max: 100, unit: "mm" });
const boreRadius      = Param.number("Bore Radius",       6,   { min: 2,   max: 20,  unit: "mm" });
const pulleyWidth     = Param.number("Pulley Width",     20,   { min: 5,   max: 80,  unit: "mm" });
const grooveRootR     = Param.number("Groove Root R",    20,   { min: 5,   max: 80,  unit: "mm" });
const grooveRootZ     = Param.number("Groove Root Z",    10,   { min: 1,   max: 40,  unit: "mm" });
const botFlangeZ      = Param.number("Bot Flange Z",      5,   { min: 1,   max: 20,  unit: "mm" });
const topFlangeZ      = Param.number("Top Flange Z",     15,   { min: 1,   max: 40,  unit: "mm" });
const keyWidth        = Param.number("Keyway Width",      4,   { min: 1,   max: 10,  unit: "mm" });
const keyDepth        = Param.number("Keyway Depth",      2.5, { min: 0.5, max: 10,  unit: "mm" });

// Build the pulley body by approximating the revolved profile using boolean ops on cylinders.
// Profile in (R, Z): (6,0)->(30,0)->(30,5)->(20,10)->(30,15)->(30,20)->(6,20)->(6,0)
// Strategy: build the solid of revolution as a large outer cylinder, then subtract
// the V-groove channel, keeping flanges intact.

// Full outer cylinder: R=30, height=20, centered at Z=10
const outerCyl = cylinder(pulleyWidth, outerRadius)
  .translate(0, 0, pulleyWidth / 2);

// Central bore cylinder: R=6, height=20
const boreCyl = cylinder(pulleyWidth + 2, boreRadius)
  .translate(0, 0, pulleyWidth / 2);

// The V-groove is formed by two conical cuts meeting at the groove root.
// Bottom cone: from Z=5 (R=30) to Z=10 (R=20) — cut a frustum-shaped region.
// We approximate each sloped wall of the groove with a subtracted frustum (tapered box approach).
// We use thin cylinder slices at the groove root plus angled boxes.

// Better approach: approximate the groove with a subtracted "diamond" torus-like shape
// using a large box that is angled, revolved mentally as cone frusta.

// Build bottom groove wedge as a box rotated: slope from (R=30,Z=5) to (R=20,Z=10)
// Radial span: 10mm, Z span: 5mm, slope angle = atan(10/5) = ~63.4 deg from Z axis
// We subtract the groove region by using a cylinder at the root + two angled cuts.

// Approximate: subtract a toroidal groove region using a cylinder that is the
// inner hollow, plus two frustum-like boxes for the groove walls.

// The groove shape in cross-section (2D) is a chevron: two lines meeting at (20,10).
// We model it as two rotated boxes (one per slope face) revolved around Z.
// Each slope, when revolved, sweeps a conical shell. We approximate with a
// large annular region box that is rotated.

// Groove lower slope: from (30,5) to (20,10). Rise=5mm, Run=10mm inward.
// We cut a cone-frustum region using a cylinder of R=30 and subtracting a smaller cone.
// Since we don't have a native cone, we use tilted cylinder approximation.

// Simpler robust approach: build pulley as three stacked cylinders for the solid regions,
// then no subtraction needed for the basic shape — decompose the profile into rings.

// The solid profile swept around Z breaks into these horizontal bands:
// Band 1: Z=0 to Z=5:   full disk R=6 to R=30 (bottom flange)
// Band 2: Z=5 to Z=10:  disk that linearly tapers from R=30 at Z=5 to R=20 at Z=10 (lower groove wall) — a frustum
// Band 3: Z=10 to Z=15: disk that linearly tapers from R=20 at Z=10 to R=30 at Z=15 (upper groove wall) — a frustum
// Band 4: Z=15 to Z=20: full disk R=6 to R=30 (top flange)

// ForgeCAD has box and cylinder only. We approximate frusta with cylinders at their
// average radius and subtract the missing triangular cross-section using angled boxes.

// Flange cylinders (annular = full cylinder minus bore, handled at the end)
const botFlange = cylinder(botFlangeZ, outerRadius)
  .translate(0, 0, botFlangeZ / 2);

const topFlange = cylinder(pulleyWidth - topFlangeZ, outerRadius)
  .translate(0, 0, topFlangeZ + (pulleyWidth - topFlangeZ) / 2);

// For the groove walls, approximate with cylinder at groove root radius (R=20)
// spanning Z=5 to Z=15 (the full groove zone)
const grooveZoneHeight = topFlangeZ - botFlangeZ; // 10mm
const grooveCyl = cylinder(grooveZoneHeight, grooveRootR)
  .translate(0, 0, botFlangeZ + grooveZoneHeight / 2);

// Union the three main solid zones
const pulleyBody = botFlange.union(topFlange).union(grooveCyl);

// Now we need to add the sloped groove walls (frusta).
// Lower groove wall: a cone-like region. We approximate by adding a frustum
// modeled as a box rotated around Z, placed as an annular "wedge ring".
// The lower slope sweeps from (R=30, Z=5) inward to (R=20, Z=10).
// Half-angle from axis = atan((30-20)/(10-5)) = atan(2) ≈ 63.4° from Z
// We model each frustum as an angled box region subtracted from the outer cylinder zone.

// Add the outer groove zone cylinder (R=30) for Z=5 to Z=15 and subtract groove hollow
const grooveOuterCyl = cylinder(grooveZoneHeight, outerRadius)
  .translate(0, 0, botFlangeZ + grooveZoneHeight / 2);

// The groove hollow to subtract from the outer groove zone:
// It's a chevron: from (R=30,Z=5) slopes in to (R=20,Z=10) then out to (R=30,Z=15).
// We carve it by subtracting a box that represents the V-shape region.
// The V-groove cross-section (half, in RZ plane) is a triangle:
//   (30,5), (20,10), (30,15) — an isoceles triangle.
// We approximate the subtraction with two angled box cuts, each representing one slope.

// Lower groove cut: a tilted box angled to represent the slope from (R=30,Z=5) to (R=20,Z=10)
// The slope length = sqrt(10^2 + 5^2) ≈ 11.18mm
// We create an oversized cylinder and cut it with angled boxes to get the conical surface.

// Lower groove slope box: sits at Z midpoint of lower slope = 7.5, R midpoint = 25
// The slope vector is (-10, +5) in (R,Z). We rotate a thin rectangular slab.
const lowerSlopLen = Math.sqrt(10 * 10 + 5 * 5); // ~11.18
const lowerSlopAngle = Math.atan2(10, 5) * 180 / Math.PI; // ~63.4 deg from Z axis

// Create a large flat slab (diameter 80 × thickness) representing the lower groove plane
// rotated so it aligns with the slope, then subtract from the groove zone.
// The slab: width=80 (Y), depth=80 (X), thin along slope normal, placed to cut groove.

// Normal to lower slope: slope dir in RZ is (-10,5) normalized: (-2/sqrt5, 1/sqrt5)
// Normal in RZ: (1/sqrt5, 2/sqrt5) → rotate a slab so its thin axis aligns with normal.
// Thickness of slab should be generous (e.g. 40mm) to ensure it cuts all material above slope.

// Lower groove cut slab: rotate around Y axis
// The slope from (30,5) to (20,10): midpoint at (25, 7.5)
// We tilt a box: lowerSlopAngle degrees from Z, positioned at midpoint
const lowerGrooveCut = box(120, 120, 40)
  .rotate([0, 1, 0], lowerSlopAngle)
  .translate(25 + 20, 0, 7.5); // shift so cutting edge hits the slope line

// Upper groove slope: from (20,10) to (30,15): midpoint at (25, 12.5)
// Slope vector: (+10, +5) in (R,Z), angle from Z = atan(10/5) = ~63.4 deg but mirrored
const upperGrooveCut = box(120, 120, 40)
  .rotate([0, 1, 0], -lowerSlopAngle)
  .translate(25 + 20, 0, 12.5);

// Subtract groove cuts from outer groove zone cylinder
const grooveZoneShaped = grooveOuterCyl
  .subtract(lowerGrooveCut)
  .subtract(upperGrooveCut);

// Combine pulley body with shaped groove zone
const pulleyRaw = pulleyBody.union(grooveZoneShaped);

// Subtract the central bore (full height)
const boreHole = cylinder(pulleyWidth + 4, boreRadius)
  .translate(0, 0, pulleyWidth / 2);

const pulleyWithBore = pulleyRaw.subtract(boreHole);

// Keyway slot: X from boreRadius(6) to boreRadius+keyDepth(8.5), Y from -keyWidth/2 to +keyWidth/2, Z=0 to 20
// Box centered: X center = (6 + 8.5)/2 = 7.25, Y center = 0, Z center = 10
const keyXCenter = boreRadius + keyDepth / 2; // 7.25
const keyBox = box(keyDepth, keyWidth, pulleyWidth + 2)
  .translate(keyXCenter, 0, pulleyWidth / 2);

const finalShape = pulleyWithBore.subtract(keyBox);

return {
  "v-belt-pulley-standing-upright-along-z-a": finalShape,
};
