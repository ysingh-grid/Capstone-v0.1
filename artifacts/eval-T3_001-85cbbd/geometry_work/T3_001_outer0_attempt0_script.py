import cadquery as cq

# Parametric dimensions
outer_x = 60.0
outer_y = 40.0
outer_z = 30.0
fillet_radius = 5.0
wall_thickness = 2.0

# Step 1: Create the outer rounded-rectangle prism
# Build a 60x40x30mm box centered at origin, sitting on XY plane (Z=0 to Z=30)
outer = (
    cq.Workplane("XY")
    .box(outer_x, outer_y, outer_z, centered=(True, True, False))
)

# Step 2: Fillet only the 4 vertical edges (parallel to Z-axis)
# This gives the rounded-rectangle cross-section with 5mm corner radius
outer = outer.edges("|Z").fillet(fillet_radius)

# Step 3: Shell the solid inward with 2mm wall thickness, removing the top face
# Negative thickness = shell inward (preserves outer dimensions)
# Select the top face (>Z) to open it
result = outer.faces(">Z").shell(-wall_thickness)