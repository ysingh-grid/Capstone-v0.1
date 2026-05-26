import cadquery as cq

# Parametric dimensions
overall_height = 50.0
flange_thickness = 5.0
flange_outer_diameter = 50.0
flange_radius = flange_outer_diameter / 2.0
pipe_outer_diameter = 30.0
pipe_radius = pipe_outer_diameter / 2.0
bore_diameter = 20.0
bolt_circle_diameter = 40.0
bolt_circle_radius = bolt_circle_diameter / 2.0
bolt_hole_diameter = 6.0

# 1. Create the bottom flange disc (Z=0 to Z=5)
bottom_flange = cq.Workplane("XY").cylinder(
    height=flange_thickness,
    radius=flange_radius,
    centered=(True, True, False)
)

# 2. Create the pipe wall cylinder (Z=0 to Z=50)
pipe_wall = cq.Workplane("XY").cylinder(
    height=overall_height,
    radius=pipe_radius,
    centered=(True, True, False)
)

# 3. Create the top flange disc (Z=45 to Z=50)
top_flange = (
    cq.Workplane("XY")
    .workplane(offset=overall_height - flange_thickness)
    .cylinder(
        height=flange_thickness,
        radius=flange_radius,
        centered=(True, True, False)
    )
)

# Union the three concentric cylinders to form a single solid body
body = bottom_flange.union(pipe_wall).union(top_flange)

# Cut the 20mm center bore through the full length along Z
result = (
    body.faces(">Z")
    .workplane()
    .hole(bore_diameter)
)

# Drill four 6mm diameter bolt holes through both flanges on a 40mm bolt circle
bolt_holes_locations = [
    (bolt_circle_radius, 0.0),
    (0.0, bolt_circle_radius),
    (-bolt_circle_radius, 0.0),
    (0.0, -bolt_circle_radius)
]

result = (
    result.faces(">Z")
    .workplane()
    .pushPoints(bolt_holes_locations)
    .hole(bolt_hole_diameter)
)