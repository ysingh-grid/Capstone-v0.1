import math
import cadquery as cq

# --- Parametric Variables ---
chassis_thickness = 3.0
hub_diameter = 36.0
hub_radius = hub_diameter / 2.0
arm_length = 55.0
arm_width = 10.0
motor_mount_diameter = 18.0
motor_mount_radius = motor_mount_diameter / 2.0
motor_mount_distance = 73.0  # Center of motor mount from origin
motor_shaft_hole_dia = 5.0
hub_hole_dia = 3.2
hub_hole_spacing = 20.0

# Start with the central hub disc
result = cq.Workplane("XY").circle(hub_radius).extrude(chassis_thickness)

# Add each arm and its corresponding motor mount platform
for angle in [45, 135, 225, 315]:
    # Calculate local center of the arm along the diagonal direction
    arm_center_dist = hub_radius + arm_length / 2.0
    
    # Generate the arm
    arm = (
        cq.Workplane("XY")
        .transformed(rotate=(0, 0, angle))
        .center(arm_center_dist, 0)
        .rect(arm_length, arm_width)
        .extrude(chassis_thickness)
    )
    
    # Generate the circular motor mount platform
    mount = (
        cq.Workplane("XY")
        .transformed(rotate=(0, 0, angle))
        .center(motor_mount_distance, 0)
        .circle(motor_mount_radius)
        .extrude(chassis_thickness)
    )
    
    # Union both components with the main chassis body
    result = result.union(arm).union(mount)

# Define central M3 mounting holes pattern (20x20mm square)
half_space = hub_hole_spacing / 2.0
central_holes = [
    (half_space, half_space),
    (-half_space, half_space),
    (-half_space, -half_space),
    (half_space, -half_space)
]

# Define motor shaft holes pattern using polar trigonometry
motor_holes = []
for angle in [45, 135, 225, 315]:
    rad = math.radians(angle)
    motor_holes.append((motor_mount_distance * math.cos(rad), motor_mount_distance * math.sin(rad)))

# Drill central mounting holes through the chassis
result = result.faces(">Z").workplane().pushPoints(central_holes).hole(hub_hole_dia)

# Drill motor shaft holes through the motor mount platforms
result = result.faces(">Z").workplane().pushPoints(motor_holes).hole(motor_shaft_hole_dia)