import math
import cadquery as cq

# Exact geometric transition fillet calculations
# Transition 1: Step from R=25 to R=27.5 (at X=100)
xc1 = 100.0 - math.sqrt(8.75)
mid1_x = xc1 + math.sqrt(5.9375)

# Transition 2: Step from R=27.5 to R=32.5 (at X=180)
mid2_x = 177.0 + math.sqrt(6.75)

# Transition 3: Step from R=32.5 to R=27.5 (at X=1120)
mid3_x = 1123.0 - math.sqrt(6.75)

# Transition 4: Step from R=27.5 to R=25.0 (at X=1200)
xc4 = 1200.0 + math.sqrt(8.75)
mid4_x = xc4 - math.sqrt(5.9375)

# 1. Build the exact 2D shaft profile (top half) on the XZ plane
profile = (
    cq.Workplane("XZ")
    .lineTo(0.0, 25.0)
    .lineTo(xc1, 25.0)
    .threePointArc((mid1_x, 26.25), (100.0, 27.5))
    .lineTo(177.0, 27.5)
    .threePointArc((mid2_x, 29.0), (180.0, 30.5))
    .lineTo(180.0, 32.5)
    .lineTo(1120.0, 32.5)
    .lineTo(1120.0, 30.5)
    .threePointArc((mid3_x, 29.0), (1123.0, 27.5))
    .lineTo(1200.0, 27.5)
    .threePointArc((mid4_x, 26.25), (xc4, 25.0))
    .lineTo(1500.0, 25.0)
    .lineTo(1500.0, 0.0)
    .close()
)

# 2. Revolve the 2D profile 360 degrees around the X-axis
shaft = profile.revolve(360, (0, 0, 0), (1, 0, 0))

# 3. Create Left Keyway Tool with 0.6 mm Root Fillet
keyway_left_tool = (
    cq.Workplane("XY")
    .workplane(offset=19.5)  # Bottom of 5.5mm depth slot is at Z = 25 - 5.5 = 19.5
    .center(50.0, 0.0)      # Centered at X=50
    .rect(80.0, 14.0)
    .extrude(15.0)
)
keyway_left_tool = keyway_left_tool.faces("<Z").edges().fillet(0.6)

# 4. Create Right Keyway Tool with 0.6 mm Root Fillet
keyway_right_tool = (
    cq.Workplane("XY")
    .workplane(offset=19.5)
    .center(1475.0, 0.0)    # Centered at X=1475 (under the Mixer Hub)
    .rect(40.0, 14.0)
    .extrude(15.0)
)
keyway_right_tool = keyway_right_tool.faces("<Z").edges().fillet(0.6)

# Cut keyways from the shaft
shaft = shaft.cut(keyway_left_tool).cut(keyway_right_tool)

# Apply chamfers to shaft ends
try:
    shaft = cq.Workplane(obj=shaft).edges(cq.selectors.NearestToPointSelector((0.0, 0.0, 25.0))).chamfer(1.5)
    shaft = cq.Workplane(obj=shaft).edges(cq.selectors.NearestToPointSelector((1500.0, 0.0, 25.0))).chamfer(1.5)
except Exception:
    pass

# 5. Build the Mixer Hub
hub = (
    cq.Workplane("YZ")
    .workplane(offset=1460.0)  # Mounted from X = 1460 to 1500
    .circle(60.0)             # Outer diameter 120 mm
    .circle(25.0)             # Bore diameter 50 mm
    .extrude(40.0)
)

# Cut the Hub's internal keyway
hub_keyway = (
    cq.Workplane("XY")
    .workplane(offset=25.0)   # Starts at the top edge of the bore (Z=25)
    .center(1480.0, 0.0)      # Centered along the hub thickness
    .rect(40.0, 14.0)
    .extrude(10.0)
)
hub = hub.cut(hub_keyway)

# Apply outer chamfers to the Hub
try:
    hub = hub.edges(">X or <X").edges("%Circle").chamfer(2.0)
except Exception:
    pass

# 6. Final Assembly Union
result = shaft.union(hub)