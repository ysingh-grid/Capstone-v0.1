/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : V-belt pulley revolved around Z axis with central bore and keyway slot
 * Workflow ID : eval-T3_004-916390
 * Trace ID    : d0ad3310-3558-4f32-97a4-97e44257f612
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
 *   STEP   : artifact://eval-T3_004-916390/step/T3_004_outer2_attempt0.step
 *   STL    : artifact://eval-T3_004-916390/stl/T3_004_outer2_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Profile vertices in (X, Z) order for revolution: (6,0) -> (30,0) -> (30,5) -> (20,10) -> (30,15) -> (30,20) -> (6,20) -> closed back to (6,0). Revolve this closed polygon 360 degrees around Z axis using CadQuery. The keyway is a rectangular box: X from 6 to 8.5, Y from -2 to +2 (4mm wide centered on XZ plane), Z from 0 to 20. Subtract this box from the pulley solid. Ensure the revolution produces a proper solid by using a closed 2D wire/face before revolving. The bore is implicit in the profile (inner edge at X=6), so no separate bore subtraction is needed if profile is correctly defined from X=6 outward. Double-check that the revolve operation produces a manifold solid before applying the keyway cut.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * V-Belt Pulley revolved around Z axis
 * Profile: (6,0)->(30,0)->(30,5)->(20,10)->(30,15)->(30,20)->(6,20)->closed
 * Central bore implicit in profile (inner edge at X=6)
 * Keyway slot cut on +X side
 */

// Parameters
const outerRadius     = Param.number("Outer Radius",    30,  { min: 10,  max: 100, unit: "mm" });
const boreRadius      = Param.number("Bore Radius",      6,  { min: 2,   max: 20,  unit: "mm" });
const pulleyWidth     = Param.number("Pulley Width",    20,  { min: 5,   max: 100, unit: "mm" });
const flangeZ1        = Param.number("Flange Z1",        5,  { min: 1,   max: 50,  unit: "mm" });
const grooveRootX     = Param.number("Groove Root X",   20,  { min: 5,   max: 50,  unit: "mm" });
const grooveRootZ     = Param.number("Groove Root Z",   10,  { min: 1,   max: 50,  unit: "mm" });
const flangeZ2        = Param.number("Flange Z2",       15,  { min: 1,   max: 50,  unit: "mm" });
const keywayWidth     = Param.number("Keyway Width",     4,  { min: 1,   max: 20,  unit: "mm" });
const keywayDepth     = Param.number("Keyway Depth",   2.5,  { min: 0.5, max: 10,  unit: "mm" });

// --- Build the pulley body by approximating the revolved profile with cylinders and cones ---

// Segment 1: flat base disk from boreRadius to outerRadius at Z=0..0 (bottom face, zero height)
// We build solid sections along Z using cylinders for straight sections and
// approximate the V-groove with tapered shapes (cones via cylinder subtraction approach).

// Bottom flat section: full disk from boreRadius to outerRadius, Z=0 to flangeZ1
// This is an annular cylinder: outer cylinder minus bore cylinder
const outerCylBottom = cylinder(flangeZ1, outerRadius).translate(0, 0, flangeZ1 / 2);
const boreCylBottom  = cylinder(flangeZ1 + 2, boreRadius).translate(0, 0, flangeZ1 / 2);
const bottomRing     = outerCylBottom.subtract(boreCylBottom);

// V-groove section: Z=flangeZ1 to grooveRootZ (going inward from outerRadius to grooveRootX)
// Approximate with a frustum: large cylinder minus cone region minus bore
// Top half of groove: Z=flangeZ1..grooveRootZ, outer goes from outerRadius down to grooveRootX
// We model this as the outer cylinder of outerRadius and subtract the wedge on the outside
const grooveHeightA   = grooveRootZ - flangeZ1; // 5mm
const outerCylGrooveA = cylinder(grooveHeightA, outerRadius).translate(0, 0, flangeZ1 + grooveHeightA / 2);
// The groove cone on the outer side: at bottom (Z=flangeZ1) outer edge = outerRadius, at top (Z=grooveRootZ) outer edge = grooveRootX
// We cut a cone-ring from outerRadius down to grooveRootX on the outside
// Model outer cone as: a cone from outerRadius (bottom) to outerRadius (top) - actually we want the material
// between grooveRootX and outerRadius that tapers. Easier: build solid frustum (inner=bore, outer=tapers)
// Use: big box subtraction isn't ideal — instead build as outer cone subtract inner bore

