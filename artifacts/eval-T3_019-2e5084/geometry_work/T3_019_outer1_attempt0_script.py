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

angles_deg = [45, 135, 225, 315]

# Motor mount center positions at 73mm from origin along 45-deg diagonals
mount_offset = arm_end * math.cos(math.radians(45))  # ~51.619mm

# --- Use single 2D sketch approach to avoid union issues ---
# Build everything as a 2D profile then extrude once

# Start with the hub circle
result = cq.Workplane("XY").circle(hub_radius)

# Add arm rectangles as 2D sketches
# Each arm: 55mm long x 10mm wide, center at 45.5mm from origin along its angle
arm_center_dist = (arm_start + arm_end) / 2.0  # 45.5mm

for angle_deg in angles_deg:
    angle_rad = math.radians(angle_deg)
    cx = arm_center_dist * math.cos(angle_rad)
    cy = arm_center_dist * math.sin(angle_rad)
    
    # Add a rotated rectangle for this arm
    # We use a transformed workplane at the arm center
    result = result.union(
        cq.Workplane("XY")
        .transformed(offset=(cx, cy, 0), rotate=(0, 0, angle_deg))
        .rect(arm_length, arm_width)
        .extrude(hub_thickness)
    )

# Add motor mount circles
for angle_deg in angles_deg:
    angle_rad = math.radians(angle_deg)
    cx = arm_end * math.cos(angle_rad)
    cy = arm_end * math.sin(angle_rad)
    
    result = result.union(
        cq.Workplane("XY")
        .transformed(offset=(cx, cy, 0))
        .circle(motor_mount_radius)
        .extrude(hub_thickness)
    )

# Extrude the hub (needs to be done after starting the sketch)
# Rebuild: start fresh with a cleaner approach
hub = (
    cq.Workplane("XY")
    .circle(hub_radius)
    .extrude(hub_thickness)
)

chassis = hub

# Add arms - build along X axis then rotate
for angle_deg in angles_deg:
    angle_rad = math.radians(angle_deg)
    cx = arm_center_dist * math.cos(angle_rad)
    cy = arm_center_dist * math.sin(angle_rad)
    
    # Build arm: along X direction (length=arm_length), width=arm_width, height=hub_thickness
    # centered=True for X and Y, but Z should start at 0
    arm = (
        cq.Workplane("XY")
        .transformed(offset=(cx, cy, 0), rotate=(0, 0, angle_deg))
        .rect(arm_length, arm_width)
        .extrude(hub_thickness)
    )
    
    chassis = chassis.union(arm)

# Add motor mounts
for angle_deg in angles_deg:
    angle_rad = math.radians(angle_deg)
    cx = arm_end * math.cos(angle_rad)
    cy = arm_end * math.sin(angle_rad)
    
    mount = (
        cq.Workplane("XY")
        .transformed(offset=(cx, cy, 0))
        .circle(motor_mount_radius)
        .extrude(hub_thickness)
    )
    
    chassis = chassis.union(mount)

# --- Cut motor shaft holes ---
motor_hole_points_xy = []
for angle_deg in angles_deg:
    angle_rad = math.radians(angle_deg)
    cx = arm_end * math.cos(angle_rad)
    cy = arm_end * math.sin(angle_rad)
    motor_hole_points_xy.append((cx, cy))

chassis = (
    chassis
    .faces(">Z")
    .workplane()
    .pushPoints(motor_hole_points_xy)
    .hole(motor_shaft_hole_dia)
)

# --- Cut M3 mounting holes in hub ---
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

result = chassis