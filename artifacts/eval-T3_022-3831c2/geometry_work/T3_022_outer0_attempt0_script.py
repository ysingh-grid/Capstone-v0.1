import cadquery as cq

# --- Parametric Dimensions ---
hub_od = 30.0
hub_radius = hub_od / 2.0       # 15mm
hub_height = 12.0

bore_diameter = 14.0
bore_radius = bore_diameter / 2.0  # 7mm

rim_od = 100.0
rim_id = 88.0
rim_outer_radius = rim_od / 2.0    # 50mm
rim_inner_radius = rim_id / 2.0    # 44mm
rim_height = 8.0

spoke_width = 8.0
spoke_height = 8.0
spoke_length = 29.0               # bridges from r=15 to r=44 (44-15=29)
spoke_radial_center = 29.5        # center of spoke along radial direction

# --- Hub: solid cylinder, radius=15, height=12, centered at origin ---
hub = (
    cq.Workplane("XY")
    .cylinder(hub_height, hub_radius, centered=(True, True, False))
)

# --- Outer Rim: ring (outer cylinder minus inner cylinder), height=8 ---
rim_outer = (
    cq.Workplane("XY")
    .cylinder(rim_height, rim_outer_radius, centered=(True, True, False))
)
rim_inner = (
    cq.Workplane("XY")
    .cylinder(rim_height, rim_inner_radius, centered=(True, True, False))
)
rim = rim_outer.cut(rim_inner)

# --- Spokes: four rectangular bars at 0, 90, 180, 270 degrees ---
# Spoke centers are at Z=4 (half of 8mm height), since centered=(True,True,False)
# places them from Z=0 to Z=8, and we want center in XY at spoke_radial_center from origin.

# Spoke along +X / -X (0 and 180 deg): length along X, width along Y
# Box centered=(True, True, False) => centered in X and Y, base at Z=0
spoke_x_pos = (
    cq.Workplane("XY")
    .center(spoke_radial_center, 0)
    .box(spoke_length, spoke_width, spoke_height, centered=(True, True, False))
)

spoke_x_neg = (
    cq.Workplane("XY")
    .center(-spoke_radial_center, 0)
    .box(spoke_length, spoke_width, spoke_height, centered=(True, True, False))
)

# Spoke along +Y / -Y (90 and 270 deg): length along Y, width along X
spoke_y_pos = (
    cq.Workplane("XY")
    .center(0, spoke_radial_center)
    .box(spoke_width, spoke_length, spoke_height, centered=(True, True, False))
)

spoke_y_neg = (
    cq.Workplane("XY")
    .center(0, -spoke_radial_center)
    .box(spoke_width, spoke_length, spoke_height, centered=(True, True, False))
)

# --- Union all components ---
handwheel = (
    hub
    .union(rim)
    .union(spoke_x_pos)
    .union(spoke_x_neg)
    .union(spoke_y_pos)
    .union(spoke_y_neg)
)

# --- Subtract center bore: 14mm diameter through full hub height ---
bore = (
    cq.Workplane("XY")
    .cylinder(hub_height, bore_radius, centered=(True, True, False))
)

result = handwheel.cut(bore)