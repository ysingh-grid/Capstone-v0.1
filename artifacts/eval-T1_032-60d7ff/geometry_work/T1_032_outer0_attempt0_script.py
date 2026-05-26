# Parametric variables
num_sides = 12                  # Number of sides for the dodecagon
circumscribed_diameter = 35.0    # Vertex-to-vertex diameter of the dodecagon (mm)
height = 20.0                   # Height of the prism (mm)

# Create the 12-sided regular polygon on the XY plane and extrude it along the Z-axis
result = (
    cq.Workplane("XY")
    .polygon(nSides=num_sides, diameter=circumscribed_diameter)
    .extrude(height)
)