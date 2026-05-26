import cadquery as cq

# Design Parameters
length = 70.0      # Dimension along X-axis (mm)
width = 40.0       # Dimension along Y-axis (mm)
height = 25.0      # Dimension along Z-axis (mm)
fillet_radius = 5.0 # Fillet radius for all edges (mm)

# Step 1: Create the base rectangular block centered on the XY plane
result = cq.Workplane("XY").box(length, width, height, centered=(True, True, True))

# Step 2: Apply fillet to all 12 edges of the block
result = result.edges().fillet(fillet_radius)