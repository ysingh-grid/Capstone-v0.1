import cadquery as cq

# Dimensions
leg_x = 20.0  # Leg along X-axis (mm)
leg_y = 30.0  # Leg along Y-axis (mm)
height_z = 40.0  # Extrusion height in +Z (mm)

# Create the right-angle triangular prism
# Start at the origin, draw legs along X and Y axes, then close and extrude
result = (
    cq.Workplane("XY")
    .moveTo(0, 0)
    .lineTo(leg_x, 0)
    .lineTo(0, leg_y)
    .close()
    .extrude(height_z)
)