import cadquery as cq

# Parameters
outer_diameter = 40.0
inner_diameter = 30.0
height = 12.0

# Calculate radii
outer_radius = outer_diameter / 2.0

# Build the solid ring
# 1. Create a circular disk on the XY plane and extrude it along +Z
# 2. Select the top face and drill a concentric hole through the cylinder
result = (
    cq.Workplane("XY")
    .circle(outer_radius)
    .extrude(height)
    .faces(">Z")
    .workplane()
    .hole(inner_diameter)
)