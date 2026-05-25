import cadquery as cq

# Parametric dimensions
outer_diameter = 50.0
length = 70.0
outer_radius = outer_diameter / 2.0
chamfer_dist = 1.0

# Keyway dimensions
keyway_width = 10.0
keyway_depth = 2.0

# Stepped bore dimensions
bore_1_diameter = 15.0
bore_1_length = 30.0
bore_2_diameter = 20.0
bore_2_length = 40.0

bore_1_radius = bore_1_diameter / 2.0
bore_2_radius = bore_2_diameter / 2.0

# 1. Create the main cylinder body centered at the origin
body = cq.Workplane("XY").cylinder(height=length, radius=outer_radius, centered=(True, True, True))

# 2. Chamfer the outer circular edges of the cylinder
# A simple cylinder has exactly 2 edges (the top and bottom outer rims)
body = body.edges().chamfer(chamfer_dist)

# 3. Create the keyway tool (a box to subtract)
# Position it so it cuts 2mm deep (from Y = outer_radius - keyway_depth to Y = outer_radius + margin)
key_y_center = outer_radius - keyway_depth + 10.0
keyway_box = (
    cq.Workplane("XY")
    .workplane(offset=-length/2.0 - 2.0)  # Start slightly below the cylinder
    .rect(keyway_width, 20.0)
    .extrude(length + 4.0)               # Extrude past the cylinder's top
    .translate((0, key_y_center, 0))
)

# 4. Create the first section of the central stepped bore (bottom section)
bore1 = (
    cq.Workplane("XY")
    .workplane(offset=-length/2.0 - 1.0)  # Start slightly below the bottom face
    .cylinder(height=bore_1_length + 1.0, radius=bore_1_radius, centered=(True, True, False))
)

# 5. Create the second section of the central stepped bore (top section)
bore2 = (
    cq.Workplane("XY")
    .workplane(offset=-length/2.0 + bore_1_length)  # Start at the step transition
    .cylinder(height=bore_2_length + 1.0, radius=bore_2_radius, centered=(True, True, False))
)

# 6. Subtract the keyway and both bore sections from the main body
result = body.cut(keyway_box).cut(bore1).cut(bore2)