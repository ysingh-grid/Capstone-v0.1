import cadquery as cq
import math

# Parameters
flange_diameter = 80.0
flange_thickness = 16.0
center_bore_diameter = 32.0
bolt_circle_diameter = 55.0
bolt_hole_diameter = 9.0
gasket_outer_diameter = 50.0
gasket_inner_diameter = 38.0
gasket_depth = 2.0

# 1. Create the main disc body lying flat on XY plane (Z=0 to Z=16)
# Centered in X and Y, with Z starting at 0 and rising to Z=16
body = cq.Workplane("XY").cylinder(
    height=flange_thickness,
    radius=flange_diameter / 2.0,
    centered=(True, True, False)
)

# 2. Cut the concentric center bore through the full thickness
body = body.faces(">Z").workplane().hole(center_bore_diameter)

# 3. Compute coordinates for the six bolt holes on the 55mm pitch circle
bolt_circle_radius = bolt_circle_diameter / 2.0
angles = [0, 60, 120, 180, 240, 300]
bolt_hole_positions = [
    (bolt_circle_radius * math.cos(math.radians(a)),
     bolt_circle_radius * math.sin(math.radians(a)))
    for a in angles
]

# 4. Drill the six bolt holes through the full thickness
body = body.faces(">Z").workplane().pushPoints(bolt_hole_positions).hole(bolt_hole_diameter)

# 5. Cut the concentric gasket groove on the top face (2mm deep, from Z=16 down to Z=14)
# Drawing two concentric circles on the top face and extruding downwards with 'combine="cut"'
result = (
    body.faces(">Z")
    .workplane()
    .circle(gasket_outer_diameter / 2.0)
    .circle(gasket_inner_diameter / 2.0)
    .extrude(-gasket_depth, combine="cut")
)