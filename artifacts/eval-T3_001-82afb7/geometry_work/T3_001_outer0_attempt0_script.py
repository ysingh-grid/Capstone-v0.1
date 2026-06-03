import cadquery as cq

# Parametric dimensions
x_len = 60.0
y_len = 40.0
z_len = 30.0
fillet_radius = 5.0
wall_thickness = 2.0

# Create the outer box centered on X and Y, with the bottom at Z=0
container = cq.Workplane("XY").box(x_len, y_len, z_len, centered=(True, True, False))

# Fillet the four vertical edges
container = container.edges("|Z").fillet(fillet_radius)

# Shell inward to preserve outer dimensions, removing the top face (+Z)
result = container.faces(">Z").shell(-wall_thickness)