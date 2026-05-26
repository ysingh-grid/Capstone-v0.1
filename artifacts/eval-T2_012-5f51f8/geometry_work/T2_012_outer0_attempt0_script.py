import cadquery as cq

# Define parametric variables
plate_x = 60.0
plate_y = 40.0
plate_z = 8.0
hole_inset = 8.0

through_hole_diameter = 5.5
counterbore_diameter = 10.0
counterbore_depth = 3.0

# Calculate coordinate positions for the four holes
x_pos = plate_x / 2.0 - hole_inset
y_pos = plate_y / 2.0 - hole_inset
hole_positions = [
    (x_pos, y_pos),
    (x_pos, -y_pos),
    (-x_pos, y_pos),
    (-x_pos, -y_pos)
]

# Create the base plate centered at the origin
result = (
    cq.Workplane("XY")
    .box(plate_x, plate_y, plate_z, centered=(True, True, True))
    # Select the top face (+Z) to establish a workplane for the holes
    .faces(">Z")
    .workplane()
    # Place workplane points at the calculated coordinates
    .pushPoints(hole_positions)
    # Generate the counterbored holes through the entire plate thickness
    .cboreHole(through_hole_diameter, counterbore_diameter, counterbore_depth)
)