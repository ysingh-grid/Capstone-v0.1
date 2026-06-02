import cadquery as cq
from cadquery import Edge, Wire, Vector

# Parameters
outer_radius = 10.0   # pipe outer radius (OD=20mm)
inner_radius = 8.0    # pipe inner radius (ID=16mm)
bend_radius = 35.0    # bend centerline radius
leg_length = 10.0     # straight leg stub length

# Create the sweep path: two straight legs + semicircular arc in XZ plane
# Left leg: from (0,0,-10) to (0,0,0) in +Z direction
# Arc: from (0,0,0) through (35,0,35) to (70,0,0)
# Right leg: from (70,0,0) to (70,0,-10) in -Z direction

# Build path using CadQuery workplane on XZ plane
# The path goes: start at (0,-10) on XZ plane (i.e. x=0,z=-10)
# up to (0,0), arc to (70,0), then down to (70,-10)
path = (
    cq.Workplane("XZ")
    .moveTo(0, -leg_length)
    .lineTo(0, 0)
    .radiusArc((70, 0), -bend_radius)
    .lineTo(70, -leg_length)
)

path_wire = path.wire().val()

# Sweep outer solid
outer = cq.Workplane("XY").circle(outer_radius).sweep(path_wire, isFrenet=True)

# Sweep inner solid (to be subtracted)
inner = cq.Workplane("XY").circle(inner_radius).sweep(path_wire, isFrenet=True)

# Subtract inner from outer to create hollow pipe
result = outer.cut(inner)