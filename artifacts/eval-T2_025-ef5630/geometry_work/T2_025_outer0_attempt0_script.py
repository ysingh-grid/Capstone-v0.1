import cadquery as cq

# Define parametric variables
flange_diameter = 40.0
flange_thickness = 5.0
shaft_diameter = 20.0
shaft_length = 50.0
bolt_circle_diameter = 30.0
bolt_hole_diameter = 6.0

# Create the base flange at Z=0 (rises to Z=5)
flange = cq.Workplane("XY").circle(flange_diameter / 2.0).extrude(flange_thickness)

# Create the vertical shaft starting at the top of the flange (Z=5 to Z=55)
shaft = (
    cq.Workplane("XY")
    .workplane(offset=flange_thickness)
    .circle(shaft_diameter / 2.0)
    .extrude(shaft_length)
)

# Union the flange and the shaft into a single solid body
result = flange.union(shaft)

# Drill the four bolt holes through the flange
# We select the bottom face of the flange (at Z=0) to place our workplane
result = (
    result.faces("<Z")
    .workplane()
    .pushPoints([
        (bolt_circle_diameter / 2.0, 0.0),
        (0.0, bolt_circle_diameter / 2.0),
        (-bolt_circle_diameter / 2.0, 0.0),
        (0.0, -bolt_circle_diameter / 2.0)
    ])
    .hole(bolt_hole_diameter)
)