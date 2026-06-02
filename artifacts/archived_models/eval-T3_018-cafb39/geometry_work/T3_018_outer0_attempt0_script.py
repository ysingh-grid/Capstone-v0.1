import cadquery as cq

# --- PARAMETERS ---
thickness = 3.0
hub_size = 30.0
arm_length = 45.0
arm_width = 10.0
motor_mount_dia = 18.0
motor_mount_dist = 60.0
motor_hole_dia = 5.0
fc_pattern_size = 20.0
fc_hole_dia = 3.2

# --- GEOMETRY GENERATION ---

# 1. Create the 2D layout of the chassis using a Sketch.
# Sketch operations automatically merge overlapping geometries.
chassis_sketch = (
    cq.Sketch()
    .rect(hub_size, hub_size)  # Central hub
    .rect(2 * motor_mount_dist, arm_width)  # X-axis arms extending to ±60mm
    .rect(arm_width, 2 * motor_mount_dist)  # Y-axis arms extending to ±60mm
    # Add circular motor mounts at the end of each arm
    .push([
        (motor_mount_dist, 0),
        (-motor_mount_dist, 0),
        (0, motor_mount_dist),
        (0, -motor_mount_dist)
    ])
    .circle(motor_mount_dia / 2.0)
    .clean()
)

# 2. Extrude the sketch to create the solid body (Z = 0 to Z = 3)
result = cq.Workplane("XY").placeSketch(chassis_sketch).extrude(thickness)

# 3. Create motor shaft holes (5mm diameter)
# We define a cutting tool starting at Z = -1.0 with a height of thickness + 2.0
# to ensure a clean, manifold through-cut without coplanar face issues.
motor_hole_tool = (
    cq.Workplane("XY")
    .workplane(offset=-1.0)
    .pushPoints([
        (motor_mount_dist, 0),
        (-motor_mount_dist, 0),
        (0, motor_mount_dist),
        (0, -motor_mount_dist)
    ])
    .cylinder(thickness + 2.0, motor_hole_dia / 2.0, centered=False)
)
result = result.cut(motor_hole_tool)

# 4. Create Flight Controller (FC) mounting holes (3.2mm diameter, 20x20mm pattern)
half_fc = fc_pattern_size / 2.0
fc_points = [
    (half_fc, half_fc),
    (half_fc, -half_fc),
    (-half_fc, half_fc),
    (-half_fc, -half_fc)
]
fc_hole_tool = (
    cq.Workplane("XY")
    .workplane(offset=-1.0)
    .pushPoints(fc_points)
    .cylinder(thickness + 2.0, fc_hole_dia / 2.0, centered=False)
)
result = result.cut(fc_hole_tool)