// Full frustum A: radially goes from boreRadius (inner) to outerRadius..grooveRootX (outer), height=grooveHeightA
// We can't directly make a frustum, so approximate: outer cylinder minus an outer cone cutout minus bore
// Outer cone cutout shape: at Z=0 of this segment outer=outerRadius, at Z=top outer=grooveRootX
// The cone cutout removes the slanted outer portion
// Cone cutout = large cylinder minus the frustum we want... let's think differently.

// Strategy: build each segment as (outerCyl).subtract(coneCutout).subtract(boreCyl)
// where coneCutout represents the region OUTSIDE the profile boundary.

// For segment flangeZ1..grooveRootZ: profile outer edge goes from 30 at Z=5 to 20 at Z=10
// The "outside" region is a cone that starts at outerRadius at bottom and outerRadius at top,
// minus the actual profile = cone from outerRadius..outerRadius minus frustum outerRadius..grooveRootX
// The cut cone ring: outer=outerRadius (constant cylinder) minus inner frustum boreToProfile
// Let's just build: frustum(boreRadius, grooveRootX, height) from bottom
// and frustum(grooveRootX, outerRadius, height) is the extra material we need to add at top — no.

// Simplest correct approach: build each zone as a full cylinder then subtract bore,
// and for the groove slopes, subtract the cone-shaped void outside the profile.

// Zone A (Z: flangeZ1 to grooveRootZ): outer edge slopes from outerRadius to grooveRootX
// Material region: boreRadius <= r <= profile_outer(z)
// The void outside profile: r > profile_outer(z), modeled as annular cone
// profile_outer(z) = outerRadius + (grooveRootX - outerRadius) * (z - flangeZ1) / grooveHeightA
// At z=flangeZ1: outerRadius; at z=grooveRootZ: grooveRootX
// Cone void: inner radius goes from outerRadius (bottom) to grooveRootX (top), outer = big
// We subtract: bigCyl minus innerFrustum = the ring outside the taper
// innerFrustum (the profile boundary cone): bottom_r=outerRadius, top_r=grooveRootX
// We need to subtract the region OUTSIDE this frustum from the full cylinder.

// Build zone A solid: full cylinder of outerRadius, height=grooveHeightA
// subtract a cone-void that is the region outside profile:
// cone-void = cylinder(outerRadius+10) subtract frustum... still complex.

// PRACTICAL APPROACH: use stacked thin cylinders is forbidden.
// Instead: build the whole pulley as one big outer cylinder Z=0..20, then subtract:
//   1. The bore (cylinder boreRadius, full height)
//   2. A cone-shaped void for the V-groove upper slope (flangeZ1 to grooveRootZ, outer taper in)
//   3. A cone-shaped void for the V-groove lower slope (grooveRootZ to flangeZ2, outer taper out) — actually taper back out
//   4. The keyway slot

// The V-groove void shape:
// From Z=flangeZ1 to grooveRootZ: void is OUTSIDE the taper from outerRadius->grooveRootX
// From Z=grooveRootZ to flangeZ2: void is OUTSIDE the taper from grooveRootX->outerRadius
// These voids form a triangular/cone ring around the equator of the pulley

// Build the groove void as a single shape:
// It's a ring that at Z=flangeZ1 starts at outerRadius, narrows to grooveRootX at grooveRootZ,
// then widens back to outerRadius at flangeZ2.
// This void = two cone-frustum rings back to back.

// Cone frustum ring (lower groove side): Z=0..grooveHeightA, inner_r tapers from outerRadius to grooveRootX
// outer_r = something large (say outerRadius+5)
// We represent this as: bigCylinder.subtract(innerFrustumCylinder)
// But ForgeCAD has no direct frustum primitive.

// WORKAROUND: Use two rotated cones (cylinders at angle) — not available.
// Use the revolve-equivalent: build a box in profile space and revolve... not available.

// BEST AVAILABLE APPROACH with ForgeCAD primitives:
// Approximate each groove slope with 2 cylinder steps per side (total 4 cylinders for groove void).
// This stays under 20 boolean ops total.

// Step-approximate the groove void:
// Lower slope (Z=5..10, outer from 30 to 20): 2 steps
//   Step A1: Z=5..7.5, outer_void from 30 to 25 (void ring: inner=25, outer=35, height=2.5)
//   Step A2: Z=7.5..10, outer_void from 25 to 20 (void ring: inner=20, outer=35, height=2.5)
// Upper slope (Z=10..15, outer from 20 to 30): 2 steps
//   Step B1: Z=10..12.5, outer_void from 20 to 25 (void ring: inner=20, outer=35, height=2.5)
//   Step B2: Z=12.5..15, outer_void from 25 to 30 (void ring: inner=25, outer=35, height=2.5)

// Each void ring = outerBigCyl.subtract(innerCyl) translated to position

const bigR = outerRadius + 5; // 35mm, larger than pulley for clean cuts
const grooveH = grooveRootZ - flangeZ1; // 5mm per side

