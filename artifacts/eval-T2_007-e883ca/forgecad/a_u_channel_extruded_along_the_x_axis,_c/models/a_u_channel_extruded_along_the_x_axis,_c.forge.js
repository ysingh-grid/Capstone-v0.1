/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A U-channel extruded along the X-axis, centered at the origin, with defined wall and base thicknesses.
 * Workflow ID : eval-T2_007-e883ca
 * Trace ID    : 39f71524-914f-472f-9ab2-6b1865b86786
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 80.0 × 40.0 × 30.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 5.0%
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T2_007-e883ca/step/T2_007_outer0_attempt0.step
 *   STL    : artifact://eval-T2_007-e883ca/stl/T2_007_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   The U-channel should be modeled with the cross-section in the YZ plane and extruded along the X-axis. Centering at the origin means the X-bounds are [-40, 40], Y-bounds are [-20, 20], and Z-bounds are [-15, 15]. The base is at Z=-15 to Z=-12, and the walls extend up to Z=15 on the sides Y=[-20, -17] and Y=[17, 20].
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ForgeCAD Model: U-Channel
 * Extruded along the X-axis, centered at the origin.
 */

// Define parameters for the U-channel dimensions
const length = Param.number("Length", 80, { min: 10, max: 500, unit: "mm" });
const width = Param.number("Width", 40, { min: 10, max: 500, unit: "mm" });
const height = Param.number("Height", 30, { min: 10, max: 500, unit: "mm" });
const wallThickness = Param.number("Wall Thickness", 3, { min: 1, max: 20, unit: "mm" });
const baseThickness = Param.number("Base Thickness", 3, { min: 1, max: 20, unit: "mm" });

// Create the outer solid block, centered on X and Y, and shift Z to center at origin
const outer = box(length, width, height).translate(0, 0, -height / 2);

// Create the cutting block, extended in length and height for clean boolean subtraction
const cutLength = length + 10;
const cutWidth = width - 2 * wallThickness;
const cutHeight = height;
const cutZStart = -height / 2 + baseThickness;

const cut = box(cutLength, cutWidth, cutHeight).translate(0, 0, cutZStart);

// Perform subtraction to create the U-channel shape
const uChannel = outer.subtract(cut).color("#5f87c6");

// Return the final model named exactly as specified
return {
  "a-u-channel-extruded-along-the-x-axis,-c": uChannel
};
