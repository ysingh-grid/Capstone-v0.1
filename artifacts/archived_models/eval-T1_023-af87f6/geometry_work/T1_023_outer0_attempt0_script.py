import cadquery as cq

# Parametric variables
length = 50.0
width = 25.0
height = 15.0
fillet_radius = 3.0

# Build the main rectangular body centered on the origin
# The height is along the Z-axis, length along X, and width along Y
body = cq.Workplane("XY").box(length, width, height, centered=True)

# Select all vertical edges (parallel to Z-axis) and apply the 3mm fillet
result = body.edges("|Z").fillet(fillet_radius)