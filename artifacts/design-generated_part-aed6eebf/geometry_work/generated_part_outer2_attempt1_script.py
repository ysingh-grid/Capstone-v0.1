import cadquery as cq

# 1. Create the conical hub
hub = (
    cq.Workplane("XY")
    .circle(50.0)
    .workplane(offset=60.0)
    .circle(15.0)
    .loft()
)

# 2. Create the blade profile and loft it
wp = (
    cq.Workplane("XY")
    .moveTo(48.0, -1.0)
    .lineTo(48.0, 1.0)
    .threePointArc((56.5, 2.5), (65.0, 1.0))
    .lineTo(65.0, -1.0)
    .threePointArc((56.5, 0.5), (48.0, -1.0))
    .close()
    .workplane(offset=60.0)
    .transformed(rotate=(0, 0, 60.0))
    .moveTo(13.0, -1.0)
    .lineTo(13.0, 1.0)
    .threePointArc((16.5, 1.75), (20.0, 1.0))
    .lineTo(20.0, -1.0)
    .threePointArc((16.5, -0.25), (13.0, -1.0))
    .close()
)

blade = wp.loft()

# 3. Union the hub and all 7 blades together using Workplane operations
result = hub
for i in range(7):
    angle = i * (360.0 / 7.0)
    rotated_blade = blade.rotate((0, 0, 0), (0, 0, 1), angle)
    result = result.union(rotated_blade)

# 4. Cut the central bore hole (15mm diameter / 7.5mm radius) cleanly through the entire body
bore_cylinder = cq.Workplane("XY").workplane(offset=-10.0).circle(7.5).extrude(80.0)
result = result.cut(bore_cylinder)