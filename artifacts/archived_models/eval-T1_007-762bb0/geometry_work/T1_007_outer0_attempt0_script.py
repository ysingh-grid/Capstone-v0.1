import cadquery as cq

# Parameters
num_sides = 6                  # Hexagonal prism has 6 sides
circumscribed_diameter = 20.0  # Diameter of the circumscribed circle (mm)
height = 35.0                  # Height of the prism (mm)

# Create the hexagonal prism
# We define a regular hexagon on the XY plane and extrude it in the +Z direction.
result = cq.Workplane("XY").polygon(num_sides, circumscribed_diameter).extrude(height)