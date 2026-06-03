import math
import cadquery as cq

# Parametric variables
num_teeth = 20
tip_diameter = 48.0
root_diameter = 40.0
tip_radius = tip_diameter / 2.0
root_radius = root_diameter / 2.0
gear_thickness = 10.0

hub_diameter = 16.0
hub_height = 30.0

bore_diameter = 10.0
keyway_width = 4.0
keyway_depth = 2.5  # depth from bore surface (5.0mm radius to 7.5mm radius)

set_screw_diameter = 4.0
set_screw_z = 20.0

# 1. Generate the star-polygon tooth profile points
pts = []
num_vertices = num_teeth * 2
for i in range(num_vertices):
    angle = i * (2 * math.pi / num_vertices)
    r = tip_radius if (i % 2 == 0) else root_radius
    x = r * math.cos(angle)
    y = r * math.sin(angle)
    pts.append((x, y))

# Create the gear body by extruding the star-polygon profile
gear_body = cq.Workplane("XY").polyline(pts).close().extrude(gear_thickness)

# 2. Create the extended hub
hub = cq.Workplane("XY").circle(hub_diameter / 2.0).extrude(hub_height)

# Combine gear and hub
combined_body = gear_body.union(hub)

# 3. Create the central bore
bore = cq.Workplane("XY").circle(bore_diameter / 2.0).extrude(hub_height)

# 4. Create the keyway slot
# Since bore radius is 5.0, keyway depth of 2.5 means it extends to X = 7.5
# We create a rectangle from X=0 to X=7.5, and Y from -2.0 to 2.0
keyway = (
    cq.Workplane("XY")
    .rect(bore_diameter / 2.0 + keyway_depth, keyway_width, centered=False)
    .extrude(hub_height)
    .translate((0, -keyway_width / 2.0, 0))
)

# 5. Create the radial set screw hole along the X-axis at Z=20
# We use the YZ plane, offset to X=-20, and extrude 40mm to cross the entire hub
set_screw_hole = (
    cq.Workplane("YZ")
    .workplane(offset=-20.0)
    .center(0.0, set_screw_z)
    .circle(set_screw_diameter / 2.0)
    .extrude(40.0)
)

# Subtract cuts from the combined body to get the final part
result = combined_body.cut(bore).cut(keyway).cut(set_screw_hole)