import cadquery as cq

# Parametric dimensions
width = 40.0          # Dimension along X axis
depth = 20.0          # Dimension along Y axis
height = 60.0         # Dimension along Z axis
fillet_radius = 4.0   # Fillet radius for the vertical edges

# Create the solid rectangular block centered on the origin
result = cq.Workplane("XY").box(width, depth, height, centered=(True, True, True))

# Select only the vertical edges (parallel to the Z axis) and apply the fillet
result = result.edges("|Z").fillet(fillet_radius)