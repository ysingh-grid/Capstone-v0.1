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

# 2. Create the blade profile and loft it
# Base: extends from X=48 to X=65 (protruding 15mm outside the 50mm hub surface, extending 2mm inside for clean union)
# Top: extends from X=13 to X=20 (protruding 5mm outside the 15mm hub surface, extending 2mm inside)
# Twist: 60 degrees rotation around the Z-axis from bottom to top
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

# Extract direct solids to avoid reference/context issues during looping and unioning
hub_solid = hub.val()
blade_solid = blade.val()

# 3. Create all 7 blades distributed evenly around the Z-axis
blades = []
for i in range(7):
    angle = i * (360.0 / 7.0)
    rotated_blade = blade_solid.rotate((0, 0, 0), (0, 0, 1), angle)
    blades.append(rotated_blade)

# 4. Union the hub and all 7 blades together
merged_solid = hub_solid
for b in blades:
    merged_solid = merged_solid.union(b)

# 5. Cut the central bore hole (15mm diameter / 7.5mm radius) cleanly through the entire body
# Create the bore cylinder independently to avoid multi-face selection issues on unioned bodies
bore_cylinder = cq.Workplane("XY").workplane(offset=-10.0).circle(7.5).extrude(80.0).val()
final_solid = merged_solid.cut(bore_cylinder)

# Wrap the final solid back into a Workplane object
result_solid = cq.Workplane("XY")
result_solid.objects = [final_solid]