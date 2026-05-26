import math
import cadquery as cq

# Parametric dimensions for the central hub
hub_dia = 14.0
hub_radius = hub_dia / 2.0
hub_len = 55.0

# Parametric dimensions for Gear 1 (bottom, 24 teeth)
g1_teeth = 24
g1_r_root = 22.0
g1_r_tip = 27.0
g1_z_start = 2.0
g1_width = 8.0

# Parametric dimensions for Gear 2 (middle, 18 teeth)
g2_teeth = 18
g2_r_root = 17.0
g2_r_tip = 21.0
g2_z_start = 18.0
g2_width = 8.0

# Parametric dimensions for Gear 3 (top, 12 teeth)
g3_teeth = 12
g3_r_root = 12.0
g3_r_tip = 15.0
g3_z_start = 34.0
g3_width = 8.0

# Parametric dimensions for the central bore and keyway slot
bore_dia = 6.0
bore_radius = bore_dia / 2.0
keyway_w = 3.0
keyway_d = 2.0


def make_star_gear_points(num_teeth, r_root, r_tip):
    """Generates 2D points for a star-polygon gear profile centered at origin."""
    pts = []
    n_points = 2 * num_teeth
    for i in range(n_points):
        angle = i * (2 * math.pi / n_points)
        r = r_root if (i % 2 == 0) else r_tip
        pts.append((r * math.cos(angle), r * math.sin(angle)))
    return pts


# 1. Create the central cylindrical hub standing upright on XY
hub = cq.Workplane("XY").cylinder(hub_len, hub_radius, centered=(True, True, False))

# 2. Create the first gear (bottom, 24 teeth)
pts1 = make_star_gear_points(g1_teeth, g1_r_root, g1_r_tip)
gear1 = (
    cq.Workplane("XY")
    .workplane(offset=g1_z_start)
    .polyline(pts1)
    .close()
    .extrude(g1_width)
)

# 3. Create the second gear (middle, 18 teeth)
pts2 = make_star_gear_points(g2_teeth, g2_r_root, g2_r_tip)
gear2 = (
    cq.Workplane("XY")
    .workplane(offset=g2_z_start)
    .polyline(pts2)
    .close()
    .extrude(g2_width)
)

# 4. Create the third gear (top, 12 teeth)
pts3 = make_star_gear_points(g3_teeth, g3_r_root, g3_r_tip)
gear3 = (
    cq.Workplane("XY")
    .workplane(offset=g3_z_start)
    .polyline(pts3)
    .close()
    .extrude(g3_width)
)

# 5. Combine the hub and all three gears into one solid shape
result = hub.union(gear1).union(gear2).union(gear3)

# 6. Create the central bore cylinder
bore = cq.Workplane("XY").cylinder(hub_len, bore_radius, centered=(True, True, False))

# 7. Create the keyway slot on the +X side
# Centered at X = bore_radius + keyway_d/2, Y = 0, extending along full hub length
keyway_center_x = bore_radius + (keyway_d / 2.0)
keyway = (
    cq.Workplane("XY")
    .center(keyway_center_x, 0.0)
    .box(keyway_d, keyway_w, hub_len, centered=(True, True, False))
)

# 8. Subtract the central bore and the keyway slot to complete the part
result = result.cut(bore).cut(keyway)