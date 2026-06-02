import cadquery as cq
import math

# Parametric dimensions
bottom_flange_diameter = 50.0
bottom_flange_thickness = 10.0
central_hub_diameter = 28.0
central_hub_length = 40.0
top_flange_diameter = 50.0
top_flange_thickness = 10.0
total_length = 60.0

bolt_hole_diameter = 6.5
bolt_pitch_circle_diameter = 38.0

center_bore_diameter = 14.0

keyway_width_y = 5.0
keyway_box_x_dim = 5.0
keyway_center_x = 5.75

# Create the bottom flange (Z = 0 to 10)
bottom_flange = cq.Workplane("XY").circle(bottom_flange_diameter / 2.0).extrude(bottom_flange_thickness)

# Create the central hub (Z = 10 to 50)
hub = (
    cq.Workplane("XY")
    .workplane(offset=bottom_flange_thickness)
    .circle(central_hub_diameter / 2.0)
    .extrude(central_hub_length)
)

# Create the top flange (Z = 50 to 60)
top_flange = (
    cq.Workplane("XY")
    .workplane(offset=bottom_flange_thickness + central_hub_length)
    .circle(top_flange_diameter / 2.0)
    .extrude(top_flange_thickness)
)

# Union the coaxial cylindrical sections to form the solid body
body = bottom_flange.union(hub).union(top_flange)

# Cut the center bore running the full 60mm length
bore = cq.Workplane("XY").circle(center_bore_diameter / 2.0).extrude(total_length)
body = body.cut(bore)

# Cut the keyway slot
keyway = (
    cq.Workplane("XY")
    .box(keyway_box_x_dim, keyway_width_y, total_length, centered=(True, True, False))
    .translate((keyway_center_x, 0, 0))
)
body = body.cut(keyway)

# Cut the six bolt holes passing through the full length of the flanges
r_pcd = bolt_pitch_circle_diameter / 2.0
angles = [0, 60, 120, 180, 240, 300]
bolt_hole_positions = [
    (r_pcd * math.cos(math.radians(a)), r_pcd * math.sin(math.radians(a)))
    for a in angles
]

# Create the holes using pushPoints on the top face
result = body.faces(">Z").workplane().pushPoints(bolt_hole_positions).hole(bolt_hole_diameter)