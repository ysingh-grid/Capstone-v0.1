import cadquery as cq
import math

# Define parametric dimensions
flange_diameter = 80.0
flange_thickness = 16.0
center_bore_diameter = 32.0
pitch_circle_diameter = 55.0
bolt_hole_diameter = 9.0
gasket_groove_inner_diameter = 38.0
gasket_groove_outer_diameter = 50.0
gasket_groove_depth = 2.0

# 1. Create the main flange disc cylinder on XY plane (from Z=0 to Z=16)
result = cq.Workplane("XY").cylinder(
    height=flange_thickness, 
    radius=flange_diameter / 2.0, 
    centered=(True, True, False)
)

# 2. Drill the center bore through-hole
result = result.faces(">Z").workplane().hole(center_bore_diameter)

# 3. Drill the 6 bolt holes on the pitch circle diameter (PCD)
pitch_circle_radius = pitch_circle_diameter / 2.0
bolt_holes_points = []
for i in range(6):
    angle_rad = math.radians(i * 60.0)
    x = pitch_circle_radius * math.cos(angle_rad)
    y = pitch_circle_radius * math.sin(angle_rad)
    bolt_holes_points.append((x, y))

# Place and drill the bolt holes
result = result.faces(">Z").workplane().pushPoints(bolt_holes_points).hole(bolt_hole_diameter)

# 4. Cut the concentric gasket groove on the top face (Z=14 to Z=16)
# Define the start height of the groove
groove_z_start = flange_thickness - gasket_groove_depth

# Create the outer and inner cylinders for the groove tool
outer_groove_tool = cq.Workplane("XY").cylinder(
    height=gasket_groove_depth,
    radius=gasket_groove_outer_diameter / 2.0,
    centered=(True, True, False)
).translate((0, 0, groove_z_start))

inner_groove_tool = cq.Workplane("XY").cylinder(
    height=gasket_groove_depth,
    radius=gasket_groove_inner_diameter / 2.0,
    centered=(True, True, False)
).translate((0, 0, groove_z_start))

# Create the ring shape by subtracting the inner cylinder from the outer one
groove_ring_tool = outer_groove_tool.cut(inner_groove_tool)

# Cut the groove ring out of the main flange
result = result.cut(groove_ring_tool)