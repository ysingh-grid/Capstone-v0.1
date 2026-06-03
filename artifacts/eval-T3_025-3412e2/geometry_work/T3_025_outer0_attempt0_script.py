import math
import cadquery as cq

# ================== PARAMETERS ==================
flange_diameter = 50.0
flange_thickness = 10.0
hub_diameter = 28.0
hub_length = 40.0
total_length = 60.0

bore_diameter = 14.0
bore_radius = bore_diameter / 2.0

keyway_width = 5.0  # along Y
keyway_depth = 2.5  # radial, along X
# The keyway cuts 2.5mm into the bore wall (from X = 7.0mm to X = 9.5mm).
# Center of the keyway cutter is at X = bore_radius + (keyway_depth / 2.0)
keyway_center_x = bore_radius + (keyway_depth / 2.0)

bolt_diameter = 6.5
bolt_pcd = 38.0
bolt_radius = bolt_pcd / 2.0
bolt_angles = [0, 60, 120, 180, 240, 300]

# ================== SOLID GENERATION ==================

# 1. Create the main coaxial body (Z=0 to Z=60)
# Start with bottom flange (Z=0 to Z=10)
body = cq.Workplane("XY").circle(flange_diameter / 2.0).extrude(flange_thickness)

# Add central hub (Z=10 to Z=50)
body = body.faces(">Z").circle(hub_diameter / 2.0).extrude(hub_length)

# Add top flange (Z=50 to Z=60)
body = body.faces(">Z").circle(flange_diameter / 2.0).extrude(flange_thickness)


# 2. Create the center bore tool (Z=0 to Z=60)
bore_tool = cq.Workplane("XY").circle(bore_radius).extrude(total_length)


# 3. Create the keyway tool (Z=0 to Z=60)
# Centered at (keyway_center_x, 0) on the XY plane.
# Size in X is keyway_depth, size in Y is keyway_width.
keyway_tool = (
    cq.Workplane("XY")
    .workplane(offset=0.0)
    .center(keyway_center_x, 0.0)
    .rect(keyway_depth, keyway_width)
    .extrude(total_length)
)


# 4. Create the bolt holes tool (Z=0 to Z=60)
bolt_positions = []
for angle in bolt_angles:
    rad = math.radians(angle)
    x = bolt_radius * math.cos(rad)
    y = bolt_radius * math.sin(rad)
    bolt_positions.append((x, y))

bolt_tool = (
    cq.Workplane("XY")
    .pushPoints(bolt_positions)
    .circle(bolt_diameter / 2.0)
    .extrude(total_length)
)


# 5. Apply cuts to get the final flanged coupling
result = body.cut(bore_tool).cut(keyway_tool).cut(bolt_tool)