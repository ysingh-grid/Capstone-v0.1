import cadquery as cq

# Define parametric dimensions
thickness = 3.0
rail_length = 160.0
rail_width = 12.0
rail_y_offset = 30.0

center_plate_length = 50.0
center_plate_width = 72.0

motor_mount_dia = 22.0
motor_shaft_hole_dia = 5.0

mounting_hole_dia = 3.2

# Define coordinates for motor mounts and shaft holes
motor_coords = [
    (80.0, 30.0),
    (80.0, -30.0),
    (-80.0, 30.0),
    (-80.0, -30.0)
]

# Define coordinates for the M3 mounting holes on the center plate
mounting_coords = [
    (10.0, 10.0),
    (10.0, -10.0),
    (-10.0, 10.0),
    (-10.0, -10.0)
]

# Create the center plate (centered at the origin, Z from 0 to 3)
center_plate = (
    cq.Workplane("XY")
    .rect(center_plate_length, center_plate_width)
    .extrude(thickness)
)

# Create the two parallel side rails
rails = (
    cq.Workplane("XY")
    .pushPoints([(0.0, -rail_y_offset), (0.0, rail_y_offset)])
    .rect(rail_length, rail_width)
    .extrude(thickness)
)

# Create the four circular motor mounts
mounts = (
    cq.Workplane("XY")
    .pushPoints(motor_coords)
    .circle(motor_mount_dia / 2.0)
    .extrude(thickness)
)

# Union the main body components together
chassis = center_plate.union(rails).union(mounts)

# Create cutting cylinders for the motor shaft holes (slightly taller for a clean cut)
shaft_holes = (
    cq.Workplane("XY")
    .workplane(offset=-1.0)
    .pushPoints(motor_coords)
    .circle(motor_shaft_hole_dia / 2.0)
    .extrude(thickness + 2.0)
)

# Create cutting cylinders for the mounting holes on the center plate
mounting_holes = (
    cq.Workplane("XY")
    .workplane(offset=-1.0)
    .pushPoints(mounting_coords)
    .circle(mounting_hole_dia / 2.0)
    .extrude(thickness + 2.0)
)

# Cut the holes from the chassis solid to produce the final model
result = chassis.cut(shaft_holes).cut(mounting_holes)