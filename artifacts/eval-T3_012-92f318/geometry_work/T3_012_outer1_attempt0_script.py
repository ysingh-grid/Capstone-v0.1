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
central_bore_diameter = central_bore_radius * 2

mounting_hole_diameter = 6.0
mounting_hole_offset_x = 22.0
mounting_hole_offset_y = 22.0

# === Build Base Plate ===
# Square plate centered at XY origin, Z from 0 to 5
base_plate = (
    cq.Workplane("XY")
    .box(base_plate_x, base_plate_y, base_plate_z, centered=(True, True, False))
)

# === Build Lower Post ===
# Cylinder radius=10, from Z=5 to Z=18
lower_post = (
    cq.Workplane("XY")
    .workplane(offset=lower_post_z_bottom)
    .cylinder(lower_post_height, lower_post_radius, centered=(True, True, False))
)

# === Build Retaining Shoulder ===
# Cylinder radius=7, from Z=18 to Z=40
retaining_shoulder = (
    cq.Workplane("XY")
    .workplane(offset=retaining_shoulder_z_bottom)
    .cylinder(retaining_shoulder_height, retaining_shoulder_radius, centered=(True, True, False))
)

# === Build Spur Gear ===
# Star-polygon tooth profile: 32 vertices alternating between tip_radius and root_radius
# at angular steps of 360/32 = 11.25 degrees
num_vertices = gear_num_teeth * 2  # 32 vertices
angle_step = 2 * math.pi / num_vertices

gear_pts = []
for i in range(num_vertices):
    angle = i * angle_step
    # Even indices -> tip radius (tooth tip), odd indices -> root radius (tooth valley)
    r = gear_tip_radius if (i % 2 == 0) else gear_root_radius
    x = r * math.cos(angle)
    y = r * math.sin(angle)
    gear_pts.append((x, y))

# Close the polygon by repeating first point
gear_pts.append(gear_pts[0])

# Build gear as extruded 2D polygon profile (NO bore cut - let central bore handle it)
gear_solid = (
    cq.Workplane("XY")
    .workplane(offset=gear_z_bottom)
    .polyline(gear_pts)
    .close()
    .extrude(gear_face_width)
)

# === Union All Solid Components ===
assembly = base_plate.union(lower_post).union(retaining_shoulder).union(gear_solid)

# === Subtract Central Bore (8mm diameter, through entire assembly Z=0 to Z=40) ===
# Use a cylinder taller than the assembly to ensure full cut
central_bore_cyl = (
    cq.Workplane("XY")
    .workplane(offset=-1.0)
    .cylinder(42.0, central_bore_radius, centered=(True, True, False))
)
assembly = assembly.cut(central_bore_cyl)

# === Subtract Four Mounting Holes through Base Plate ===
# Holes at (±22, ±22), diameter 6mm, through base plate Z=0 to Z=5
mounting_positions = [
    (mounting_hole_offset_x,  mounting_hole_offset_y),
    (-mounting_hole_offset_x,  mounting_hole_offset_y),
    (mounting_hole_offset_x, -mounting_hole_offset_y),
    (-mounting_hole_offset_x, -mounting_hole_offset_y),
]

mounting_hole_cyl_height = base_plate_z + 2.0  # slightly taller than plate to ensure clean cut

for (mx, my) in mounting_positions:
    hole_cyl = (
        cq.Workplane("XY")
        .workplane(offset=-1.0)
        .center(mx, my)
        .cylinder(mounting_hole_cyl_height + 2.0, mounting_hole_diameter / 2.0, centered=(True, True, False))
    )
    assembly = assembly.cut(hole_cyl)

# === Final Result ===
result = assembly