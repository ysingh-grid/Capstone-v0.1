import cadquery as cq
from cadquery import Edge, Wire, Vector

# Parameters
outer_radius = 10.0   # pipe outer radius (OD=20mm)
inner_radius = 8.0    # pipe inner radius (ID=16mm)
bend_radius = 35.0    # bend centerline radius

# Create the semicircular arc path in XZ plane
# From (0,0,0) through (35,0,35) to (70,0,0)
start = Vector(0, 0, 0)
mid = Vector(35, 0, 35)
end = Vector(70, 0, 0)

arc_edge = Edge.makeThreePointArc(start, mid, end)
path_wire = Wire.assembleEdges([arc_edge])

# Build a CadQuery Workplane wire-based path for sweep
# The cross-section at the start of the path (0,0,0) has path tangent in +Z direction
# So the cross-section plane is XY at the origin

# Use single sweep with annular cross-section (outer circle with inner circle hole)
# circle() calls: first circle is outer, second circle (smaller) creates the hole
result = (
    cq.Workplane("XY")
    .circle(outer_radius)
    .circle(inner_radius)
    .sweep(path_wire, makeSolid=True, isFrenet=True)
)