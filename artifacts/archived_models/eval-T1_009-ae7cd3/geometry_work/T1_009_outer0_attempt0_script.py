import cadquery as cq

# Parametric variables
diameter = 50.0
thickness = 2.0
radius = diameter / 2.0

# Build the thin disc on the XY workplane
# It lies flat on XY, with thickness extending in the +Z direction
result = (
    cq.Workplane("XY")
    .circle(radius)
    .extrude(thickness)
)