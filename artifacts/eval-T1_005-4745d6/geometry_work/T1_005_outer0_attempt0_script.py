import cadquery as cq

# Define parametric variables for the cube
side_length = 40.0

# Create the solid cube centered at the origin
result = cq.Workplane("XY").box(
    side_length, 
    side_length, 
    side_length, 
    centered=(True, True, True)
)