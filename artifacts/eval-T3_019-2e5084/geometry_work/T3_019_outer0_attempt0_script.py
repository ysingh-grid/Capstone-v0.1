import cadquery as cq
import math

# --- Parameters ---
hub_diameter = 36.0
hub_radius = hub_diameter / 2.0  # 18mm
hub_thickness = 3.0

arm_length = 55.0
arm_width = 10.0
arm_start = 18.0   # from center (hub edge)
arm_end = 73.0     # from center

motor_mount_diameter = 18.0
motor_mount_radius = motor_mount_diameter / 2.0
motor_shaft_hole_dia = 5.0

m3_hole_dia = 3.2
m3_pattern_half = 10.0  # half-spacing for 20x20mm pattern

# Motor mount center positions at 73mm from origin along 45-deg diagonals
mount_offset = arm_end * math.cos(math.radians(45))  # ~51.619mm

angles_deg = [45, 135, 225, 315]

# --- Build central hub disc ---
hub = (
    cq.Workplane("XY")
    .circle(hub_radius)
    .extrude(hub_thickness)
)

# --- Build each arm as a rotated box, unioned into the chassis ---
# Each arm is 55mm long x 10mm wide x 3mm thick
# Arm rectangle is centered along its diagonal direction
# Center of arm along diagonal = (arm_start + arm_end) / 2 = (18 + 73) / 2 = 45.5mm from origin
arm_center_dist = (arm_start + arm_end) / 2.0  # 45.5mm

chassis = hub

for angle_deg in angles_deg:
    angle_rad = math.radians(angle_deg)
    # Center of arm in XY
    cx = arm_center_dist * math.cos(angle_rad)
    cy = arm_center_dist * math.sin(angle_rad)

    # Build arm box centered at origin, then translate and rotate
    # Arm: length along X = arm_length, width along Y = arm_width, height = hub_thickness
    arm = (
        cq.Workplane("XY")
        .box(arm_length, arm_width, hub_thickness, centered=(True, True, True))
        .translate((cx, cy, 0))
    )

    # Rotate around Z axis about origin by angle_deg
    arm = arm.rotate((0, 0, 0), (0, 0, 1), angle_deg)

    chassis = chassis.union(arm)

# --- Build motor mount platforms and union them ---
for angle_deg in angles_deg:
    angle_rad = math.radians(angle_deg)
    mx = mount_offset * math.cos(math.radians(45)) if angle_deg == 45 else None

    # Compute center precisely
    cx = arm_end * math.cos(angle_rad)
    cy = arm_end * math.sin(angle_rad)

    mount = (
        cq.Workplane("XY")
        .circle(motor_mount_radius)
        .extrude(hub_thickness)
        .translate((cx, cy, 0))
    )

    chassis = chassis.union(mount)

# --- Cut motor shaft holes through each mount ---
# Collect all motor mount hole positions
motor_hole_points_xy = []
for angle_deg in angles_deg:
    angle_rad = math.radians(angle_deg)
    cx = arm_end * math.cos(angle_rad)
    cy = arm_end * math.sin(angle_rad)
    motor_hole_points_xy.append((cx, cy))

# Cut motor shaft holes using pushPoints on the top face workplane
chassis = (
    chassis
    .faces(">Z")
    .workplane()
    .pushPoints(motor_hole_points_xy)
    .hole(motor_shaft_hole_dia)
)

# --- Cut M3 mounting holes in hub (20mm x 20mm square pattern) ---
m3_points = [
    ( m3_pattern_half,  m3_pattern_half),
    (-m3_pattern_half,  m3_pattern_half),
    (-m3_pattern_half, -m3_pattern_half),
    ( m3_pattern_half, -m3_pattern_half),
]

chassis = (
    chassis
    .faces(">Z")
    .workplane()
    .pushPoints(m3_points)
    .hole(m3_hole_dia)
)

# --- Move everything so bottom face sits at Z=0 (hub was centered at Z=0 by default box) ---
# hub was extruded from Z=0 to Z=3 (since box is centered, it goes -1.5 to +1.5)
# We need Z=0 to Z=3, so translate up by hub_thickness/2
chassis = chassis.translate((0, 0, hub_thickness / 2.0))

result = chassis