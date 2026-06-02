import cadquery as cq

# Parametric dimensions
side_length_x = 40.0  # Length of the horizontal leg
side_length_z = 40.0  # Length of the vertical leg
thickness = 5.0       # Thickness of the bracket walls
width = 20.0          # Width of the bracket (along Y-axis)

# Create the L-profile on the XZ workplane
# We draw the outer boundary, inner boundary, and close the profile
profile = (
    cq.Workplane("XZ")
    .moveTo(0, 0)
    .lineTo(side_length_x, 0)
    .lineTo(side_length_x, thickness)
    .lineTo(thickness, thickness)
    .lineTo(thickness, side_length_z)
    .lineTo(0, side_length_z)
    .close()
)

# Extrude symmetrically along the Y-axis to achieve the target width
result = profile.extrude(width / 2.0, both=True)

# Center the final bracket on the origin
# Currently, the bounding box is X: [0, 40], Y: [-10, 10], Z: [0, 40]
# We shift by -20 in X and -20 in Z to center it
result = result.translate((-side_length_x / 2.0, 0, -side_length_z / 2.0))