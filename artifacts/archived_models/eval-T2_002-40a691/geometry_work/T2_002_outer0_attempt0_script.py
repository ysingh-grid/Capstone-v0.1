import cadquery as cq

# Parametric variables
circumscribed_diameter = 19.6  # Diameter of the circumscribed circle (vertex-to-vertex)
height = 8.0                   # Height of the nut (Z-axis direction)
hole_diameter = 10.0           # Diameter of the central through-hole

# Create the hexagonal nut:
# 1. Start on the XY plane (base at Z=0)
# 2. Draw a 6-sided regular polygon (hexagon) with the specified circumscribed diameter
# 3. Extrude upwards by the height to create the prism
# 4. Select the top face and drill a centered hole through the entire body
result = (
    cq.Workplane("XY")
    .polygon(6, circumscribed_diameter)
    .extrude(height)
    .faces(">Z")
    .workplane()
    .hole(hole_diameter)
)