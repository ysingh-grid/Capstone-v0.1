import cadquery as cq
import math

# --- Parameters ---
# Shaft sections
lower_journal_d = 15.0
lower_journal_z_start = 0.0
lower_journal_z_end = 20.0

gear_seat_d = 20.0
gear_seat_z_start = 20.0
gear_seat_z_end = 35.0

upper_journal_d = 15.0
upper_journal_z_start = 35.0
upper_journal_z_end = 55.0

# Gear parameters
gear_tooth_count = 20
gear_tip_radius = 22.0
gear_root_radius = 18.0
gear_z_start = 20.0
gear_z_end = 35.0
gear_face_width = 15.0

# Bore parameters
bore_diameter = 8.0
bore_z_start = 0.0
bore_z_end = 55.0

# Keyway parameters
keyway_width_y = 3.0
keyway_inner_radius = 4.0   # bore radius
keyway_outer_radius = 7.0   # bore radius + depth
keyway_z_start = 20.0
keyway_z_end = 35.0

# --- Build lower journal cylinder ---
# Cylinder from Z=0 to Z=20, diameter=15mm
lower_journal = (
    cq.Workplane("XY")
    .workplane(offset=lower_journal_z_start)
    .circle(lower_journal_d / 2.0)
    .extrude(lower_journal_z_end - lower_journal_z_start)
)

# --- Build middle gear seat cylinder ---
# Cylinder from Z=20 to Z=35, diameter=20mm
gear_seat = (
    cq.Workplane("XY")
    .workplane(offset=gear_seat_z_start)
    .circle(gear_seat_d / 2.0)
    .extrude(gear_seat_z_end - gear_seat_z_start)
)

# --- Build upper journal cylinder ---
# Cylinder from Z=35 to Z=55, diameter=15mm
upper_journal = (
    cq.Workplane("XY")
    .workplane(offset=upper_journal_z_start)
    .circle(upper_journal_d / 2.0)
    .extrude(upper_journal_z_end - upper_journal_z_start)
)

# --- Build spur gear tooth profile ---
# Star-polygon: 40 vertices alternating tip (R=22) and root (R=18) at 9-degree intervals
# First vertex at angle=0 (along +X) at tip radius
num_vertices = gear_tooth_count * 2  # 40 vertices
angle_step = 360.0 / num_vertices     # 9 degrees per vertex

gear_pts = []
for i in range(num_vertices):
    angle_deg = i * angle_step
    angle_rad = math.radians(angle_deg)
    # Even indices: tip radius, odd indices: root radius
    if i % 2 == 0:
        r = gear_tip_radius
    else:
        r = gear_root_radius
    x = r * math.cos(angle_rad)
    y = r * math.sin(angle_rad)
    gear_pts.append((x, y))

# Close the polygon by appending first point
gear_pts.append(gear_pts[0])

# Extrude the gear tooth profile from Z=20 to Z=35
gear_teeth = (
    cq.Workplane("XY")
    .workplane(offset=gear_z_start)
    .polyline(gear_pts)
    .close()
    .extrude(gear_face_width)
)

# --- Union all shaft sections and gear teeth ---
shaft = lower_journal.union(gear_seat).union(upper_journal).union(gear_teeth)

# --- Subtract through bore ---
# Bore: diameter=8mm, full length Z=0 to Z=55
bore = (
    cq.Workplane("XY")
    .workplane(offset=bore_z_start)
    .circle(bore_diameter / 2.0)
    .extrude(bore_z_end - bore_z_start)
)

shaft = shaft.cut(bore)

# --- Subtract keyway slot ---
# Keyway: box from X=+4 to X=+7 (radial), Y=-1.5 to Y=+1.5, Z=20 to Z=35
# Width in X: keyway_outer_radius - keyway_inner_radius = 3mm
# Width in Y: keyway_width_y = 3mm
# Centered in X at (keyway_inner_radius + keyway_outer_radius) / 2 = 5.5mm
keyway_x_center = (keyway_inner_radius + keyway_outer_radius) / 2.0  # 5.5mm
keyway_x_width = keyway_outer_radius - keyway_inner_radius            # 3mm
keyway_z_center = (keyway_z_start + keyway_z_end) / 2.0              # 27.5mm
keyway_z_height = keyway_z_end - keyway_z_start                      # 15mm

keyway = (
    cq.Workplane("XY")
    .center(keyway_x_center, 0.0)
    .workplane(offset=keyway_z_start)
    .box(
        keyway_x_width,
        keyway_width_y,
        keyway_z_height,
        centered=(True, True, False)
    )
)

shaft = shaft.cut(keyway)

# --- Final result ---
result = shaft