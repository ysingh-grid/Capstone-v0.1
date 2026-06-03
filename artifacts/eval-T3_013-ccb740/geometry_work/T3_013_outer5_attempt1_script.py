import cadquery as cq

# Define parametric variables
bend_radius = 40.0
outer_diameter = 20.0
inner_diameter = 16.0
outer_radius = outer_diameter / 2.0
inner_radius = inner_diameter / 2.0

# Create the sweep path
path = cq.Workplane("XZ").radiusArc((bend_radius, bend_radius), bend_radius)

# Sweep the outer circle
outer = (
    cq.Workplane("XY")
    .circle(outer_radius)
    .sweep(path, makeSolid=True)
)

# Sweep the inner circle
inner = (
    cq.Workplane("XY")
    .circle(inner_radius)
    .sweep(path, makeSolid=True)
)

# Perform clean cut
result = outer.cut(inner)