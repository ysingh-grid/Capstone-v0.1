import cadquery as cq

# Parameters
outer_radius = 10.0       # pipe outer radius (mm)
inner_radius = 8.0        # pipe inner radius (mm)
bend_radius = 35.0        # centerline bend radius (mm)
leg_length = 10.0         # straight leg stub length (mm)

# Build the sweep path using edges and wire construction
# The path: left leg (down in -Z), semicircular arc (through apex at Z=+35), right leg (down in -Z)
# In XZ workplane coordinates: X is horizontal, Z (local Y) is vertical

import cadquery as cq
from cadquery import Edge, Wire, Vector

# Build path edges manually for more reliable sweep
# Left leg: from (0, 0, -leg_length) to (0, 0, 0)
e1 = Edge.makeLine(Vector(0, 0, -leg_length), Vector(0, 0, 0))

# Semicircular arc: center at (35, 0, 0), radius=35, in XZ plane
# Start: (0, 0, 0), End: (70, 0, 0), apex: (35, 0, 35)
e2 = Edge.makeThreePointArc(Vector(0, 0, 0), Vector(35, 0, 35), Vector(70, 0, 0))

# Right leg: from (70, 0, 0) to (70, 0, -leg_length)
e3 = Edge.makeLine(Vector(70, 0, 0), Vector(70, 0, -leg_length))

# Combine into a wire
path_wire = Wire.assembleEdges([e1, e2, e3])

# Wrap in a Workplane for sweep
path = cq.Workplane("XY").newObject([path_wire])

# Sweep outer circle along the path
# Profile on XY plane at origin, path starts at (0,0,-leg_length)
outer = cq.Workplane("XY").circle(outer_radius).sweep(path, isFrenet=True)

# Sweep inner circle along the same path
inner = cq.Workplane("XY").circle(inner_radius).sweep(path, isFrenet=True)

# Subtract inner from outer to create hollow pipe
result = outer.cut(inner)