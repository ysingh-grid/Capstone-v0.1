import cadquery as cq

# --- Parametric Dimensions ---
THICKNESS = 3.0

# Side rails
RAIL_LENGTH = 160.0
RAIL_WIDTH = 12.0
RAIL_Y_OFFSET = 30.0

# Center plate
CENTER_PLATE_LENGTH = 50.0
CENTER_PLATE_WIDTH = 72.0

# Motor mounts & holes
MOTOR_MOUNT_DIA = 22.0
MOTOR_SHAFT_HOLE_DIA = 5.0
MOTOR_POSITIONS = [
    (80.0, 30.0),
    (80.0, -30.0),
    (-80.0, 30.0),
    (-80.0, -30.0)
]

# Mounting holes
MOUNTING_HOLE_DIA = 3.2
MOUNTING_POSITIONS = [
    (10.0, 10.0),
    (10.0, -10.0),
    (-10.0, 10.0),
    (-10.0, -10.0)
]

# --- Geometry Construction ---

# 1. Create the center plate lying flat on the XY plane (Z from 0 to THICKNESS)
center_plate = cq.Workplane("XY").box(
    CENTER_PLATE_LENGTH,
    CENTER_PLATE_WIDTH,
    THICKNESS,
    centered=(True, True, False)
)

# 2. Create the left side rail (centered at Y = -30mm)
left_rail = (
    cq.Workplane("XY")
    .center(0.0, -RAIL_Y_OFFSET)
    .box(RAIL_LENGTH, RAIL_WIDTH, THICKNESS, centered=(True, True, False))
)

# 3. Create the right side rail (centered at Y = +30mm)
right_rail = (
    cq.Workplane("XY")
    .center(0.0, RAIL_Y_OFFSET)
    .box(RAIL_LENGTH, RAIL_WIDTH, THICKNESS, centered=(True, True, False))
)

# 4. Create the four circular motor mounts at the rail ends
motor_mounts = (
    cq.Workplane("XY")
    .pushPoints(MOTOR_POSITIONS)
    .circle(MOTOR_MOUNT_DIA / 2.0)
    .extrude(THICKNESS)
)

# 5. Union all component parts to form the solid H-frame chassis
chassis = (
    center_plate
    .union(left_rail)
    .union(right_rail)
    .union(motor_mounts)
)

# 6. Drill the 5mm motor shaft holes through each motor mount
chassis_with_motor_holes = (
    chassis.faces(">Z")
    .workplane()
    .pushPoints(MOTOR_POSITIONS)
    .hole(MOTOR_SHAFT_HOLE_DIA)
)

# 7. Drill the 3.2mm M3 mounting holes through the center plate
result = (
    chassis_with_motor_holes.faces(">Z")
    .workplane()
    .pushPoints(MOUNTING_POSITIONS)
    .hole(MOUNTING_HOLE_DIA)
)