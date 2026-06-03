import cadquery as cq
import math

# ── Parameters ──────────────────────────────────────────────────────────────
hub_radius        = 7.0
hub_length        = 55.0

bore_radius       = 3.0

keyway_width      = 3.0        # Y extent  (−1.5 to +1.5)
keyway_x_inner    = 3.0        # starts at bore radius
keyway_x_outer    = 5.0        # ends 2 mm deeper
keyway_height     = hub_length

# Gear 1
g1_tip_r  = 27.0
g1_root_r = 22.0
g1_teeth  = 24
g1_z0     = 2.0
g1_z1     = 10.0

# Gear 2
g2_tip_r  = 21.0
g2_root_r = 17.0
g2_teeth  = 18
g2_z0     = 18.0
g2_z1     = 26.0

# Gear 3
g3_tip_r  = 15.0
g3_root_r = 12.0
g3_teeth  = 12
g3_z0     = 34.0
g3_z1     = 42.0


# ── Helper: build a star-polygon gear disk ───────────────────────────────────
def gear_disk(tip_r, root_r, n_teeth, face_width, z_start):
    """
    Creates a gear disk whose tooth profile is a 2*N-vertex star polygon,
    alternating between tip_r and root_r, extruded to face_width.
    The disk is positioned so its bottom sits at z_start.
    """
    pts = []
    total_pts = 2 * n_teeth
    for i in range(total_pts):
        angle = 2.0 * math.pi * i / total_pts  # evenly spaced
        r = tip_r if (i % 2 == 0) else root_r
        pts.append((r * math.cos(angle), r * math.sin(angle)))
    # Close the polygon
    pts.append(pts[0])

    disk = (
        cq.Workplane("XY")
        .workplane(offset=z_start)
        .polyline(pts)
        .close()
        .extrude(face_width)
    )
    return disk


# ── Build the hub cylinder (Z = 0 … 55) ────────────────────────────────────
hub = (
    cq.Workplane("XY")
    .workplane(offset=0)
    .circle(hub_radius)
    .extrude(hub_length)
)

# ── Build gear disks ─────────────────────────────────────────────────────────
gear1 = gear_disk(g1_tip_r, g1_root_r, g1_teeth, g1_z1 - g1_z0, g1_z0)
gear2 = gear_disk(g2_tip_r, g2_root_r, g2_teeth, g2_z1 - g2_z0, g2_z0)
gear3 = gear_disk(g3_tip_r, g3_root_r, g3_teeth, g3_z1 - g3_z0, g3_z0)

# ── Union hub + all gears ────────────────────────────────────────────────────
assembly = hub.union(gear1).union(gear2).union(gear3)

# ── Subtract central bore (radius = 3 mm, full length) ──────────────────────
bore_cyl = (
    cq.Workplane("XY")
    .workplane(offset=0)
    .circle(bore_radius)
    .extrude(hub_length)
)
assembly = assembly.cut(bore_cyl)

# ── Subtract keyway slot ─────────────────────────────────────────────────────
# Box: x from keyway_x_inner(3) to keyway_x_outer(5),
#      y from -1.5 to +1.5,
#      z from 0 to 55
keyway_box = (
    cq.Workplane("XY")
    .workplane(offset=0)
    .box(
        keyway_x_outer - keyway_x_inner,   # length in X = 2 mm
        keyway_width,                       # width  in Y = 3 mm
        keyway_height,                      # height in Z = 55 mm
        centered=(True, True, False),       # center on X,Y; sit on workplane in Z
    )
    # Shift the box so it spans x = 3…5  (centre at x=4)
    .translate((keyway_x_inner + (keyway_x_outer - keyway_x_inner) / 2.0, 0, 0))
)

assembly = assembly.cut(keyway_box)

# ── Final result ─────────────────────────────────────────────────────────────
result = assembly