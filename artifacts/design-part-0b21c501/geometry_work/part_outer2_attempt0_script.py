import cadquery as cq

# 1. Wall (centered on XY, Z from 0 to 300)
wall = cq.Workplane("XY").box(400.0, 100.0, 300.0, centered=(True, True, False))

# 2. Indoor Unit (at negative Y side, overlapping slightly into the wall at Y=-50)
indoor = (
    cq.Workplane("XY")
    .box(260.0, 60.0, 80.0)
    .translate((0, -79.0, 250.0))
)

# 3. Outdoor Unit (at positive Y side, overlapping slightly into the wall at Y=50)
# Includes a circular fan cavity cut into the external front face (at Y=149)
outdoor = (
    cq.Workplane("XY")
    .box(200.0, 100.0, 160.0)
    .translate((0, 99.0, 150.0))
    .faces(">Y")
    .workplane()
    .hole(110.0, 15.0)
)

# 4. Fan Hub inside the cavity (from Y=134 to Y=149)
hub = (
    cq.Workplane("XZ")
    .workplane(offset=134.0)
    .circle(12.5)
    .extrude(15.0)
    .translate((0, 0, 150.0))
)

# 5. Fan Blades (crossed horizontal and vertical blades inside the cavity at Y=139)
blades_h = (
    cq.Workplane("XZ")
    .workplane(offset=139.0)
    .box(100.0, 15.0, 3.0)
    .translate((0, 0, 150.0))
)

blades_v = (
    cq.Workplane("XZ")
    .workplane(offset=139.0)
    .box(15.0, 100.0, 3.0)
    .translate((0, 0, 150.0))
)

# Combine all components into the final assembly
result = wall.union(indoor).union(outdoor).union(hub).union(blades_h).union(blades_v)