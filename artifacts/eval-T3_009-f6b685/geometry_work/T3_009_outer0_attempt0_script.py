import math
import cadquery as cq

# --- PARAMETERS ---
# Hub dimensions
hub_diameter = 16.0
hub_length = 40.0
bore_diameter = 8.0

# Large gear dimensions (24 teeth)
large_gear_teeth = 24
large_gear_tip_radius = 27.0
large_gear_root_radius = 22.0
large_gear_z_start = 3.0
large_gear_thickness = 10.0

# Small gear dimensions (14 teeth)
small_gear_teeth = 14
small_gear_tip_radius = 16.0
small_gear_root_radius = 13.0
small_gear_z_start = 20.0
small_gear_thickness = 10.0


def generate_star_points(teeth, r_tip, r_root):
    """Generates 2D vertices for a star polygon tooth profile."""
    points = []
    num_points = 2 * teeth
    for i in range(num_points):
        angle = i * (2.0 * math.pi / num_points)
        r = r_tip if i % 2 == 0 else r_root
        x = r * math.cos(angle)
        y = r * math.sin(angle)
        points.append((x, y))
    return points


# 1. Create the central cylindrical hub (Z=0 to Z=40)
hub = cq.Workplane("XY").cylinder(
    height=hub_length, radius=hub_diameter / 2.0, centered=(True, True, False)
)

# 2. Create the large gear (Z=3 to Z=13)
large_points = generate_star_points(
    large_gear_teeth, large_gear_tip_radius, large_gear_root_radius
)
large_sketch = cq.Sketch().polygon(large_points)
large_gear = (
    cq.Workplane("XY")
    .workplane(offset=large_gear_z_start)
    .placeSketch(large_sketch)
    .extrude(large_gear_thickness)
)

# 3. Create the small gear (Z=20 to Z=30)
small_points = generate_star_points(
    small_gear_teeth, small_gear_tip_radius, small_gear_root_radius
)
small_sketch = cq.Sketch().polygon(small_points)
small_gear = (
    cq.Workplane("XY")
    .workplane(offset=small_gear_z_start)
    .placeSketch(small_sketch)
    .extrude(small_gear_thickness)
)

# 4. Combine the hub and both gears
combined = hub.union(large_gear).union(small_gear)

# 5. Create and cut the central bore hole
# Make the bore slightly longer to ensure a clean cut through both ends
bore = (
    cq.Workplane("XY")
    .cylinder(
        height=hub_length + 2.0,
        radius=bore_diameter / 2.0,
        centered=(True, True, False),
    )
    .translate((0, 0, -1.0))
)

# Subtract bore to get the final compound gear
result = combined.cut(bore)