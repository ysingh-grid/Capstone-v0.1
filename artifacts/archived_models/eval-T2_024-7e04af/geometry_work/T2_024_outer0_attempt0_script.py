import cadquery as cq
import math

# ================== PARAMETERS ==================
num_teeth = 16
tip_diameter = 45.0
root_diameter = 33.75
gear_face_width = 8.0
hub_diameter = 16.0
hub_height = 20.0
bore_diameter = 8.0

# Calculated radii
r_tip = tip_diameter / 2.0
r_root = root_diameter / 2.0

# ================== GEOMETRY GENERATION ==================

# 1. Generate star-polygon vertices for the gear profile
pts = []
num_points = num_teeth * 2
for i in range(num_points):
    angle = i * (2 * math.pi / num_points)
    r = r_tip if i % 2 == 0 else r_root
    pts.append((r * math.cos(angle), r * math.sin(angle)))

# 2. Extrude the gear disc from Z=0 to Z=8
gear_disc = (
    cq.Workplane("XY")
    .polyline(pts)
    .close()
    .extrude(gear_face_width)
)

# 3. Create the protruding cylindrical hub from Z=0 to Z=20
hub = (
    cq.Workplane("XY")
    .cylinder(
        height=hub_height, 
        radius=hub_diameter / 2.0, 
        centered=(True, True, False)
    )
)

# 4. Combine the gear disc and the hub
combined = gear_disc.union(hub)

# 5. Cut the central bore through the entire height
result = combined.faces(">Z").workplane().hole(bore_diameter)