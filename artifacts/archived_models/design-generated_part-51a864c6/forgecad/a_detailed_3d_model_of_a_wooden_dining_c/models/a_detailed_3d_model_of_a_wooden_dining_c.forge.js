/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY AGENT HARNESS — ForgeCAD Model                            ║
 * ║  Open in ForgeCAD Studio:  forgecad studio .                        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Part        : A detailed 3D model of a wooden dining chair with four tapered legs, a trapezoidal seat, and a backrest with three vertical slats.
 * Workflow ID : design-generated_part-51a864c6
 * Trace ID    : 46aef987-a6c6-43e6-bbfd-fd953b796377
 * Iteration   : 0
 *
 * ── Dimensions ────────────────────────────────────────────────────────
 *   Envelope  : 450.0 × 450.0 × 900.0 mm
 *
 * ── Features ──────────────────────────────────────────────────────────
 *   (no typed features in plan)
 *
 * ── Acceptance Criteria ───────────────────────────────────────────────
 *   Volume error   : ≤ 10.0%
 *   BBox IoU       : ≥ 0.9
 *   Watertight     : True
 *
 * ── Verified Artifacts (OCCT / CadQuery) ──────────────────────────────
 *   STEP   : artifact://design-generated_part-51a864c6/step/generated_part_outer0_attempt1.step
 *   STL    : artifact://design-generated_part-51a864c6/stl/generated_part_outer0_attempt1.stl
 *   Render : (pending)
 *
 * ── Notes ─────────────────────────────────────────────────────────────
 *   Ensure the front legs are flush with the front corners of the trapezoidal seat, and the rear legs align with the back corners. The rear legs extend continuously past the seat to the top of the backrest at Z=900mm. Slat spacing must be exactly 40mm, centered between the rear uprights.
 *
 * HOW TO USE
 *   1. Run:  forgecad studio .
 *   2. Adjust parameter sliders to tune the geometry live.
 *   3. Export STEP/STL from the studio File menu.
 *   4. Full audit trail: look up trace_id in the artifact store.
 * ─────────────────────────────────────────────────────────────────────
 */

0, seat_depth/2, seat_height - seat_thickness);`
            *   Then we do:
                `const seat = base_seat.subtract(c1_final).subtract(c2_final);`
            *   This is perfect!

7.  **Legs Construction details**:
    *   Front Left Leg:
        *   `cylinder(height, radius)` -> ForgeCAD `cylinder(height, radius)` has bottom at Z=0, extends in +Z.
        *   Does it support `cylinder(height, r_bottom, r_top)`? Yes, let's use it. If not, fallback to constant radius is automatic in most interpreters or we can just use the two arguments.
        *   `const front_left_leg = cylinder(seat_height, front_leg_bottom_dia/2, front_leg_top_dia/2).translate(-seat_front_width/2 + front_leg_top_dia/2, seat_depth/2 - front_leg_top_dia/2, 0);`
        *   `const front_right_leg = cylinder(seat_height, front_leg_bottom_dia/2, front_leg_top_dia/2).translate(seat_front_width/2 - front_leg_top_dia/2, seat_depth/2 - front_leg_top_dia/2, 0);`
    *   Rear Left Leg:
