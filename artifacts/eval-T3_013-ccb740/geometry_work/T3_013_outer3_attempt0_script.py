import cadquery as cq

# Define parametric variables
bend_radius = 40.0
outer_diameter = 20.0
inner_diameter = 16.0
outer_radius = outer_diameter / 2.0
inner_radius = inner_diameter / 2.0

# Create the sweep path in the XZ plane.
path = cq.Workplane("XZ").moveTo(0, 0).radiusArc((bend_radius, bend_radius), -bend_radius)

# Create the hollow pipe by sweeping the concentric circles (annular profile) in one step
result = (
    cq.Workplane("XY")
    .circle(outer_radius)
    .circle(inner_radius)
    .sweep(path, makeSolid=True, isFrenet=True)
)