import math
import cadquery as cq

# Parametric dimensions
disc_diameter = 120.0
disc_thickness = 20.0
hub_diameter = 40.0
hub_height = 10.0
bore_diameter = 16.0
lightening_hole_diameter = 22.0
pitch_circle_diameter = 70.0
hole_angles = [0, 60, 120, 180, 240, 300]

# Calculate hole center points on the pitch circle
pcd_radius = pitch_circle_diameter / 2.0
hole_points = [
    (pcd_radius * math.cos(math.radians(a)), pcd_radius * math.sin(math.radians(a)))
    for a in hole_angles
]

# Step 1: Create the main disc (Z = 0 to 20)
result = cq.Workplane("XY").cylinder(
    height=disc_thickness, 
    radius=disc_diameter / 2.0, 
    centered=(True, True, False)
)

# Step 2: Drill the six lightening holes through the disc
result = (
    result.faces(">Z")
    .workplane()
    .pushPoints(hole_points)
    .hole(lightening_hole_diameter)
)

# Step 3: Create the raised hub boss on top of the disc (Z = 20 to 30)
result = (
    result.faces(">Z")
    .workplane()
    .circle(hub_diameter / 2.0)
    .extrude(hub_height)
)

# Step 4: Drill the center bore through the entire height (Z = 0 to 30)
result = (
    result.faces(">Z")
    .workplane()
    .hole(bore_diameter)
)