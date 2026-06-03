import cadquery as cq

# Parametric dimensions
hub_size = 30.0
thickness = 3.0
arm_length = 45.0
arm_width = 10.0
motor_mount_dia = 18.0
motor_shaft_hole_dia = 5.0
fc_hole_dia = 3.2
fc_pattern_size = 20.0

# Calculated values
arm_total_span = (hub_size / 2.0 + arm_length) * 2.0  # (15 + 45) * 2 = 120mm
mount_offset = hub_size / 2.0 + arm_length  # 60mm
fc_offset = fc_pattern_size / 2.0  # 10mm

# 1. Create the central square hub (Z = 0 to 3)
hub = cq.Workplane("XY").box(hub_size, hub_size, thickness, centered=(True, True, False))

# 2. Create the X and Y arms spanning across the center
arm_x = cq.Workplane("XY").box(arm_total_span, arm_width, thickness, centered=(True, True, False))
arm_y = cq.Workplane("XY").box(arm_width, arm_total_span, thickness, centered=(True, True, False))

# 3. Create the circular motor mount platforms
mount_points = [
    (mount_offset, 0.0),
    (-mount_offset, 0.0),
    (0.0, mount_offset),
    (0.0, -mount_offset)
]
mounts = (
    cq.Workplane("XY")
    .pushPoints(mount_points)
    .circle(motor_mount_dia / 2.0)
    .extrude(thickness)
)

# 4. Union the hub, arms, and motor mounts to form the solid chassis base
chassis = hub.union(arm_x).union(arm_y).union(mounts)

# 5. Create the tool for cutting the motor shaft holes
motor_holes_tool = (
    cq.Workplane("XY")
    .pushPoints(mount_points)
    .circle(motor_shaft_hole_dia / 2.0)
    .extrude(thickness)
)

# 6. Create the tool for cutting the flight controller mounting holes
fc_points = [
    (fc_offset, fc_offset),
    (fc_offset, -fc_offset),
    (-fc_offset, fc_offset),
    (-fc_offset, -fc_offset)
]
fc_holes_tool = (
    cq.Workplane("XY")
    .pushPoints(fc_points)
    .circle(fc_hole_dia / 2.0)
    .extrude(thickness)
)

# 7. Perform boolean cuts to create all holes through the chassis
result = chassis.cut(motor_holes_tool).cut(fc_holes_tool)