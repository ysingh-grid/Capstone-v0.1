import cadquery as cq

# ================== PARAMETERS ==================
# Pulley overall dimensions
bore_diameter = 12.0
bore_radius = bore_diameter / 2.0  # 6.0 mm
outer_diameter = 60.0
outer_radius = outer_diameter / 2.0  # 30.0 mm
pulley_width = 20.0  # Total height along Z

# V-groove profile dimensions
groove_root_diameter = 40.0
groove_root_radius = groove_root_diameter / 2.0  # 20.0 mm
groove_root_z = 10.0  # Z height of the V-groove root
flange_bottom_z = 5.0
flange_top_z = 15.0

# Keyway dimensions
keyway_width = 4.0
keyway_depth = 2.5  # Depth from the bore surface (X=6.0 to X=8.5)

# ================== SOLID GENERATION ==================

# 1. Create the pulley body profile in the XZ plane (X=radial, Z=height)
# and revolve it around the Z-axis (local Y-axis of the XZ workplane).
pulley_body = (
    cq.Workplane("XZ")
    .moveTo(bore_radius, 0.0)
    .lineTo(outer_radius, 0.0)
    .lineTo(outer_radius, flange_bottom_z)
    .lineTo(groove_root_radius, groove_root_z)
    .lineTo(outer_radius, flange_top_z)
    .lineTo(outer_radius, pulley_width)
    .lineTo(bore_radius, pulley_width)
    .close()
    .revolve(360, (0, 0, 0), (0, 1, 0))
)

# 2. Define the keyway cutter on the XY plane
# The keyway starts at the bore (X=6.0) and extends 2.5mm radially (to X=8.5).
# Its width along Y is 4.0mm (from Y=-2.0 to Y=2.0).
keyway_x_center = bore_radius + (keyway_depth / 2.0)  # 6.0 + 1.25 = 7.25

keyway_cutter = (
    cq.Workplane("XY")
    .center(keyway_x_center, 0.0)
    .rect(keyway_depth, keyway_width)
    .extrude(pulley_width)
)

# 3. Cut the keyway from the main pulley body
result = pulley_body.cut(keyway_cutter)