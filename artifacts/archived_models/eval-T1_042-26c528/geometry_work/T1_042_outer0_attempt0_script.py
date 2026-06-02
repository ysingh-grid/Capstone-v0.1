import cadquery as cq

# Parametric dimensions
length = 90.0
width = 20.0
height = 8.0
fillet_radius = 2.0

# Create the base rectangular prism centered on the XY plane
# Length is along X, width along Y, height along Z
result = cq.Workplane("XY").box(length, width, height, centered=(True, True, True))

# Select the four long edges (parallel to the X-axis) and apply the fillet
result = result.edges("|X").fillet(fillet_radius)