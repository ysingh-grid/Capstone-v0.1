import cadquery as cq
import math

# --- Parametric Dimensions ---
# Flanges
flange_diameter = 50.0
flange_radius = flange_diameter / 2.0
bottom_flange_thickness = 10.0
top_flange_thickness = 10.0

# Hub
hub_diameter = 28.0
hub_radius = hub_diameter / 2.0
hub_length = 40.0

# Total length
total_length = 60.0

# Center bore
bore_diameter = 14.0
bore_radius = bore_diameter / 2.0  # 7.0

# Keyway
keyway_width = 5.0       # Y dimension
keyway_depth = 2.5       # radial depth in X
# Keyway center X interpretation: bore_radius - keyway_depth/2 = 7.0 - 1.25 = 5.75
# So keyway box spans X: 4.5 to 7.0, Y: -2.5 to +2.5, Z: 0 to 60
keyway_center_x = bore_radius - keyway_depth / 2.0  # 5.75

# Bolt holes
bolt_hole_diameter = 6.5
bolt_hole_radius = bolt_hole_diameter / 2.0
bolt_pcd_radius = 19.0  # 38mm PCD / 2
bolt_count = 6
bolt_angle_step = 60.0  # degrees

# --- Step 1: Build the main solid by unioning three coaxial cylinders ---
# Bottom flange: D=50, Z=0 to Z=10
bottom_flange = (
    cq.Workplane("XY")
    .workplane(offset=0)
    .circle(flange_radius)
    .extrude(bottom_flange_thickness)
)

# Hub: D=28, Z=10 to Z=50
hub = (
    cq.Workplane("XY")
    .workplane(offset=bottom_flange_thickness)
    .circle(hub_radius)
    .extrude(hub_length)
)

# Top flange: D=50, Z=50 to Z=60
top_flange = (
    cq.Workplane("XY")
    .workplane(offset=bottom_flange_thickness + hub_length)
    .circle(flange_radius)
    .extrude(top_flange_thickness)
)

# Union all three sections
coupling = bottom_flange.union(hub).union(top_flange)

# --- Step 2: Subtract the center bore (D=14, full length Z=0 to Z=60) ---
bore_tool = (
    cq.Workplane("XY")
    .workplane(offset=0)
    .circle(bore_radius)
    .extrude(total_length)
)

coupling = coupling.cut(bore_tool)

# --- Step 3: Subtract the keyway slot ---
# Keyway center at (keyway_center_x=5.75, 0), width in X = keyway_depth=2.5, width in Y = keyway_width=5.0
# X spans: 4.5 to 7.0 (cutting into bore wall on +X side)
# centered=(True, True, False) would center on X and Y, base at Z=0
keyway_tool = (
    cq.Workplane("XY")
    .workplane(offset=0)
    .center(keyway_center_x, 0)
    .box(keyway_depth, keyway_width, total_length, centered=(True, True, False))
)

coupling = coupling.cut(keyway_tool)

# --- Step 4: Subtract six bolt holes equally spaced on 38mm PCD ---
# Bolt holes at radius=19mm, angles 0, 60, 120, 180, 240, 300 degrees
# Full length Z=0 to Z=60
bolt_positions = []
for i in range(bolt_count):
    angle_deg = i * bolt_angle_step
    angle_rad = math.radians(angle_deg)
    bx = bolt_pcd_radius * math.cos(angle_rad)
    by = bolt_pcd_radius * math.sin(angle_rad)
    bolt_positions.append((bx, by))

# Create bolt hole cylinders and subtract them
for bx, by in bolt_positions:
    bolt_tool = (
        cq.Workplane("XY")
        .workplane(offset=0)
        .center(bx, by)
        .circle(bolt_hole_radius)
        .extrude(total_length)
    )
    coupling = coupling.cut(bolt_tool)

# --- Final result ---
result = coupling