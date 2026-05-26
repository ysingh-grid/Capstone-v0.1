import cadquery as cq

# Parametric variables
cylinder_diameter = 20.0
cylinder_height = 20.0
fillet_rad = 2.0

# Calculate radius from diameter
cylinder_radius = cylinder_diameter / 2.0

# Generate the base cylinder centered at the origin
# Centered on all axes: Z ranges from -10 to +10, X and Y from -10 to +10
cylinder = cq.Workplane("XY").cylinder(
    height=cylinder_height,
    radius=cylinder_radius,
    centered=(True, True, True)
)

# Select the circular edges (top and bottom) and apply the fillet
result = cylinder.edges("%Circle").fillet(fillet_rad)