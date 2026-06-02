import cadquery as cq

# Parametric dimensions
total_length = 60.0
width = 20.0
thickness = 8.0

# Derived dimensions for the stadium shape
radius = width / 2.0
straight_length = total_length - width  # 40.0 mm
circle_offset = straight_length / 2.0   # 20.0 mm

# Create the stadium shape by combining a central rectangle and two end circles,
# then extruding the combined profile.
result = (
    cq.Workplane("XY")
    .rect(straight_length, width)
    .pushPoints([(-circle_offset, 0), (circle_offset, 0)])
    .circle(radius)
    .extrude(thickness)
)