import cadquery as cq

# Parametric dimensions
block_length = 25.0
block_width = 15.0
block_height = 10.0
chamfer_distance = 1.0

# Create the 3D rectangular block centered on the origin
# and apply a symmetric 1mm chamfer to all 12 edges
result = (
    cq.Workplane("XY")
    .box(block_length, block_width, block_height, centered=(True, True, True))
    .edges()
    .chamfer(chamfer_distance)
)