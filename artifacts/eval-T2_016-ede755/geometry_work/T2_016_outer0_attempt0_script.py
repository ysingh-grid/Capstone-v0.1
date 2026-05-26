import cadquery as cq

# Parametric dimensions for the shoulder screw
threaded_dia = 6.0
threaded_len = 10.0

shoulder_dia = 10.0
shoulder_len = 20.0

head_dia = 14.0
head_len = 5.0

# Start at Z=0 on the XY plane
# 1. Threaded section (Z=0 to Z=10)
result = (
    cq.Workplane("XY")
    .circle(threaded_dia / 2.0)
    .extrude(threaded_len)
)

# 2. Shoulder section (Z=10 to Z=30)
# Select the top face of the threaded section, then extrude the shoulder
result = (
    result.faces(">Z")
    .workplane()
    .circle(shoulder_dia / 2.0)
    .extrude(shoulder_len)
)

# 3. Head section (Z=30 to Z=35)
# Select the top face of the shoulder section, then extrude the head
result = (
    result.faces(">Z")
    .workplane()
    .circle(head_dia / 2.0)
    .extrude(head_len)
)