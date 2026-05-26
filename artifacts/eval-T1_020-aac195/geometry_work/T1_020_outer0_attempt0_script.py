import cadquery as cq

# Parametric dimensions
cylinder_diameter = 36.0
cylinder_radius = cylinder_diameter / 2.0
cylinder_height = 60.0

# Create a cylinder centered at (0,0,0) in all directions (X, Y, and Z)
# This will span Z from -30.0 to +30.0 mm
result = cq.Workplane("XY").cylinder(
    height=cylinder_height,
    radius=cylinder_radius,
    centered=(True, True, True)
)