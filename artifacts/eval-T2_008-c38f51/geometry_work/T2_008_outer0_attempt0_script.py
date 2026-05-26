import cadquery as cq

# Parametric dimensions
plate_length_x = 80.0
plate_width_y = 60.0
plate_thickness_z = 5.0
hole_diameter = 4.2
hole_inset = 8.0

# Calculate hole coordinates relative to the origin (centered plate)
x_pos = (plate_length_x / 2.0) - hole_inset
y_pos = (plate_width_y / 2.0) - hole_inset
hole_positions = [
    (x_pos, y_pos),
    (-x_pos, y_pos),
    (-x_pos, -y_pos),
    (x_pos, -y_pos)
]

# Create the flat rectangular mounting plate centered at the origin
# and drill the four M4 clearance holes through it
result = (
    cq.Workplane("XY")
    .box(plate_length_x, plate_width_y, plate_thickness_z, centered=(True, True, True))
    .faces(">Z")
    .workplane()
    .pushPoints(hole_positions)
    .hole(hole_diameter)
)