import cadquery as cq

# --- PARAMETERS ---
thickness = 3.0                      # Thickness of the entire chassis (Z-axis)
hub_diameter = 36.0                  # Central hub disc diameter
hub_radius = hub_diameter / 2.0      # Central hub radius (18.0 mm)
arm_length = 55.0                    # Length of each arm
arm_width = 10.0                     # Width of each arm
motor_mount_diameter = 18.0          # Motor mount platform diameter
motor_mount_radius = motor_mount_diameter / 2.0 # (9.0 mm)
motor_shaft_hole_dia = 5.0           # Motor shaft hole diameter
hub_hole_dia = 3.2                   # M3 mounting hole diameter
hub_hole_pitch = 20.0                # Pitch of the square mounting hole pattern (20x20 mm)

# Derived dimensions for arm placement along +X axis
arm_center_x = hub_radius + (arm_length / 2.0)  # Center of rectangular arm along X (45.5 mm)
motor_center_x = hub_radius + arm_length        # Center of motor mount along X (73.0 mm)

# --- ARM UNIT CONSTRUCTION ---
# Create the rectangular arm segment along the +X axis
arm_rect = (
    cq.Workplane("XY")
    .rect(arm_length, arm_width)
    .extrude(thickness)
    .translate((arm_center_x, 0, 0))
)

# Create the circular motor mount platform
motor_mount = (
    cq.Workplane("XY")
    .circle(motor_mount_radius)
    .extrude(thickness)
    .translate((motor_center_x, 0, 0))
)

# Create the motor shaft hole cylinder to subtract
motor_hole = (
    cq.Workplane("XY")
    .circle(motor_shaft_hole_dia / 2.0)
    .extrude(thickness)
    .translate((motor_center_x, 0, 0))
)

# Combine arm and mount, then subtract the shaft hole to complete one arm unit
arm_unit = arm_rect.union(motor_mount).cut(motor_hole)

# --- HUB & CHASSIS ASSEMBLY ---
# Create the central hub disc
hub = cq.Workplane("XY").circle(hub_radius).extrude(thickness)

# Initialize the chassis assembly with the central hub
chassis = hub

# Rotate and union the arm unit at the four diagonal angles (45, 135, 225, 315 degrees)
angles = [45, 135, 225, 315]
for angle in angles:
    rotated_arm = arm_unit.rotate((0, 0, 0), (0, 0, 1), angle)
    chassis = chassis.union(rotated_arm)

# --- HUB MOUNTING HOLES ---
# Define the positions of the 4 mounting holes in a 20x20mm square pattern
half_pitch = hub_hole_pitch / 2.0
hole_positions = [
    (half_pitch, half_pitch),
    (-half_pitch, half_pitch),
    (-half_pitch, -half_pitch),
    (half_pitch, -half_pitch)
]

# Cut each mounting hole from the chassis assembly
for pos in hole_positions:
    hole_cyl = (
        cq.Workplane("XY")
        .circle(hub_hole_dia / 2.0)
        .extrude(thickness)
        .translate((pos[0], pos[1], 0))
    )
    chassis = chassis.cut(hole_cyl)

# Assign the final shape to result
result = chassis