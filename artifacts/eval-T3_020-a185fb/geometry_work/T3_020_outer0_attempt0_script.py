import cadquery as cq

# --- Parametric Dimensions ---
rail_length_x = 160.0
rail_width_y = 12.0
rail_thickness_z = 3.0
rail_left_center_y = -30.0
rail_right_center_y = 30.0

center_plate_length_x = 50.0
center_plate_width_y = 72.0
center_plate_thickness_z = 3.0

motor_mount_diameter = 22.0
motor_mount_radius = motor_mount_diameter / 2.0
motor_mount_thickness_z = 3.0
motor_mount_pos_x = 80.0
motor_mount_pos_y = 30.0

motor_shaft_hole_dia = 5.0
m3_hole_dia = 3.2
m3_hole_offset_x = 10.0
m3_hole_offset_y = 10.0

# All geometry sits at Z=0 to Z=3, centered in Z at 1.5
z_center = rail_thickness_z / 2.0  # 1.5mm

# --- Left Side Rail (Y=-30) ---
left_rail = (
    cq.Workplane("XY")
    .transformed(offset=(0, rail_left_center_y, z_center))
    .box(rail_length_x, rail_width_y, rail_thickness_z, centered=(True, True, True))
)

# --- Right Side Rail (Y=+30) ---
right_rail = (
    cq.Workplane("XY")
    .transformed(offset=(0, rail_right_center_y, z_center))
    .box(rail_length_x, rail_width_y, rail_thickness_z, centered=(True, True, True))
)

# --- Center Plate (bridging both rails, centered at origin) ---
center_plate = (
    cq.Workplane("XY")
    .transformed(offset=(0, 0, z_center))
    .box(center_plate_length_x, center_plate_width_y, center_plate_thickness_z, centered=(True, True, True))
)

# --- Motor Mounts (circular discs at four corners) ---
# Front-right: (+80, +30)
mount_fr = (
    cq.Workplane("XY")
    .transformed(offset=(motor_mount_pos_x, motor_mount_pos_y, z_center))
    .cylinder(motor_mount_thickness_z, motor_mount_radius, centered=(True, True, True))
)

# Front-left: (+80, -30)
mount_fl = (
    cq.Workplane("XY")
    .transformed(offset=(motor_mount_pos_x, -motor_mount_pos_y, z_center))
    .cylinder(motor_mount_thickness_z, motor_mount_radius, centered=(True, True, True))
)

# Rear-right: (-80, +30)
mount_rr = (
    cq.Workplane("XY")
    .transformed(offset=(-motor_mount_pos_x, motor_mount_pos_y, z_center))
    .cylinder(motor_mount_thickness_z, motor_mount_radius, centered=(True, True, True))
)

# Rear-left: (-80, -30)
mount_rl = (
    cq.Workplane("XY")
    .transformed(offset=(-motor_mount_pos_x, -motor_mount_pos_y, z_center))
    .cylinder(motor_mount_thickness_z, motor_mount_radius, centered=(True, True, True))
)

# --- Boolean Union of all solid bodies ---
frame = (
    left_rail
    .union(right_rail)
    .union(center_plate)
    .union(mount_fr)
    .union(mount_fl)
    .union(mount_rr)
    .union(mount_rl)
)

# --- Drill Motor Shaft Holes (5mm dia, through each motor mount) ---
# Use pushPoints on top face workplane for all 4 motor shaft hole positions
motor_hole_positions = [
    (motor_mount_pos_x,  motor_mount_pos_y),
    (motor_mount_pos_x, -motor_mount_pos_y),
    (-motor_mount_pos_x,  motor_mount_pos_y),
    (-motor_mount_pos_x, -motor_mount_pos_y),
]

# Create motor shaft hole cylinders and subtract
for (hx, hy) in motor_hole_positions:
    hole_cyl = (
        cq.Workplane("XY")
        .transformed(offset=(hx, hy, z_center))
        .cylinder(rail_thickness_z + 0.1, motor_shaft_hole_dia / 2.0, centered=(True, True, True))
    )
    frame = frame.cut(hole_cyl)

# --- Drill M3 Mounting Holes (3.2mm dia, through center plate) ---
m3_hole_positions = [
    ( m3_hole_offset_x,  m3_hole_offset_y),
    ( m3_hole_offset_x, -m3_hole_offset_y),
    (-m3_hole_offset_x,  m3_hole_offset_y),
    (-m3_hole_offset_x, -m3_hole_offset_y),
]

for (hx, hy) in m3_hole_positions:
    hole_cyl = (
        cq.Workplane("XY")
        .transformed(offset=(hx, hy, z_center))
        .cylinder(rail_thickness_z + 0.1, m3_hole_dia / 2.0, centered=(True, True, True))
    )
    frame = frame.cut(hole_cyl)

# --- Assign final result ---
result = frame