import cadquery as cq

# Define parametric variables
bend_radius = 40.0
outer_diameter = 20.0
inner_diameter = 16.0
outer_radius = outer_diameter / 2.0
inner_radius = inner_diameter / 2.0

# Create the sweep path for the outer solid in the XZ plane
path_outer = (
    cq.Workplane("XZ")
    .moveTo(0, 0)
    .radiusArc((bend_radius, bend_radius), -bend_radius)
)

# Create the sweep path for the inner cutting tool 
# (extended 5mm on both ends to prevent coincident face boolean errors)
path_inner = (
    cq.Workplane("XZ")
    .moveTo(0, -5.0)
    .lineTo(0, 0)
    .radiusArc((bend_radius, bend_radius), -bend_radius)
    .lineTo(bend_radius + 5.0, bend_radius)
)

# Sweep the outer circle
outer = (
    cq.Workplane("XY")
    .circle(outer_radius)
    .sweep(path_outer, makeSolid=True)
)

# Sweep the inner circle (sketch shifted to Z = -5 to match the extended path start)
inner = (
    cq.Workplane("XY")
    .workplane(offset=-5.0)
    .circle(inner_radius)
    .sweep(path_inner, makeSolid=True)
)

# Perform clean cut
result = outer.cut(inner)