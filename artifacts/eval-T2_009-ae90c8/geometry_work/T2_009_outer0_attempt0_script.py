import cadquery as cq

# Parametric dimensions
flange_outer_diameter = 30.0
flange_thickness = 3.0
body_outer_diameter = 20.0
body_length = 30.0
bore_diameter = 10.0

# 1. Create the bottom flange standing on the XY plane (from Z=0 to Z=3)
result = (
    cq.Workplane("XY")
    .circle(flange_outer_diameter / 2.0)
    .extrude(flange_thickness)
)

# 2. Select the top of the flange (at Z=3) and extrude the cylindrical body (up to Z=33)
result = (
    result.faces(">Z")
    .workplane()
    .circle(body_outer_diameter / 2.0)
    .extrude(body_length)
)

# 3. Create the concentric through-bore running through the entire length of the part
result = (
    result.faces(">Z")
    .workplane()
    .hole(bore_diameter)
)