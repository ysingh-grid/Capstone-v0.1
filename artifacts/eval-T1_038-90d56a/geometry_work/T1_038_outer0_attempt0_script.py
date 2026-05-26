import cadquery as cq

# Parametric variables
circumscribed_diameter = 15.0  # Diameter of the circumscribed circle (mm)
length = 120.0                 # Length of the hexagonal bar (mm)
num_sides = 6                  # A hexagon has 6 sides

# Build the hexagonal bar centered at the origin
# Start the XY plane offset by -length/2 so that the extruded body is centered in Z
result = (
    cq.Workplane("XY")
    .workplane(offset=-length / 2.0)
    .polygon(num_sides, circumscribed_diameter)
    .extrude(length)
)