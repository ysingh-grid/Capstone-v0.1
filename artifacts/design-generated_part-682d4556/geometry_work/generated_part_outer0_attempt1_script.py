import cadquery as cq

# Parametric Dimensions
shaft_total_length = 1500.0
sec1_len = 100.0
sec1_dia = 50.0
sec2_len = 80.0
sec2_dia = 55.0
sec3_len = 940.0
sec3_dia = 65.0
sec4_len = 80.0
sec4_dia = 55.0
sec5_len = 300.0
sec5_dia = 50.0

keyway_width = 14.0
keyway_depth = 5.5
keyway_len = 80.0

fillet_radius = 3.0

hub_od = 120.0
hub_thickness = 40.0

# Calculate transition points along X-axis
x0 = 0.0
x1 = sec1_len
x2 = x1 + sec2_len
x3 = x2 + sec3_len
x4 = x3 + sec4_len
x5 = x4 + sec5_len

# Radii of each section
r1 = sec1_dia / 2.0
r2 = sec2_dia / 2.0
r3 = sec3_dia / 2.0
r4 = sec4_dia / 2.0
r5 = sec5_dia / 2.0

# Create Shaft Profile
profile_pts = [
    (x0, 0.0),
    (x0, r1),
    (x1, r1),
    (x1, r2),
    (x2, r2),
    (x2, r3),
    (x3, r3),
    (x3, r4),
    (x4, r4),
    (x4, r5),
    (x5, r5),
    (x5, 0.0)
]

# Revolve profile to create stepped shaft
shaft = cq.Workplane("XY").polyline(profile_pts).close().revolve(360, (0, 0, 0), (1, 0, 0))

# Apply shoulder fillets safely
try:
    # Select inner circular step transition edges (excluding ends)
    shoulder_edges = shaft.edges("%Circle").filter(lambda e: (x0 + 5.0) < e.Center().x < (x5 - 5.0))
    shaft = shaft.fillet(fillet_radius, shoulder_edges)
except Exception:
    try:
        # Fallback to a slightly smaller fillet if geometric constraints fail
        shoulder_edges = shaft.edges("%Circle").filter(lambda e: (x0 + 5.0) < e.Center().x < (x5 - 5.0))
        shaft = shaft.fillet(2.0, shoulder_edges)
    except Exception:
        pass

# Cut Drive Section Keyway (Left End)
# Centered at X = 50 (from X=10 to 90), top surface is at Z = r1
key1_x_center = x0 + 10.0 + (keyway_len / 2.0)
key1_box = (
    cq.Workplane("XY")
    .workplane(offset=r1)
    .center(key1_x_center, 0.0)
    .box(keyway_len, keyway_width, keyway_depth * 2.0, centered=(True, True, True))
)
shaft = shaft.cut(key1_box)

# Cut Mixer Section Keyway (Right End)
# Centered at X = 1460 (from X=1420 to 1500), top surface is at Z = r5
key2_x_center = x5 - (keyway_len / 2.0)
key2_box = (
    cq.Workplane("XY")
    .workplane(offset=r5)
    .center(key2_x_center, 0.0)
    .box(keyway_len, keyway_width, keyway_depth * 2.0, centered=(True, True, True))
)
shaft = shaft.cut(key2_box)

# Create Helper Function for Pillow Block Bearings (UCP 211 simplified style)
def create_pillow_block(x_pos, journal_radius):
    shaft_center_height = 63.5
    base_thickness = 15.0
    block_width = 45.0
    block_length = 180.0
    
    # Base plate
    base = (
        cq.Workplane("XY")
        .workplane(offset=-shaft_center_height)
        .center(x_pos, 0.0)
        .box(block_width, block_length, base_thickness, centered=(True, True, False))
    )
    
    # Housing main body (central support block)
    middle = (
        cq.Workplane("XY")
        .workplane(offset=-shaft_center_height + base_thickness)
        .center(x_pos, 0.0)
        .box(block_width, 80.0, shaft_center_height - base_thickness, centered=(True, True, False))
    )
    
    # Outer bearing ring housing
    outer_ring = (
        cq.Workplane("YZ")
        .workplane(offset=x_pos)
        .circle(50.0)
        .circle(journal_radius)
        .extrude(block_width / 2.0, both=True)
    )
    
    # Combine components to form single bearing pillow block
    bearing = base.union(middle).union(outer_ring)
    return bearing

# Generate the two Bearing Supports
bearing1_x = (x1 + x2) / 2.0
bearing2_x = (x3 + x4) / 2.0

bearing1 = create_pillow_block(bearing1_x, r2)
bearing2 = create_pillow_block(bearing2_x, r4)

# Create Mixer Hub
# Placed at the absolute right end, from X = 1460 to 1500
hub_x_start = x5 - hub_thickness
hub_x_center = hub_x_start + (hub_thickness / 2.0)

hub = (
    cq.Workplane("YZ")
    .workplane(offset=hub_x_start)
    .circle(hub_od / 2.0)
    .circle(r5)
    .extrude(hub_thickness)
)

# Keyway cut inside the hub bore
hub_keyway_box = (
    cq.Workplane("XY")
    .workplane(offset=r5)
    .center(hub_x_center, 0.0)
    .box(hub_thickness, keyway_width, keyway_depth * 2.0, centered=(True, True, True))
)
hub = hub.cut(hub_keyway_box)

# Assemble all individual CAD components into one final assembly compound
result = cq.Compound.makeCompound([
    shaft.val(),
    bearing1.val(),
    bearing2.val(),
    hub.val()
])