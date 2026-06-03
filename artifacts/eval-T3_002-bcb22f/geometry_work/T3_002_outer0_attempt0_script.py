import cadquery as cq

# Parametric dimensions
outer_x = 80.0       # Outer length in X
outer_y = 50.0       # Outer width in Y
outer_z = 25.0       # Outer height in Z
fillet_r = 8.0       # Vertical edge fillet radius
wall_t = 2.0         # Wall/floor thickness (shell inward)
hole_dia = 3.2       # Mounting hole diameter
hole_pat_x = 64.0    # Mounting hole pattern span in X
hole_pat_y = 34.0    # Mounting hole pattern span in Y

# Step 1: Create the outer rounded-rectangle prism
# Box centered at origin, base at Z=0 (centered X and Y, not Z)
result = (
    cq.Workplane("XY")
    .box(outer_x, outer_y, outer_z, centered=(True, True, False))
)

# Step 2: Fillet the four vertical edges (parallel to Z axis)
result = result.edges("|Z").fillet(fillet_r)

# Step 3: Shell inward by 2mm, removing the top face (+Z) to make an open tray
# Negative thickness = inward shell (preserves outer dimensions)
result = result.faces(">Z").shell(-wall_t)

# Step 4: Drill four 3.2mm mounting holes through the bottom
# Hole centers at (±32, ±17) — 8mm inset from each outer edge
hole_x = hole_pat_x / 2.0   # 32.0
hole_y = hole_pat_y / 2.0   # 17.0

hole_positions = [
    ( hole_x,  hole_y),
    (-hole_x,  hole_y),
    ( hole_x, -hole_y),
    (-hole_x, -hole_y),
]

# Work from the top face, push all hole positions, drill through full depth
result = (
    result
    .faces(">Z")
    .workplane()
    .pushPoints(hole_positions)
    .hole(hole_dia, outer_z)
)