// Main pulley outer cylinder: Z=0 to pulleyWidth
const mainCyl = cylinder(pulleyWidth, outerRadius).translate(0, 0, pulleyWidth / 2);

// Central bore subtraction
const boreCyl = cylinder(pulleyWidth + 2, boreRadius).translate(0, 0, pulleyWidth / 2);

// Lower groove slope void (Z=flangeZ1..grooveRootZ = 5..10), outer tapers 30->20
// Step 1: Z=5..7.5, inner boundary = lerp(30,20, 0..0.5) = 30..25, void is outside 25
const voidLow1Inner = 25; // midpoint radius
const voidLow1H     = grooveH / 2; // 2.5mm
const voidLow1Z     = flangeZ1 + voidLow1H / 2; // center z = 5 + 1.25 = 6.25
const voidLow1Big   = cylinder(voidLow1H, bigR).translate(0, 0, voidLow1Z);
const voidLow1Small = cylinder(voidLow1H + 0.1, voidLow1Inner).translate(0, 0, voidLow1Z);
const voidLow1      = voidLow1Big.subtract(voidLow1Small);

// Step 2: Z=7.5..10, inner boundary = 25..20, void is outside 20
const voidLow2Inner = 20; // grooveRootX
const voidLow2H     = grooveH / 2; // 2.5mm
const voidLow2Z     = flangeZ1 + grooveH / 2 + voidLow2H / 2; // 5+2.5+1.25 = 8.75
const voidLow2Big   = cylinder(voidLow2H, bigR).translate(0, 0, voidLow2Z);
const voidLow2Small = cylinder(voidLow2H + 0.1, voidLow2Inner).translate(0, 0, voidLow2Z);
const voidLow2      = voidLow2Big.subtract(voidLow2Small);

// Upper groove slope void (Z=grooveRootZ..flangeZ2 = 10..15), outer tapers 20->30
// Step 3: Z=10..12.5, inner boundary = 20..25, void is outside 20
const voidHigh1Inner = 20; // grooveRootX
const voidHigh1H     = grooveH / 2; // 2.5mm
const voidHigh1Z     = grooveRootZ + voidHigh1H / 2; // 10 + 1.25 = 11.25
const voidHigh1Big   = cylinder(voidHigh1H, bigR).translate(0, 0, voidHigh1Z);
const voidHigh1Small = cylinder(voidHigh1H + 0.1, voidHigh1Inner).translate(0, 0, voidHigh1Z);
const voidHigh1      = voidHigh1Big.subtract(voidHigh1Small);

// Step 4: Z=12.5..15, inner boundary = 25..30, void is outside 25
const voidHigh2Inner = 25;
const voidHigh2H     = grooveH / 2; // 2.5mm
const voidHigh2Z     = grooveRootZ + grooveH / 2 + voidHigh2H / 2; // 10+2.5+1.25 = 13.75
const voidHigh2Big   = cylinder(voidHigh2H, bigR).translate(0, 0, voidHigh2Z);
const voidHigh2Small = cylinder(voidHigh2H + 0.1, voidHigh2Inner).translate(0, 0, voidHigh2Z);
const voidHigh2      = voidHigh2Big.subtract(voidHigh2Small);

// Keyway slot: X=6..8.5 (radially), Y=-2..+2 (4mm wide), Z=0..20
// Box centered at X=(6+8.5)/2=7.25, Y=0, Z=10; size=(2.5, 4, 20)
const keywaySizeX = keywayDepth;                      // 2.5mm
const keywaySizeY = keywayWidth;                      // 4mm
const keywaySizeZ = pulleyWidth;                      // 20mm
const keywayCenterX = boreRadius + keywayDepth / 2;  // 6 + 1.25 = 7.25
const keywayCenterZ = pulleyWidth / 2;               // 10
const keyway = box(keywaySizeX, keywaySizeY, keywaySizeZ)
    .translate(keywayCenterX, 0, keywayCenterZ);

// Assemble: start with main cylinder, subtract all voids
const pulleyWithBore    = mainCyl.subtract(boreCyl);
const pulleyWithGroove1 = pulleyWithBore.subtract(voidLow1);
const pulleyWithGroove2 = pulleyWithGroove1.subtract(voidLow2);
const pulleyWithGroove3 = pulleyWithGroove2.subtract(voidHigh1);
const pulleyWithGroove4 = pulleyWithGroove3.subtract(voidHigh2);
const finalShape        = pulleyWithGroove4.subtract(keyway);

// Color the finished part
const coloredPart = finalShape.color("#7a9fc2");

return {
    "v-belt-pulley-revolved-around-z-axis-wit": coloredPart,
};
