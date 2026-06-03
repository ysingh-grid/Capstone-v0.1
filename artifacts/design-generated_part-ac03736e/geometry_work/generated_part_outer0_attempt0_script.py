import cadquery as cq

# Parametric Dimensions (AISI 1045 Steel Shaft Assembly)
total_shaft_length = 1500.0
drive_section_diameter = 50.0
drive_section_length = 100.0

bearing_journal_1_diameter = 55.0
bearing_journal_1_length = 80.0

main_span_diameter = 65.0
main_span_length = 940.0

bearing_journal_2_diameter = 55.0
bearing_journal_2_length = 80.0

overhung_section_diameter = 50.0
overhung_section_length = 300.0

transition_fillet_radius = 3.0

# Keyway Dimensions
keyway_width = 14.0
keyway_depth = 5.5
keyway_length = 80.0

# Mixer Hub Dimensions
mixer_hub_od = 120.0
mixer_hub_thickness = 40.0
mixer_hub_bore_diameter = 50.0

# 1. Build the Stepped Shaft Sections along X-axis
c1 = cq.Workplane("YZ").circle(drive_section_diameter / 2.0).extrude(drive_section_length)

c2 = (
    cq.Workplane("YZ")
    .workplane(offset=drive_section_length)
    .circle(bearing_journal_1_diameter / 2.0)
    .extrude(bearing_journal_1_length)
)

c3 = (
    cq.Workplane("YZ")
    .workplane(offset=drive_section_length + bearing_journal_1_length)
    .circle(main_span_diameter / 2.0)
    .extrude(main_span_length)
)

c4 = (
    cq.Workplane("YZ")
    .workplane(offset=drive_section_length + bearing_journal_1_length + main_span_length)
    .circle(bearing_journal_2_diameter / 2.0)
    .extrude(bearing_journal_2_length)
)

c5 = (
    cq.Workplane("YZ")
    .workplane(offset=drive_section_length + bearing_journal_1_length + main_span_length + bearing_journal_2_length)
    .circle(overhung_section_diameter / 2.0)
    .extrude(overhung_section_length)
)

# Union all shaft segments
shaft = c1.union(c2).union(c3).union(c4).union(c5)

# 2. Apply transition fillets safely using a robust fallback mechanism
transitions = [
    drive_section_length,
    drive_section_length + bearing_journal_1_length,
    drive_section_length + bearing_journal_1_length + main_span_length,
    drive_section_length + bearing_journal_1_length + main_span_length + bearing_journal_2_length
]

for x_val in transitions:
    try:
        # Find circular edges at this X transition
        edges_at_x = shaft.edges("%Circle").filter(lambda e: abs(e.Center().x - x_val) < 0.1).vals()
        if edges_at_x:
            # Sort by radius (circumference) to get the smaller (reentrant) edge
            edges_at_x_sorted = sorted(edges_at_x, key=lambda e: e.Length())
            reentrant_edge = edges_at_x_sorted[0]
            shaft = cq.Workplane(obj=shaft).newObject([reentrant_edge]).fillet(transition_fillet_radius)
    except Exception:
        try:
            # Fallback to smaller fillet if geometric constraints occur (e.g. 2.5mm step)
            edges_at_x_sorted = sorted(edges_at_x, key=lambda e: e.Length())
            reentrant_edge = edges_at_x_sorted[0]
            shaft = cq.Workplane(obj=shaft).newObject([reentrant_edge]).fillet(2.0)
        except Exception:
            pass

# 3. Cut Keyway at Drive/Input End (Left End)
# Centered at Y=0, X starting at 10mm to 90mm (80mm length)
keyway_left_center_x = 10.0 + (keyway_length / 2.0)
keyway_left = (
    cq.Workplane("XY")
    .workplane(offset=drive_section_diameter / 2.0)
    .center(keyway_left_center_x, 0.0)
    .rect(keyway_length, keyway_width)
    .extrude(-keyway_depth)
)
try:
    keyway_left = keyway_left.edges("|Z").fillet(keyway_width / 2.0 - 0.01)
except Exception:
    pass

# 4. Cut Keyway at Overhung End for Mixer Hub (Right End)
# Shaft ends at 1500mm. Hub fits from 1460mm to 1500mm. Keyway is from 1450mm to 1495mm.
right_keyway_length = 45.0
keyway_right_center_x = total_shaft_length - 5.0 - (right_keyway_length / 2.0)
keyway_right = (
    cq.Workplane("XY")
    .workplane(offset=overhung_section_diameter / 2.0)
    .center(keyway_right_center_x, 0.0)
    .rect(right_keyway_length, keyway_width)
    .extrude(-keyway_depth)
)
try:
    keyway_right = keyway_right.edges("|Z").fillet(keyway_width / 2.0 - 0.01)
except Exception:
    pass

# Subtract keyways from shaft
shaft = shaft.cut(keyway_left).cut(keyway_right)

# 5. Apply Chamfers to Shaft Ends
try:
    shaft_ends = shaft.edges("%Circle").filter(lambda e: abs(e.Center().x - 0.0) < 0.1 or abs(e.Center().x - total_shaft_length) < 0.1)
    shaft = cq.Workplane(obj=shaft).newObject(shaft_ends.vals()).chamfer(1.5)
except Exception:
    pass


# 6. Build the Mixer Hub
hub_start_x = total_shaft_length - mixer_hub_thickness
hub_center_x = hub_start_x + (mixer_hub_thickness / 2.0)

# Main cylindrical body of the Hub
hub = (
    cq.Workplane("YZ")
    .workplane(offset=hub_start_x)
    .circle(mixer_hub_od / 2.0)
    .extrude(mixer_hub_thickness)
)

# Clearance tool for Hub Bore
bore_tool = (
    cq.Workplane("YZ")
    .workplane(offset=hub_start_x - 5.0)
    .circle(mixer_hub_bore_diameter / 2.0)
    .extrude(mixer_hub_thickness + 10.0)
)

# Hub Internal Keyway Tool (extrude up into the hub)
hub_keyway_tool = (
    cq.Workplane("XY")
    .workplane(offset=mixer_hub_bore_diameter / 2.0)
    .center(hub_center_x, 0.0)
    .rect(mixer_hub_thickness + 10.0, keyway_width)
    .extrude(keyway_depth)
)

# Cut Bore and Keyway
hub = hub.cut(bore_tool).cut(hub_keyway_tool)

# Apply Outer Chamfers to the Hub
try:
    hub_outer_edges = hub.edges("%Circle").filter(lambda e: abs(e.Center().x - hub_start_x) < 0.1 or abs(e.Center().x - total_shaft_length) < 0.1)
    hub_outer_edges = hub_outer_edges.filter(lambda e: e.Length() > (mixer_hub_od * 3.0))
    hub = cq.Workplane(obj=hub).newObject(hub_outer_edges.vals()).chamfer(2.0)
except Exception:
    pass


# 7. Final Assembly Union
result = shaft.union(hub)