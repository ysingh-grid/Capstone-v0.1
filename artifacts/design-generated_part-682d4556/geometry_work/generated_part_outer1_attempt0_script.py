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

# Revolve profile to create stepped shaft (using standard revolve along X-axis)
shaft = cq.Workplane("XY").polyline(profile_pts).close().revolve(360, (0, 0, 0), (1, 0, 0))

# Apply shoulder fillets safely using custom Selector to avoid Workplane filter attribute crash
transition_xs = [x1, x2, x3, x4]
edges_to_fillet = []
for edge in shaft.edges("%Circle").vals():
    try:
        cx = edge.Center().x
        if any(abs(cx - tx) < 0.5 for tx in transition_xs):
            edges_to_fillet.append(edge)
    except Exception:
        pass

class TransitionSelector(cq.Selector):
    def __init__(self, edges):
        self.edges = edges
    def filter(self, objectList):
        res = []
        target_centers = [e.Center() for e in self.edges]
        for obj in objectList:
            try:
                obj_center = obj.Center()
                if any(obj_center.sub(tc).Length < 0.1 for tc in target_centers):
                    res.append(obj)
            except Exception:
                pass
        return res

if edges_to_fillet:
    try:
        shaft = shaft.fillet(fillet_radius, TransitionSelector(edges_to_fillet))
    except Exception:
        try:
            # Fallback
            shaft = shaft.fillet(2.0, TransitionSelector(edges_to_fillet))
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

# Create Pillow Block Bearings (UCP 211 simplified style)
def create_pillow_block(x_pos, journal_radius):
    # We step down X-widths slightly to avoid coplanar face union issues
    # Base plate
    base = (
        cq.Workplane("XY")
        .workplane(offset=-63.5)
        .center(x_pos, 0.0)
        .box(45.0, 180.0, 15.0, centered=(True, True, False))
    )
    
    # Housing main body
    body = (
        cq.Workplane("XY")
        .workplane(offset=-48.5)
        .center(x_pos, 0.0)
        .box(44.8, 80.0, 48.5, centered=(True, True, False))
    )
    
    # Outer bearing ring housing
    ring = (
        cq.Workplane("YZ")
        .workplane(offset=x_pos)
        .circle(50.0)
        .extrude(44.6, centered=True)
    )
    
    # Combine base, body, and ring (safely stepped in X-width to prevent coplanar crashes)
    block = base.union(body).union(ring)
    
    # Cut inner journal bore through
    bore = (
        cq.Workplane("YZ")
        .workplane(offset=x_pos)
        .circle(journal_radius)
        .extrude(50.0, centered=True)
    )
    
    return block.cut(bore)

# Generate Bearings at support centers
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

# Use Assembly to prevent makeCompound crash
result = cq.Assembly()
result.add(shaft, name="shaft", color=cq.Color("lightgray"))
result.add(bearing1, name="bearing1", color=cq.Color("darkgray"))
result.add(bearing2, name="bearing2", color=cq.Color("darkgray"))
result.add(hub, name="hub", color=cq.Color("blue"))