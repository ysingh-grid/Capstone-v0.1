import cadquery as cq

# Define parametric variables
side_length = 20.0
fillet_radius = 3.0

# Create a 3D cube centered on the origin
# Dimensions: 20mm x 20mm x 20mm
cube = cq.Workplane("XY").box(side_length, side_length, side_length, centered=(True, True, True))

# Select all 12 edges of the cube and apply a 3mm fillet
result = cube.edges().fillet(fillet_radius)