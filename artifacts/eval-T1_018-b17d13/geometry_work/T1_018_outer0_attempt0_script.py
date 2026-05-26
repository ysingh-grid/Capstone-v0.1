import cadquery as cq

# Parametric dimensions
circum_diameter = 25.0  # Diameter of the circumscribed circle (vertex-to-vertex)
height = 40.0           # Height of the prism along the Z-axis
sides = 5               # Number of sides for a pentagon

# Create the regular pentagonal prism on the XY plane and extrude along +Z
result = (
    cq.Workplane("XY")
    .polygon(sides, circum_diameter)
    .extrude(height)
)