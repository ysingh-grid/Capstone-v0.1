/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : Shoulder screw standing upright along the Z-axis, centered at XY origin, with three coaxial cylindrical sections stacked vertically: threaded section at bottom, smooth shoulder in middle, and cylindrical head at top.
 * Workflow ID : design-generated_part-07c0a293
 * Trace ID    : ac2d6fde-734d-4d80-8bd7-336655635c78
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 14.0 × 14.0 × 35.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://design-generated_part-07c0a293/step/generated_part_outer0_attempt0.step
 *   STL    : artifact://design-generated_part-07c0a293/stl/generated_part_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   All three cylinders share the same central axis (X=0, Y=0) and are coaxial. Each cylinder should be constructed with its base at the respective Z_start and its top at Z_end: (1) threaded section: radius=3mm, base at Z=0, height=10mm; (2) shoulder section: radius=5mm, base at Z=10, height=20mm; (3) head: radius=7mm, base at Z=30, height=5mm. No boolean subtractions are needed. Threads are modeled as a plain cylinder (no helical thread geometry). Final shape is a union of these three cylinders. Volume estimate: pi*(3^2)*10 + pi*(5^2)*20 + pi*(7^2)*5 = 282.7 + 1570.8 + 769.7 ≈ 2623 mm^3. Use CadQuery or similar; place each cylinder with its bottom face at the correct Z height and center at origin.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Shoulder Screw - three coaxial cylindrical sections stacked along Z-axis
 * Threaded section (bottom) + Smooth shoulder (middle) + Head (top)
 */

// Parameters for each section
const threadDiameter = Param.number("Thread Diameter", 6, { min: 2, max: 20, unit: "mm" });
const threadHeight   = Param.number("Thread Height",   10, { min: 2, max: 50, unit: "mm" });
const shoulderDiameter = Param.number("Shoulder Diameter", 10, { min: 4, max: 30, unit: "mm" });
const shoulderHeight   = Param.number("Shoulder Height",   20, { min: 2, max: 100, unit: "mm" });
const headDiameter = Param.number("Head Diameter", 14, { min: 6, max: 40, unit: "mm" });
const headHeight   = Param.number("Head Height",    5, { min: 1, max: 30, unit: "mm" });

// Derived radii
const threadRadius   = threadDiameter   / 2;
const shoulderRadius = shoulderDiameter / 2;
const headRadius     = headDiameter     / 2;

// (1) Threaded section: base at Z=0, top at Z=threadHeight
// cylinder() is centered at origin with axis along Z, so translate up by half its height
const threadedSection = cylinder(threadHeight, threadRadius)
    .translate(0, 0, threadHeight / 2);

// (2) Shoulder section: base at Z=threadHeight, top at Z=threadHeight+shoulderHeight
const shoulderSection = cylinder(shoulderHeight, shoulderRadius)
    .translate(0, 0, threadHeight + shoulderHeight / 2);

// (3) Head cylinder: base at Z=threadHeight+shoulderHeight, top at Z=total height
const headSection = cylinder(headHeight, headRadius)
    .translate(0, 0, threadHeight + shoulderHeight + headHeight / 2);

// Union all three sections into the final screw body
const screwBody = threadedSection.union(shoulderSection).union(headSection);

// Apply a metallic steel color
const finalShape = screwBody.color("#8a9bb0");

return {
    "shoulder-screw-standing-upright-along-th": finalShape,
};
