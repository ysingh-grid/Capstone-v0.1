import cadquery as cq

# Parametric variables
NUM_SIDES = 8
CIRCUMSCRIBED_DIAMETER = 40.0  # Vertices lie on a circle of this diameter
HEIGHT = 15.0                 # Extrusion height along +Z

# Create a regular octagonal prism centered on the XY plane
# polygon() by default creates a polygon inscribed in a circle of the given diameter (vertices on the circle)
result = (
    cq.Workplane("XY")
    .polygon(nSides=NUM_SIDES, diameter=CIRCUMSCRIBED_DIAMETER)
    .extrude(HEIGHT)
)