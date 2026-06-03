import math
import cadquery as cq

# --- PARAMETERS ---
# Base Plate
base_width = 60.0
base_thickness = 5.0

# Central Post
post_lower_dia = 20.0
post_lower_z_start = 5.0
post_lower_z_end = 18.0
post_lower_height = post_lower_z_end - post_lower_z_start  # 13.0

post_upper_dia = 14.0
post_upper_z_start = 18.0
post_upper_z_end = 40.0
post_upper_height = post_upper_z_end - post_upper_z_start  # 22.0

# Spur Gear
gear_teeth = 16
gear_tip_radius = 20.0   # Tip diameter 40mm
gear_root_radius = 16.0  # Root diameter 32mm
gear_z_start = 10.0
gear_z_end = 18.0
gear_height = gear_z_end - gear_z_start  # 8.0

# Holes
bore_diameter = 8.0
mounting_hole_dia = 6.0
mounting_hole_offset = 22.0

# --- GEOMETRY GENERATION ---

# 1. Base Plate (Z: 0 to 5)
# Created flat on the XY plane, extending upwards in Z
base = cq.Workplane("XY").box(base_width, base_width, base_thickness, centered=(True, True, False))

# 2. Lower Post (Z: 5 to 18)
# Extrude 20mm diameter cylinder from the top face of the base plate
post_lower = base.faces(">Z").workplane().circle(post_lower_dia / 2.0).extrude(post_lower_height)

# 3. Upper Shoulder (Z: 18 to 40)
# Extrude 14mm diameter cylinder from the top of the lower post
assembly_post = post_lower.faces(">Z").workplane().circle(post_upper_dia / 2.0).extrude(post_upper_height)

# 4. Spur Gear (Z: 10 to 18)
# Generate star-polygon vertices for the 16-tooth profile
num_points = gear_teeth * 2
gear_pts = []
for i in range(num_points):
    angle = i * (2.0 * math.pi / num_points)
    # Alternate between tip and root radius
    r = gear_tip_radius if (i % 2 == 0) else gear_root_radius
    x = r * math.cos(angle)
    y = r * math.sin(angle)
    gear_pts.append((x, y))

# Create the gear at Z=10 and extrude up by 8mm
gear = (
    cq.Workplane("XY")
    .workplane(offset=gear_z_start)
    .polyline(gear_pts)
    .close()
    .extrude(gear_height)
)

# Union the gear with the base and post assembly
assembly = assembly_post.union(gear)

# 5. Central Vertical Through-Bore (Z: 0 to 40)
# Create the 8mm central bore through the entire assembly
assembly_with_bore = assembly.faces(">Z").workplane().hole(bore_diameter)

# 6. Mounting Holes in Base Plate
# Define the positions for the 4 symmetrical holes on the base plate
hole_positions = [
    (mounting_hole_offset, mounting_hole_offset),
    (mounting_hole_offset, -mounting_hole_offset),
    (-mounting_hole_offset, mounting_hole_offset),
    (-mounting_hole_offset, -mounting_hole_offset)
]

# Drill the mounting holes from the bottom face (Z=0) through the base plate
result = (
    assembly_with_bore.faces("<Z")
    .workplane()
    .pushPoints(hole_positions)
    .hole(mounting_hole_dia, depth=base_thickness)
)