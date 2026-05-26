import math
import cadquery as cq

# --- PARAMETERS ---
num_teeth = 20
tip_radius = 24.0
root_radius = 20.0
gear_thickness = 10.0

hub_radius = 8.0
hub_length = 30.0

bore_radius = 5.0
keyway_width = 4.0
keyway_depth = 2.5

set_screw_dia = 4.0
set_screw_z = 20.0

# --- GEAR BODY ---
# Generate star polygon points for the teeth
pts = []
for i in range(2 * num_teeth):
    angle = i * (math.pi / num_teeth)
    r = tip_radius if (i % 2 == 0) else root_radius
    x = r * math.cos(angle)
    y = r * math.sin(angle)
    pts.append((x, y))

# Create gear profile and extrude it from Z=0 to Z=10
gear_body = (
    cq.Workplane("XY")
    .polyline(pts)
    .close()
    .extrude(gear_thickness)
)

# --- HUB ---
# Create hub extending from Z=0 to Z=30
hub = (
    cq.Workplane("XY")
    .circle(hub_radius)
    .extrude(hub_length)
)

# Combine gear body and hub
gear_system = gear_body.union(hub)

# --- BORE AND KEYWAY ---
# Create the central bore through the entire length
gear_system = (
    gear_system
    .faces(">Z")
    .workplane()
    .circle(bore_radius)
    .cutThruAll()
)

# Create the keyway tool
# Located on the +X side, from X = bore_radius to X = bore_radius + keyway_depth
keyway_center_x = bore_radius + (keyway_depth / 2.0)
keyway_tool = (
    cq.Workplane("XY")
    .workplane(offset=-1.0)  # offset slightly below bottom face to ensure a clean cut
    .center(keyway_center_x, 0.0)
    .rect(keyway_depth, keyway_width)
    .extrude(hub_length + 2.0)
)

# Subtract keyway
gear_system = gear_system.cut(keyway_tool)

# --- SET SCREW HOLE ---
# Create the set screw hole tool oriented along X-axis at Z = 20.0
# We start from X = -15.0 and extrude 30.0 mm along global +X (local Z of YZ workplane)
set_screw_tool = (
    cq.Workplane("YZ")
    .workplane(offset=-15.0)
    .center(0.0, set_screw_z)
    .circle(set_screw_dia / 2.0)
    .extrude(30.0)
)

# Subtract the set screw hole
result = gear_system.cut(set_screw_tool)