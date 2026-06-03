import cadquery as cq

# 1. Create the conical hub
# Base diameter is 100mm (radius 50mm) at Z=0
# Top diameter is 30mm (radius 15mm) at Z=60mm
hub = (
    cq.Workplane("XY")
    .circle(50.0)
    .workplane(offset=60.0)
    .circle(15.0)
    .loft()
)

# 2. Create the blade template
# Each blade profile has a 2mm thickness (from Y=-1 to Y=1)
# To ensure clean boolean union, we extend the blade 2mm inside the hub radius:
# Base: extends from X=48 to X=65 (protruding 15mm outside the 50mm hub surface)
# Top: extends from X=13 to X=20 (protruding 5mm outside the 15mm hub surface)
# The top profile is rotated by 60 degrees around the Z-axis
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

# Generate the twisted blade solid
blade = wp.loft()

# 3. Create all 7 blades distributed evenly around the Z-axis
blades = []
for i in range(7):
    angle = i * (360.0 / 7.0)
    rotated_blade = blade.rotate((0, 0, 0), (0, 0, 1), angle)
    blades.append(rotated_blade)

# 4. Union the hub and all 7 blades together
result_solid = hub
for b in blades:
    result_solid = result_solid.union(b)

# 5. Cut the central bore hole (15mm diameter / 7.5mm radius) through the center
result_solid = result_solid.faces("<Z").workplane().circle(7.5).cutThruAll()