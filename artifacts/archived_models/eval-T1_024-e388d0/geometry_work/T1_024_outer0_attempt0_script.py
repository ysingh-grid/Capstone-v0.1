import cadquery as cq

# Define parametric variables
side_length = 30.0
chamfer_size = 2.0

# Create a 30x30x30 mm box centered at the origin
box = cq.Workplane("XY").box(side_length, side_length, side_length, centered=(True, True, True))

# Select all 12 edges of the box and apply a 2mm symmetric chamfer
result = box.edges().chamfer(chamfer_size)