import cadquery as cq

# --- Parametric Dimensions ---
hub_od = 30.0
hub_radius = hub_od / 2.0       # 15mm
hub_height = 12.0

bore_diameter = 14.0
bore_radius = bore_diameter / 2.0  # 7mm

rim_od = 100.0
rim_id = 88.0
rim_outer_radius = rim_od / 2.0   # 50mm
rim_inner_radius = rim_id / 2.0   # 44mm
rim_height = 8.0

spoke_width = 8.0
spoke_height = 8.0
spoke_length = rim_inner_radius - hub_radius  # 44 - 15 = 29mm
spoke_radial_center = hub_radius + spoke_length / 2.0  # 15 + 14.5 = 29.5mm

# Z center for spokes and rim (height=8, sitting on Z=0)
spoke_z_center = spoke_height / 2.0  # 4mm

# --- Hub cylinder: radius=15, height=12, centered at origin in XY, Z=0 to Z=12 ---
hub = (
    cq.Workplane("XY")
    .cylinder(hub_height, hub_radius, centered=(True, True, False))
)

# --- Outer rim: annular ring, OD=100, ID=88, height=8, Z=0 to Z=8 ---
# Build as outer cylinder minus inner cylinder
rim_outer = (
    cq.Workplane("XY")
    .cylinder(rim_height, rim_outer_radius, centered=(True, True, False))
)
rim_inner_cut = (
    cq.Workplane("XY")
    .cylinder(rim_height, rim_inner_radius, centered=(True, True, False))
)
rim = rim_outer.cut(rim_inner_cut)

# --- Spokes ---
# Spoke at 0 deg (along +X): length along X, width along Y, centered at (29.5, 0, 4)
spoke_0 = (
    cq.Workplane("XY")
    .center(spoke_radial_center, 0)
    .box(spoke_length, spoke_width, spoke_height,
         centered=(True, True, False))
)

# Spoke at 180 deg (along -X): centered at (-29.5, 0, 4)
spoke_180 = (
    cq.Workplane("XY")
    .center(-spoke_radial_center, 0)
    .box(spoke_length, spoke_width, spoke_height,
         centered=(True, True, False))
)

# Spoke at 90 deg (along +Y): length along Y, width along X, centered at (0, 29.5, 4)
spoke_90 = (
    cq.Workplane("XY")
    .center(0, spoke_radial_center)
    .box(spoke_width, spoke_length, spoke_height,
         centered=(True, True, False))
)

# Spoke at 270 deg (along -Y): centered at (0, -29.5, 4)
spoke_270 = (
    cq.Workplane("XY")
    .center(0, -spoke_radial_center)
    .box(spoke_width, spoke_length, spoke_height,
         centered=(True, True, False))
)

# --- Union all components ---
combined = (
    hub
    .union(rim)
    .union(spoke_0)
    .union(spoke_180)
    .union(spoke_90)
    .union(spoke_270)
)

# --- Cut center bore: 14mm diameter, full hub height, coaxial ---
bore_tool = (
    cq.Workplane("XY")
    .cylinder(hub_height, bore_radius, centered=(True, True, False))
)

result = combined.cut(bore_tool)