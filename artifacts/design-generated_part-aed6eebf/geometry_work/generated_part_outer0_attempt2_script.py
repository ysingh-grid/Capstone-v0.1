import cadquery as cq

# 1. Base parameters
hub_base_radius = 50.0
hub_top_radius = 15.0
hub_height = 60.0
bore_radius = 7.5
blade_count = 7
blade_thickness = 2.0
blade_twist_degrees = 60.0

# Create the conical hub by revolving a trapezoid around the central axis
hub = (
    cq.Workplane("XZ")
    .polyline([
        (0, -hub_height / 2.0),
        (hub_base_radius, -hub_height / 2.0),
        (hub_top_radius, hub_height / 2.0),
        (0, hub_height / 2.0)
    ])
    .close()
    .revolve()
)

# Define Z coordinates for base and top of the blade
z_base = -hub_height / 2.0

# Draw the blade profiles and loft them
wp = cq.Workplane("XY").workplane(offset=z_base)
# Base profile
wp = wp.moveTo(35.0, -1.0).lineTo(65.0, -1.0).lineTo(65.0, 1.0).lineTo(35.0, 1.0).close()
# Top profile (offset by hub_height and rotated)
wp = wp.workplane(offset=hub_height).transformed(rotate=(0, 0, blade_twist_degrees))
wp = wp.moveTo(10.0, -1.0).lineTo(20.0, -1.0).lineTo(20.0, 1.0).lineTo(10.0, 1.0).close()

# Create the single twisted blade
single_blade = wp.loft(ruled=False)

# Rotate and union all blades to the hub
assembly = hub
for i in range(blade_count):
    angle = i * (360.0 / blade_count)
    rotated_blade = single_blade.rotate((0, 0, 0), (0, 0, 1), angle)
    assembly = assembly.union(rotated_blade)

# Create the central bore hole by cutting a cylinder
bore = cq.Workplane("XY").cylinder(hub_height + 10.0, bore_radius)
result = assembly.cut(bore)