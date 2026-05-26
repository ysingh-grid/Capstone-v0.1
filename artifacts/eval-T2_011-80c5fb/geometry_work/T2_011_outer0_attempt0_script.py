import cadquery as cq

# Parametric dimensions
diameter = 8.0
length = 40.0
chamfer_width = 1.0

# Create the main cylindrical body centered at the origin
# centered=(True, True, True) centers the cylinder on X, Y, and Z axes
# This places the center of mass at (0, 0, 0) and spans from Z = -20 to Z = 20
result = cq.Workplane("XY").cylinder(
    height=length,
    radius=diameter / 2.0,
    centered=(True, True, True)
)

# Select the top and bottom end faces, then select their circular outer edges
# Apply a symmetric 45-degree chamfer to these edges
result = result.faces(">Z or <Z").edges().chamfer(chamfer_width)