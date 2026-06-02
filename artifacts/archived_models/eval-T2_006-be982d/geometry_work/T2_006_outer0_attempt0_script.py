import cadquery as cq

# Define parametric dimensions
width = 40.0         # Width along X
base_depth = 40.0    # Depth of horizontal base along Y
base_thickness = 3.0 # Thickness of base along Z
wall_height = 50.0   # Height of vertical wall along Z
wall_thickness = 3.0 # Thickness of wall along Y

# Create the horizontal base
# Starts at Z = -3 (extends to Z = 0), and Y = 0 (extends to Y = 40), centered on X
base = (
    cq.Workplane("XY")
    .workplane(offset=-base_thickness)
    .box(width, base_depth, base_thickness, centered=(True, False, False))
)

# Create the vertical wall
# Starts at Z = -3 (extends to Z = 50), and Y = -3 (extends to Y = 0), centered on X
wall = (
    cq.Workplane("XY")
    .workplane(offset=-base_thickness)
    .center(0, -wall_thickness)
    .box(width, wall_thickness, wall_height + base_thickness, centered=(True, False, False))
)

# Combine the two parts to form the L-bracket
result = base.union(wall)