import cadquery as cq
import math

# === Parametric Dimensions ===
base_plate_x = 60.0
base_plate_y = 60.0
base_plate_z = 5.0

lower_post_radius = 10.0
lower_post_z_bottom = 5.0
lower_post_z_top = 18.0
lower_post_height = lower_post_z_top - lower_post_z_bottom  # 13mm

retaining_shoulder_radius = 7.0
retaining_shoulder_z_bottom = 18.0
retaining_shoulder_z_top = 40.0
retaining_shoulder_height = retaining_shoulder_z_top - retaining_shoulder_z_bottom  # 22mm

gear_tip_radius = 20.0
gear_root_radius = 16.0
gear_num_teeth = 16
gear_z_bottom = 10.0
gear_z_top = 18.0
gear_face_width = gear_z_top - gear_z_bottom  # 8mm

central_bore_radius = 4.0

mounting_hole_diameter = 6.0
mounting_hole_radius = mounting_hole_diameter / 2.0
mounting_hole_offset_x = 22.0
mounting_hole_offset_y = 22.0

# === Build Base Plate ===
base_plate = (
    cq.Workplane("XY")
    .box(base_plate_x, base_plate_y, base_plate_z, centered=(True, True, False))
)

# === Build Lower Post ===
lower_post = (
    cq.Workplane("XY")
    .workplane(offset=lower_post_z_bottom)
    .cylinder(lower_post_height, lower_post_radius, centered=(True, True, False))
)

# === Build Retaining Shoulder ===
retaining_shoulder = (
    cq.Workplane("XY")
    .workplane(offset=retaining_shoulder_z_bottom)
    .cylinder(retaining_shoulder_height, retaining_shoulder_radius, centered=(True, True, False))
)

# === Build Spur Gear using ADDITIVE star-polygon method ===
# 32 vertices alternating between tip_radius (tooth tip) and root_radius (tooth root)
# Each tooth occupies 2 vertices (one at tip, flanked by root vertices)
# Angular step = 360/32 = 11.25 degrees per vertex

num_vertices = gear_num_teeth * 2  # 32 vertices
angle_step = 2.0 * math.pi / num_vertices  # 11.25 degrees in radians

gear_profile_pts = []
for i in range(num_vertices):
    angle = i * angle_step
    # Even indices = tip radius (tooth tip), Odd indices = root radius (tooth valley)
    if i % 2 == 0:
        r = gear_tip_radius
    else:
        r = gear_root_radius
    x = r * math.cos(angle)
    y = r * math.sin(angle)
    gear_profile_pts.append((x, y))

# Build gear as extruded star-polygon profile
gear = (
    cq.Workplane("XY")
    .workplane(offset=gear_z_bottom)
    .polyline(gear_profile_pts)
    .close()
    .extrude(gear_face_width)
)

# Cut the inner bore through gear to fit over lower post (radius=10mm)
# This allows the gear to sit on the post; the 8mm bore goes through the post center
gear_bore = (
    cq.Workplane("XY")
    .workplane(offset=gear_z_bottom - 0.5)
    .cylinder(gear_face_width + 1.0, lower_post_radius, centered=(True, True, False))
)
gear = gear.cut(gear_bore)

# === Union All Solid Components ===
assembly = base_plate.union(lower_post).union(retaining_shoulder).union(gear)

# === Subtract Central Bore (8mm diameter, through entire assembly Z=0 to Z=40) ===
central_bore_cyl = (
    cq.Workplane("XY")
    .workplane(offset=-1.0)
    .cylinder(42.0, central_bore_radius, centered=(True, True, False))
)
assembly = assembly.cut(central_bore_cyl)

# === Subtract Four Mounting Holes through Base Plate ===
mounting_positions = [
    ( mounting_hole_offset_x,  mounting_hole_offset_y),
    (-mounting_hole_offset_x,  mounting_hole_offset_y),
    ( mounting_hole_offset_x, -mounting_hole_offset_y),
    (-mounting_hole_offset_x, -mounting_hole_offset_y),
]

for (mx, my) in mounting_positions:
    hole_cyl = (
        cq.Workplane("XY")
        .workplane(offset=-1.0)
        .center(mx, my)
        .cylinder(base_plate_z + 2.0, mounting_hole_radius, centered=(True, True, False))
    )
    assembly = assembly.cut(hole_cyl)

# === Final Result ===
result = assembly