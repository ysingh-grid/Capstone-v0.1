import cadquery as cq

# Parametric dimensions
length = 120.0  # Dimension along X-axis
width = 45.0    # Dimension along Y-axis
height = 15.0   # Dimension along Z-axis

# Create the rectangular block centered at the origin
result = cq.Workplane("XY").box(length, width, height, centered=(True, True, True))