import cadquery as cq

# Parametric dimensions
outer_diameter = 50.0
inner_diameter = 25.0
thickness = 4.0

# Create the large flat washer
# 1. Create the outer cylinder by drawing a circle on the XY plane and extruding in +Z
# 2. Select the top face and drill a concentric hole through the center
result = (
    cq.Workplane("XY")
    .circle(outer_diameter / 2.0)
    .extrude(thickness)
    .faces(">Z")
    .workplane()
    .hole(inner_diameter)
)