/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A 16-tooth spur gear with a star-polygon profile, a protruding central hub, and a central through-bore, aligned along the Z-axis.
 * Workflow ID : eval-T2_024-7e04af
 * Trace ID    : bf7d6492-d0cc-428b-b6de-386f81a63ec7
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 45.0 × 45.0 × 20.0 mm
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
 *   STEP   : artifact://eval-T2_024-7e04af/step/T2_024_outer0_attempt0.step
 *   STL    : artifact://eval-T2_024-7e04af/stl/T2_024_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   To model the star-polygon gear profile: generate 32 vertices alternating between outer radius 22.5mm and inner radius 16.875mm, form a polygon, and extrude from Z=0 to Z=8. Create the hub as a cylinder of diameter 16mm from Z=0 to Z=20, union it with the gear, and then subtract a cylinder of diameter 8mm spanning the entire height (e.g., Z=-1 to Z=21 for a clean cut) to create the bore.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 16-Tooth Spur Gear with Protruding Hub
 * High-performance parametric model optimized for ForgeCAD
 */

// Define parameters for the gear dimensions
const tipDia = Param.number("Tip Diameter", 45, { min: 10, max: 100, unit: "mm" });
const rootDia = Param.number("Root Diameter", 33.75, { min: 5, max: 90, unit: "mm" });
const faceWidth = Param.number("Face Width", 8, { min: 1, max: 50, unit: "mm" });
const hubDia = Param.number("Hub Diameter", 16, { min: 5, max: 50, unit: "mm" });
const hubHeight = Param.number("Hub Height", 20, { min: 5, max: 100, unit: "mm" });
const boreDia = Param.number("Bore Diameter", 8, { min: 2, max: 30, unit: "mm" });
const toothWidth = Param.number("Tooth Width", 3.5, { min: 1, max: 10, unit: "mm" });

// Create the base root cylinder of the gear
const rootCylinder = cylinder(faceWidth, rootDia / 2);

// Create the primary tooth box aligned with the X axis (represents 2 opposite teeth)
const b0 = box(tipDia, toothWidth, faceWidth);

// Rotate to create the remaining teeth pairs
const b1 = b0.rotate([0, 0, 1], 22.5);
const b2 = b0.rotate([0, 0, 1], 45.0);
const b3 = b0.rotate([0, 0, 1], 67.5);

// Union the teeth pairwise to minimize boolean operation depth
const u01 = b0.union(b1);
const u23 = b2.union(b3);
const teeth1 = u01.union(u23);
const teeth2 = teeth1.rotate([0, 0, 1], 90.0);
const allTeeth = teeth1.union(teeth2);

// Combine the root cylinder with all 16 teeth
const gearDisc = rootCylinder.union(allTeeth);

// Create the central protruding hub cylinder
const hub = cylinder(hubHeight, hubDia / 2);

// Union the hub with the gear disc
const gearWithHub = gearDisc.union(hub);

// Create the through-bore cylinder, slightly taller for a clean cut
const bore = cylinder(hubHeight + 2, boreDia / 2).translate(0, 0, -1);

// Subtract the bore from the gear assembly and apply professional coloring
const finalShape = gearWithHub.subtract(bore).color("#5f87c6");

// Return the final model mapped to the requested part name
return {
  "a-16-tooth-spur-gear-with-a-star-polygon": finalShape
};
