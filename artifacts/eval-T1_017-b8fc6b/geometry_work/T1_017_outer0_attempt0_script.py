import cadquery as cq

# Parametric variables
side_length = 80.0
thickness = 5.0

# Create the square plate centered at the origin
# Built on the XY workplane, with thickness along the Z-axis
result = cq.Workplane("XY").box(side_length, side_length, thickness)