import cadquery as cq

# Parameters
outer_radius = 10.0       # pipe outer radius (mm)
inner_radius = 8.0        # pipe inner radius (mm)
bend_radius = 35.0        # centerline bend radius (mm)
leg_length = 10.0         # straight leg stub length (mm)

# Build the sweep path as a wire on the XZ workplane
# XZ workplane: X is horizontal, Z is vertical (local Y maps to global Z)
# Path: left leg (going up in Z), semicircular arc, right leg (going down in Z)
def make_path():
    return (
        cq.Workplane("XZ")
        .moveTo(0, -leg_length)
        .lineTo(0, 0)
        .radiusArc((bend_radius * 2, 0), -bend_radius)
        .lineTo(bend_radius * 2, -leg_length)
    )

path1 = make_path()
path2 = make_path()

# Sweep outer and inner profiles separately, then cut
outer = cq.Workplane("XY").circle(outer_radius).sweep(path1)
inner = cq.Workplane("XY").circle(inner_radius).sweep(path2)

result = outer.cut(inner)