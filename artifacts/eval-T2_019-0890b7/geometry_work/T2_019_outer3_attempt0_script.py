import cadquery as cq

# Parametric dimensions
block_x = 30.0
block_y = 20.0
block_z = 25.0

slot_width_x = 10.0
slot_depth_z = 15.0

pin_hole_diameter = 6.0
pin_hole_z_pos = 5.0

# Create the base block centered at the origin
result = cq.Workplane("XY").box(block_x, block_y, block_z, centered=(True, True, True))

# Cut the central slot from the top face
# Top face is selected using ">Z", then we cut a slot running full Y width
result = (
    result.faces(">Z")
    .workplane()
    .rect(slot_width_x, block_y)
    .cutBlind(-slot_depth_z)
)

# Drill the transverse pin hole through both prongs along the X direction.
# To prevent silent failures, we define the hole as a separate tool body on the YZ plane
# and perform a robust boolean cut.
hole = (
    cq.Workplane("YZ")
    .moveTo(0.0, pin_hole_z_pos)
    .circle(pin_hole_diameter / 2.0)
    .extrude(block_x, both=True)
)

result = result.cut(hole)