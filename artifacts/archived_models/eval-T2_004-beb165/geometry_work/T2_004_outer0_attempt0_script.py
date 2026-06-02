import cadquery as cq

# Design Parameters
shaft_diameter = 8.0
shaft_length = 25.0
head_diameter = 13.0
head_height = 8.0
hex_socket_depth = 4.0
hex_socket_width_corners = 6.93

# 1. Generate the cylindrical shaft (Z = 0 to 25)
shaft = cq.Workplane("XY").circle(shaft_diameter / 2.0).extrude(shaft_length)

# 2. Generate the cylindrical head on top of the shaft (Z = 25 to 33)
head = shaft.faces(">Z").workplane().circle(head_diameter / 2.0).extrude(head_height)

# 3. Cut the hexagonal socket recess into the top face of the head (depth of 4mm)
result = (
    head.faces(">Z")
    .workplane()
    .polygon(6, hex_socket_width_corners)
    .cutBlind(-hex_socket_depth)
)