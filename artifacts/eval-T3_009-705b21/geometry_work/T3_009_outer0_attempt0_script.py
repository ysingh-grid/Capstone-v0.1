import cadquery as cq
import math

# ─── Parameters ───────────────────────────────────────────────────────────────
hub_diameter   = 16.0
hub_length     = 40.0
hub_z_start    = 0.0
hub_z_end      = 40.0

bore_diameter  = 8.0

# Large gear
lg_tip_r       = 27.0
lg_root_r      = 22.0
lg_teeth       = 24
lg_z_start     = 3.0
lg_z_end       = 13.0
lg_face_width  = lg_z_end - lg_z_start   # 10 mm

# Small gear
sg_tip_r       = 16.0
sg_root_r      = 13.0
sg_teeth       = 14
sg_z_start     = 20.0
sg_z_end       = 30.0
sg_face_width  = sg_z_end - sg_z_start   # 10 mm


# ─── Helper: build a 2-D star-polygon wire (gear cross-section) ───────────────
def gear_profile_pts(n_teeth, tip_r, root_r, flank_steps=3):
    """
    Return a list of (x, y) points describing a spur-gear star polygon.
    Each tooth has: root_flank_up → tip arc → root_flank_down
    We use a few intermediate angular points per flank for a smoother look.
    """
    pts = []
    tooth_angle = 2.0 * math.pi / n_teeth          # full pitch in radians
    half_tooth  = tooth_angle / 2.0
    # tip spans ±tip_half_ang around tooth centre, root spans the rest
    # simple equal split: tip occupies half the pitch, root the other half
    tip_half_ang  = tooth_angle * 0.25             # 1/4 of pitch on each side
    root_half_ang = tooth_angle * 0.25

    for i in range(n_teeth):
        centre_ang = i * tooth_angle               # angle to tooth tip centre

        # -- leading root point
        ang_root_lead = centre_ang - half_tooth
        pts.append((root_r * math.cos(ang_root_lead),
                    root_r * math.sin(ang_root_lead)))

        # -- flank: root → tip (interpolate in angle and radius)
        flank_start_ang = ang_root_lead
        flank_end_ang   = centre_ang - tip_half_ang
        for s in range(1, flank_steps + 1):
            t   = s / (flank_steps + 1)
            ang = flank_start_ang + t * (flank_end_ang - flank_start_ang)
            r   = root_r + t * (tip_r - root_r)
            pts.append((r * math.cos(ang), r * math.sin(ang)))

        # -- tip arc (leading edge)
        pts.append((tip_r * math.cos(centre_ang - tip_half_ang),
                    tip_r * math.sin(centre_ang - tip_half_ang)))

        # -- tip top centre
        pts.append((tip_r * math.cos(centre_ang),
                    tip_r * math.sin(centre_ang)))

        # -- tip arc (trailing edge)
        pts.append((tip_r * math.cos(centre_ang + tip_half_ang),
                    tip_r * math.sin(centre_ang + tip_half_ang)))

        # -- flank: tip → root
        flank_start_ang2 = centre_ang + tip_half_ang
        flank_end_ang2   = centre_ang + half_tooth
        for s in range(1, flank_steps + 1):
            t   = s / (flank_steps + 1)
            ang = flank_start_ang2 + t * (flank_end_ang2 - flank_start_ang2)
            r   = tip_r - t * (tip_r - root_r)
            pts.append((r * math.cos(ang), r * math.sin(ang)))

    return pts


# ─── Build the hub ─────────────────────────────────────────────────────────────
# Hub centred at XY origin, Z from 0 to 40
hub = (
    cq.Workplane("XY")
    .circle(hub_diameter / 2.0)
    .extrude(hub_length)
    .translate((0, 0, hub_z_start))
)


# ─── Build the large gear ──────────────────────────────────────────────────────
lg_pts = gear_profile_pts(lg_teeth, lg_tip_r, lg_root_r, flank_steps=3)

large_gear = (
    cq.Workplane("XY")
    .sketch()
    .polygon(lg_pts)
    .finalize()
    .extrude(lg_face_width)
    .translate((0, 0, lg_z_start))
)


# ─── Build the small gear ──────────────────────────────────────────────────────
sg_pts = gear_profile_pts(sg_teeth, sg_tip_r, sg_root_r, flank_steps=3)

small_gear = (
    cq.Workplane("XY")
    .sketch()
    .polygon(sg_pts)
    .finalize()
    .extrude(sg_face_width)
    .translate((0, 0, sg_z_start))
)


# ─── Union hub + gears ─────────────────────────────────────────────────────────
compound = hub.union(large_gear).union(small_gear)


# ─── Subtract the bore ────────────────────────────────────────────────────────
# Bore runs full hub length; make it slightly longer to ensure clean cuts
bore_extra = 2.0
bore = (
    cq.Workplane("XY")
    .circle(bore_diameter / 2.0)
    .extrude(hub_length + bore_extra * 2)
    .translate((0, 0, hub_z_start - bore_extra))
)

result = compound.cut(bore)