import cadquery as cq

# Parametric variables
side_length = 10.0

# Create a 3D box (cube) centered at the origin (0,0,0)
result = cq.Workplane("XY").box(
    side_length, 
    side_length, 
    side_length, 
    centered=(True, True, True)
)