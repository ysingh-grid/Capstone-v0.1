import cadquery as cq

# Define parametric dimensions
length = 50.0
width = 30.0
height = 20.0

# Create the rectangular block centered at the origin
# Built on XY workplane, with Z-axis pointing up
result = cq.Workplane("XY").box(length, width, height, centered=(True, True, True))