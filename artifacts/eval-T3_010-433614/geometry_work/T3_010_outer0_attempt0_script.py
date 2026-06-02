import cadquery as cq
import math

# ─────────────────────────────────────────────
# Parametric dimensions
# ─────────────────────────────────────────────
hub_dia      = 14.0
hub_len      = 55.0

bore_dia     = 6.0

kw_width     = 3.0   # Y width of keyway
kw_depth     = 2.0   # radial depth (from bore surface outward)
kw_r_inner   = bore_dia / 2          # 3 mm
kw_r_outer   = kw_r_inner + kw_depth  # 5 mm

# Gear specs: (num_teeth, tip_radius, root_radius, z_start, z_end)
gears = [
    (24, 27.0, 22.0, 2.0,  10.0),
    (18, 21.0, 17.0, 18.0, 26.0),
    (12, 15.0, 12.0, 34.0, 42.0),
]

# ─────────────────────────────────────────────
# Helper: build a star-polygon gear profile
# Returns a list of (x, y) 2-D vertices alternating
# between tip and root radii for N teeth (2N points total).
# ─────────────────────────────────────────────
def star_polygon_pts(n_teeth, tip_r, root_r):
    pts = []
    n_pts = 2 * n_teeth          # 2N points alternate tip / root
    for i in range(n_pts):
        angle_deg = 360.0 * i / n_pts
        angle_rad = math.radians(angle_deg)
        r = tip_r if (i % 2 == 0) else root_r
        pts.append((r * math.cos(angle_rad), r * math.sin(angle_rad)))
    return pts

# ─────────────────────────────────────────────
# 1. Build the hub cylinder (Z = 0 → 55)
#    centered in XY, starting at Z=0
# ─────────────────────────────────────────────
hub = (
    cq.Workplane("XY")
    .workplane(offset=0)
    .circle(hub_dia / 2)
    .extrude(hub_len)
)

# ─────────────────────────────────────────────
# 2. Build and union each gear onto the hub
# ─────────────────────────────────────────────
for (n_teeth, tip_r, root_r, z_start, z_end) in gears:
    face_w = z_end - z_start
    pts = star_polygon_pts(n_teeth, tip_r, root_r)

    # Build star-polygon profile on XY, then extrude upward
    # We extrude from z_start, so offset the workplane
    gear_solid = (
        cq.Workplane("XY")
        .workplane(offset=z_start)
        .polyline(pts)
        .close()
        .extrude(face_w)
    )

    hub = hub.union(gear_solid)

# ─────────────────────────────────────────────
# 3. Subtract the central bore (6 mm dia, full length)
# ─────────────────────────────────────────────
bore = (
    cq.Workplane("XY")
    .circle(bore_dia / 2)
    .extrude(hub_len)
)

hub = hub.cut(bore)

# ─────────────────────────────────────────────
# 4. Subtract the keyway slot
#    3 mm wide in Y (centered on XZ plane: Y = -1.5 to +1.5)
#    radially from r=3 mm to r=5 mm on the +X side
#    → a rectangular block: X from kw_r_inner to kw_r_outer,
#      Y from -kw_width/2 to +kw_width/2,
#      Z from 0 to hub_len
# ─────────────────────────────────────────────
kw_x_len = kw_r_outer - kw_r_inner   # 2 mm
kw_cx    = kw_r_inner + kw_x_len / 2  # centre X = 4 mm

keyway = (
    cq.Workplane("XY")
    .center(kw_cx, 0)
    .box(kw_x_len, kw_width, hub_len, centered=(True, True, False))
)

hub = hub.cut(keyway)

# ─────────────────────────────────────────────
# Final result
# ─────────────────────────────────────────────
result = hub