import math
import cadquery as cq

# Parametric Dimensions
base_w = 60.0
base_l = 60.0
base_h = 5.0

post_lower_dia = 20.0
post_lower_h = 13.0  # Z=5 to Z=18
post_upper_dia = 14.0
post_upper_h = 22.0  # Z=18 to Z=40

gear_z_start = 10.0
gear_h = 8.0         # Z=10 to Z=18
gear_teeth = 16
gear_tip_r = 20.0    # 40mm diameter
gear_root_r = 16.0   # 32mm diameter

bore_dia = 8.0
mount_hole_dia = 6.0
mount_hole_offset = 22.0  # Holes at (+-22, +-22)

# 1. Create the square base plate (Z = 0 to 5)
result = cq.Workplane("XY").box(base_w, base_l, base_h, centered=(True, True, False))

# 2. Create the lower part of the stepped post (Z = 5 to 18)
result = result.faces(">Z").workplane().circle(post_lower_dia / 2.0).extrude(post_lower_h)

# 3. Create the upper part of the stepped post (Z = 18 to 40)
result = result.faces(">Z").workplane().circle(post_upper_dia / 2.0).extrude(post_upper_h)

# 4. Create the star-polygon spur gear (Z = 10 to 18)
# Generate the star polygon points alternating between tip and root radii
gear_pts = []
num_points = 2 * gear_teeth
for i in range(num_points):
    angle = i * (2 * math.pi / num_points)
    r = gear_tip_r if i % 2 == 0 else gear_root_r
    gear_pts.append((r * math.cos(angle), r * math.sin(angle)))

# Sketch and extrude the gear on a workplane offset at Z=10
gear = (
    cq.Workplane("XY")
    .workplane(offset=gear_z_start)
    .moveTo(gear_pts[0][0], gear_pts[0][1])
    .polyline(gear_pts[1:])
    .close()
    .extrude(gear_h)
)

# Union the gear with the main assembly
result = result.union(gear)

# 5. Drill the central bore through the entire assembly (Z = 0 to 40)
result = result.faces(">Z").workplane().hole(bore_dia)

# 6. Drill the four mounting holes through the base plate (Z = 0 to 5)
# We select the bottom face (Z=0) to safely place the holes
result = (
    result.faces("<Z")
    .workplane()
    .pushPoints([
        (-mount_hole_offset, -mount_hole_offset),
        (-mount_hole_offset, mount_hole_offset),
        (mount_hole_offset, -mount_hole_offset),
        (mount_hole_offset, mount_hole_offset)
    ])
    .hole(mount_hole_dia, depth=base_h)
)