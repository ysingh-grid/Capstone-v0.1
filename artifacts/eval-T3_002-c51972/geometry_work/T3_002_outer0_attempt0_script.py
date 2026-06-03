import cadquery as cq

# Parametric dimensions
width_x = 80.0
length_y = 50.0
height_z = 25.0
fillet_rad = 8.0
wall_thick = 2.0
hole_dia = 3.2
hole_dist_x = 64.0
hole_dist_y = 34.0

# 1. Create the base solid centered on XY, extending up to Z=height_z
body = cq.Workplane("XY").rect(width_x, length_y).extrude(height_z)

# 2. Fillet the 4 vertical corners
body = body.edges("|Z").fillet(fillet_rad)

# 3. Shell inward to create a hollow tray, removing the top face (+Z)
# Negative thickness shells inward, preserving the outer dimensions of 80x50x25
body = body.faces(">Z").shell(-wall_thick)

# 4. Define the 4 mounting hole locations relative to the center
hx = hole_dist_x / 2.0
hy = hole_dist_y / 2.0
hole_positions = [(-hx, -hy), (-hx, hy), (hx, -hy), (hx, hy)]

# 5. Create the mounting holes through the bottom face
result = (
    body.faces("<Z")
    .workplane()
    .pushPoints(hole_positions)
    .hole(hole_dia)
)