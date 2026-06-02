import cadquery as cq

# Parametric dimensions
diameter = 8.0
radius = diameter / 2.0
length = 150.0

# Create a tall cylindrical rod
# The cylinder is aligned along the Z-axis, centered on X and Y, 
# and sits with its bottom base at Z=0.
result = cq.Workplane("XY").cylinder(
    height=length,
    radius=radius,
    centered=(True, True, False)
)