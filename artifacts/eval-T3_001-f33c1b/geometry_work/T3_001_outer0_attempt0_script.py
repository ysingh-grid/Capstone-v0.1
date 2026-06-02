import cadquery as cq

# Parametric dimensions
outer_x = 60.0       # outer length in X
outer_y = 40.0       # outer width in Y
outer_z = 30.0       # outer height in Z
wall_t  = 2.0        # wall thickness
fillet_r = 5.0       # vertical edge fillet radius (outer)
inner_fillet_r = fillet_r - wall_t  # inner vertical fillet radius = 3.0

# Step 1: Create outer rounded-rectangle prism
# Box centered at origin in XY, sitting on XY plane (Z from 0 to 30)
# centered=(True, True, False) centers X and Y but base at Z=0
outer = (
    cq.Workplane("XY")
    .box(outer_x, outer_y, outer_z, centered=(True, True, False))
)

# Step 2: Fillet the four vertical edges (parallel to Z axis)
outer = outer.edges("|Z").fillet(fillet_r)

# Step 3: Shell the solid inward with 2mm wall thickness, removing the top face
# Negative thickness = inward shell (preserves outer dimensions)
result = (
    outer
    .faces(">Z")
    .shell(-wall_t)
)