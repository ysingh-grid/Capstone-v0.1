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
# We center it in XY, and set Z to start at 0
result = cq.Workplane("XY").cylinder(
    height=disc_thickness, 
    radius=disc_diameter / 2.0, 
    centered=(True, True, False)
)

# Step 2: Drill the six lightening holes through the disc
# We select the top face of the disc (Z=20) and drill down
result = (
    result.faces(">Z")
    .workplane()
    .pushPoints(hole_points)
    .hole(lightening_hole_diameter)
)

# Step 3: Create the raised hub boss on top of the disc (Z = 20 to 30)
# We select the top face of the disc, reset the workplane center to origin,
# draw the hub profile, and extrude it upwards.
result = (
    result.faces(">Z")
    .workplane(centerPoint=(0, 0))
    .circle(hub_diameter / 2.0)
    .extrude(hub_height)
)

# Step 4: Drill the center bore through the entire height (Z = 0 to 30)
# We select the topmost face (hub top, Z=30) and drill a through-hole
result = (
    result.faces(">Z")
    .workplane(centerPoint=(0, 0))
    .hole(bore_diameter)
)