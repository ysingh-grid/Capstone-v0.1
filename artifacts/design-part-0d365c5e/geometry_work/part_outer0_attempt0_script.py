import cadquery as cq

# Parametric variables
side_length_1 = 40.0  # Length of horizontal leg (along Y)
side_length_2 = 40.0  # Length of vertical leg (along Z)
thickness = 5.0       # Thickness of the bracket
width = 20.0          # Width of the bracket (along X)

# Create the L-bracket profile on the YZ plane and extrude along X
result = (
    cq.Workplane("YZ")
    .moveTo(0, 0)
    .lineTo(side_length_1, 0)
    .lineTo(side_length_1, thickness)
    .lineTo(thickness, thickness)
    .lineTo(thickness, side_length_2)
    .lineTo(0, side_length_2)
    .close()
    .extrude(width)
)