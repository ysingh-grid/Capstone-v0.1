import cadquery as cq

# Parametric dimensions
length = 150.0  # along X-axis
width = 50.0    # along Y-axis
height = 30.0   # along Z-axis

# Create the solid rectangular block centered at the origin (0, 0, 0)
result = cq.Workplane("XY").box(length, width, height, centered=(True, True, True))