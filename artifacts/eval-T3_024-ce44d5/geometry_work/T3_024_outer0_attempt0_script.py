import math
import cadquery as cq

# Parametric dimensions
main_disc_diameter = 120.0
main_disc_thickness = 20.0
hub_boss_diameter = 40.0
hub_boss_height = 10.0
center_bore_diameter = 16.0
lightening_hole_diameter = 22.0
lightening_hole_pcd = 70.0

# Calculate coordinates for the 6 lightening holes
pcd_radius = lightening_hole_pcd / 2.0
angles = [0, 60, 120, 180, 240, 300]
hole_centers = [
    (pcd_radius * math.cos(math.radians(a)), pcd_radius * math.sin(math.radians(a)))
    for a in angles
]

# Step 1: Create the main flywheel disc centered on the XY plane
result = (
    cq.Workplane("XY")
    .circle(main_disc_diameter / 2.0)
    .extrude(main_disc_thickness)
)

# Step 2: Create the raised hub boss on top of the main disc (Z = 20 to 30)
result = (
    result.faces(">Z")
    .workplane()
    .circle(hub_boss_diameter / 2.0)
    .extrude(hub_boss_height)
)

# Step 3: Cut the center bore through the entire height of the part
result = (
    result.faces(">Z")
    .workplane()
    .hole(center_bore_diameter)
)

# Step 4: Cut the 6 lightening holes through the disc
# The holes are on a 35mm radius, so they clear the 20mm radius hub boss
result = (
    result.faces(">Z")
    .workplane()
    .pushPoints(hole_centers)
    .hole(lightening_hole_diameter)
)