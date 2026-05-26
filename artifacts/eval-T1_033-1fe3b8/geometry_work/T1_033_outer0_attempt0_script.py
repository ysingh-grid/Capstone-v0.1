import cadquery as cq

# Parametric dimensions
num_sides = 12                  # 12-sided polygon (dodecagon)
circumscribed_diameter = 50.0   # Circumscribed circle diameter (vertex-to-vertex)
height = 10.0                   # Prism height along the Z-axis

# Create the regular dodecagonal prism
# The polygon is drawn on the XY workplane, centered at the origin,
# and then extruded in the +Z direction.
result = cq.Workplane("XY").polygon(nSides=num_sides, diameter=circumscribed_diameter).extrude(height)