/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A shoulder screw standing upright along Z, centered at the origin in XY, consisting of a threaded section, a smooth shoulder section, and a cylindrical head.
 * Workflow ID : eval-T2_016-ede755
 * Trace ID    : 44bef7b1-11a7-48d9-86c8-58ae4d351fc9
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
 *   BBox IoU       : ≥ 0.95
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://eval-T2_016-ede755/step/T2_016_outer0_attempt0.step
 *   STL    : artifact://eval-T2_016-ede755/stl/T2_016_outer0_attempt0.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Align all cylinders co-axially along the Z-axis. Base should be at Z=0, with the threaded section spanning Z=0 to Z=10, the shoulder section from Z=10 to Z=30, and the head section from Z=30 to Z=35. Centered at X=0, Y=0.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Shoulder Screw standing upright along Z, centered at the origin in XY.
 * Designed with parametric dimensions for the thread, shoulder, and head.
 */

// Define parameters for the threaded section
const thread_len = Param.number("Thread Length", 10, { min: 1, max: 100, unit: "mm" });
const thread_dia = Param.number("Thread Diameter", 6, { min: 1, max: 50, unit: "mm" });

// Define parameters for the shoulder section
const shoulder_len = Param.number("Shoulder Length", 20, { min: 1, max: 100, unit: "mm" });
const shoulder_dia = Param.number("Shoulder Diameter", 10, { min: 1, max: 100, unit: "mm" });

// Define parameters for the head section
const head_len = Param.number("Head Length", 5, { min: 1, max: 50, unit: "mm" });
const head_dia = Param.number("Head Diameter", 14, { min: 1, max: 100, unit: "mm" });

// Calculate radii
const thread_rad = thread_dia / 2;
const shoulder_rad = shoulder_dia / 2;
const head_rad = head_dia / 2;

// Create the bottom threaded section (from Z = 0 to Z = thread_len)
const threadSection = cylinder(thread_len, thread_rad).color("#94a3b8");

// Create the middle shoulder section (from Z = thread_len to Z = thread_len + shoulder_len)
const shoulderSection = cylinder(shoulder_len, shoulder_rad)
  .translate(0, 0, thread_len)
  .color("#cbd5e1");

// Create the top head section (from Z = thread_len + shoulder_len to total height)
const headSection = cylinder(head_len, head_rad)
  .translate(0, 0, thread_len + shoulder_len)
  .color("#64748b");

// Union the sections together to form a single solid
const shoulderScrew = threadSection.union(shoulderSection).union(headSection);

// Return the final shape map as required by the ForgeCAD API
return {
  "a-shoulder-screw-standing-upright-along-": shoulderScrew,
};
