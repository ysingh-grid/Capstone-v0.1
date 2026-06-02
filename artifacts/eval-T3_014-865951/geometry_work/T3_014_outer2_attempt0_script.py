import cadquery as cq

# Parameters
outer_radius = 10.0
inner_radius = 8.0
bend_radius = 35.0
leg_length = 10.0

# Build the sweep path on XZ workplane
# XZ workplane: local X = global X, local Y = global Z
# Path: start at (0, -leg_length) in XZ (= global (0,0,-10)),
#       line up to (0,0), arc to (70,0), line down to (70,-leg_length)
path_wire = (
    cq.Workplane("XZ")
    .moveTo(0, -leg_length)
    .lineTo(0, 0)
    .radiusArc((bend_radius * 2, 0), -bend_radius)
    .lineTo(bend_radius * 2, -leg_length)
    .val()
)

# Create two workplanes at path start, sweep outer and inner separately
outer = (
    cq.Workplane("XY")
    .circle(outer_radius)
    .sweep(path_wire)
)

inner = (
    cq.Workplane("XY")
    .circle(inner_radius)
    .sweep(path_wire)
)

result = outer.cut(inner)