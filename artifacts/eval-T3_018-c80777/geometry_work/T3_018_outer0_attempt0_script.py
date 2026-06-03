import cadquery as cq

# --- Parametric dimensions ---
hub_size = 30.0          # hub square side length (mm)
hub_thickness = 3.0      # hub/chassis thickness (mm)

arm_length = 45.0        # arm length from hub edge to motor mount center
arm_width = 10.0         # arm width (perpendicular to arm axis)
arm_start = 15.0         # distance from origin to hub edge (hub_size/2)
arm_end = 60.0           # distance from origin to motor mount center

motor_mount_dia = 18.0   # motor mount disk diameter (mm)
motor_shaft_dia = 5.0    # motor shaft hole diameter (mm)

m3_dia = 3.2             # M3 mounting hole diameter (mm)
m3_offset = 10.0         # M3 hole offset from center (mm)

# --- Build the central hub plate ---
hub = (
    cq.Workplane("XY")
    .box(hub_size, hub_size, hub_thickness, centered=(True, True, False))
)

# --- Build +X arm: box from x=15 to x=60, centered on Y, width=10mm ---
arm_px = (
    cq.Workplane("XY")
    .box(arm_length, arm_width, hub_thickness, centered=(True, True, False))
    .translate(((arm_start + arm_end) / 2.0, 0, 0))
)

# --- Build -X arm ---
arm_nx = (
    cq.Workplane("XY")
    .box(arm_length, arm_width, hub_thickness, centered=(True, True, False))
    .translate((-((arm_start + arm_end) / 2.0), 0, 0))
)

# --- Build +Y arm ---
arm_py = (
    cq.Workplane("XY")
    .box(arm_width, arm_length, hub_thickness, centered=(True, True, False))
    .translate((0, (arm_start + arm_end) / 2.0, 0))
)

# --- Build -Y arm ---
arm_ny = (
    cq.Workplane("XY")
    .box(arm_width, arm_length, hub_thickness, centered=(True, True, False))
    .translate((0, -((arm_start + arm_end) / 2.0), 0))
)

# --- Build motor mount disks (cylinders, axis along Z) ---
motor_mount_px = (
    cq.Workplane("XY")
    .cylinder(hub_thickness, motor_mount_dia / 2.0, centered=(True, True, False))
    .translate((arm_end, 0, 0))
)

motor_mount_nx = (
    cq.Workplane("XY")
    .cylinder(hub_thickness, motor_mount_dia / 2.0, centered=(True, True, False))
    .translate((-arm_end, 0, 0))
)

motor_mount_py = (
    cq.Workplane("XY")
    .cylinder(hub_thickness, motor_mount_dia / 2.0, centered=(True, True, False))
    .translate((0, arm_end, 0))
)

motor_mount_ny = (
    cq.Workplane("XY")
    .cylinder(hub_thickness, motor_mount_dia / 2.0, centered=(True, True, False))
    .translate((0, -arm_end, 0))
)

# --- Union all solid bodies together ---
chassis = (
    hub
    .union(arm_px)
    .union(arm_nx)
    .union(arm_py)
    .union(arm_ny)
    .union(motor_mount_px)
    .union(motor_mount_nx)
    .union(motor_mount_py)
    .union(motor_mount_ny)
)

# --- Drill motor shaft holes (5mm dia) through each motor mount ---
# Use top face workplane and pushPoints for all motor shaft holes at once
chassis = (
    chassis
    .faces(">Z")
    .workplane()
    .pushPoints([
        (arm_end,   0),
        (-arm_end,  0),
        (0,         arm_end),
        (0,        -arm_end),
    ])
    .hole(motor_shaft_dia)
)

# --- Drill M3 mounting holes (3.2mm dia) through the hub in 20x20mm pattern ---
chassis = (
    chassis
    .faces(">Z")
    .workplane()
    .pushPoints([
        ( m3_offset,  m3_offset),
        ( m3_offset, -m3_offset),
        (-m3_offset,  m3_offset),
        (-m3_offset, -m3_offset),
    ])
    .hole(m3_dia)
)

# --- Assign final result ---
result = chassis