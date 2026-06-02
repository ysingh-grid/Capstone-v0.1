import cadquery as cq
from cadquery import Edge, Wire, Vector

# Parameters
outer_radius = 10.0   # pipe outer radius (OD=20mm)
inner_radius = 8.0    # pipe inner radius (ID=16mm)
bend_radius = 35.0    # bend centerline radius
leg_length = 10.0     # straight leg stub length

# Build path using edges: two straight legs + semicircular arc in XZ plane
# Start: (0, 0, -leg_length), up to (0,0,0), arc through (35,0,35) to (70,0,0), down to (70,0,-leg_length)

# Left vertical leg: from (0,0,-10) to (0,0,0)
e1 = Edge.makeLine(Vector(0, 0, -leg_length), Vector(0, 0, 0))

# Semicircular arc in XZ plane: center at (35,0,0), radius=35
# from (0,0,0) through (35,0,35) to (70,0,0)
e2 = Edge.makeThreePointArc(Vector(0, 0, 0), Vector(35, 0, 35), Vector(70, 0, 0))

# Right vertical leg: from (70,0,0) to (70,0,-10)
e3 = Edge.makeLine(Vector(70, 0, 0), Vector(70, 0, -leg_length))

# Combine into a wire
path_wire = Wire.assembleEdges([e1, e2, e3])

# Sweep outer solid - profile on XY plane at the start of the path
outer = cq.Workplane("XY").circle(outer_radius).sweep(path_wire, isFrenet=True)

# Sweep inner solid (to be subtracted)
inner = cq.Workplane("XY").circle(inner_radius).sweep(path_wire, isFrenet=True)

# Subtract inner from outer to create hollow pipe
result = outer.cut(inner)