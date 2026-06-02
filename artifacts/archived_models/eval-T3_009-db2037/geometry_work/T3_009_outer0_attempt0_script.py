import math
import cadquery as cq

# Parametric variables
hub_diameter = 16.0
hub_length = 40.0
bore_diameter = 8.0

large_gear_teeth = 24
large_gear_tip_diameter = 54.0
large_gear_root_diameter = 44.0
large_gear_z_start = 3.0
large_gear_face_width = 10.0

small_gear_teeth = 14
small_gear_tip_diameter = 32.0
small_gear_root_diameter = 26.0
small_gear_z_start = 20.0
small_gear_face_width = 10.0

# Function to generate star-polygon points
def get_star_points(teeth, r_tip, r_root):
    pts = []
    n = 2 * teeth
    for i in range(n):
        angle = i * (2.0 * math.pi / n)
        r = r_tip if i % 2 == 0 else r_root
        x = r * math.cos(angle)
        y = r * math.sin(angle)
        pts.append((x, y))
    return pts

# Create the central hub (Z = 0 to Z = 40)
# Positioned by centering a cylinder of length 40 at Z = 20
hub = cq.Workplane("XY").workplane(offset=hub_length / 2.0).cylinder(hub_length, hub_diameter / 2.0)

# Create the large spur gear (Z = 3 to Z = 13)
large_pts = get_star_points(large_gear_teeth, large_gear_tip_diameter / 2.0, large_gear_root_diameter / 2.0)
large_gear = (
    cq.Workplane("XY")
    .workplane(offset=large_gear_z_start)
    .polyline(large_pts)
    .close()
    .extrude(large_gear_face_width)
)

# Create the small spur gear (Z = 20 to Z = 30)
small_pts = get_star_points(small_gear_teeth, small_gear_tip_diameter / 2.0, small_gear_root_diameter / 2.0)
small_gear = (
    cq.Workplane("XY")
    .workplane(offset=small_gear_z_start)
    .polyline(small_pts)
    .close()
    .extrude(small_gear_face_width)
)

# Union the hub and both gears
compound = hub.union(large_gear).union(small_gear)

# Create a cylinder for the central bore, slightly elongated to ensure a clean cut
bore = cq.Workplane("XY").workplane(offset=hub_length / 2.0).cylinder(hub_length + 2.0, bore_diameter / 2.0)

# Perform the cut operation to create the final compound gear set
result = compound.cut(bore)