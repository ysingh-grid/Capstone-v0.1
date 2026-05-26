import cadquery as cq

# Define parametric dimensions
diameter = 12.0
height = 100.0
chamfer_size = 1.0
radius = diameter / 2.0

# Create the main cylinder body centered at the origin
# Axis along Z, standing upright on the XY workplane
cylinder = cq.Workplane("XY").cylinder(height, radius, centered=(True, True, True))

# Select the circular edges at the top and bottom and apply the chamfer
result = cylinder.edges("%Circle").chamfer(chamfer_size)