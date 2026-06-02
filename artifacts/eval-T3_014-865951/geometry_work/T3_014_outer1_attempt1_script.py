import cadquery as cq

# Parameters
outer_radius = 10.0       # pipe outer radius (mm)
inner_radius = 8.0        # pipe inner radius (mm)
bend_radius = 35.0        # centerline bend radius (mm)
leg_length = 10.0         # straight leg stub length (mm)

# Build the sweep path: left leg stub, semicircular arc, right leg stub
# Path lives in XZ plane. We build it as a wire using edges.

import cadquery as cq
from cadquery import Edge, Wire, Vector
import math

# Create the path wire manually using edges
# Segment 1: straight line from (0, 0, -leg_length) to (0, 0, 0)  [left leg, going up in Z]
# Segment 2: semicircular arc from (0, 0, 0) to (70, 0, 0) through apex (35, 0, 35)
# Segment 3: straight line from (70, 0, 0) to (70, 0, -leg_length)  [right leg, going down]

# Left leg edge
e1 = Edge.makeLine(Vector(0, 0, -leg_length), Vector(0, 0, 0))

# Semicircular arc in XZ plane: center at (35, 0, 0), radius=35
# Start at (0,0,0), apex at (35,0,35), end at (70,0,0)
e2 = Edge.makeThreePointArc(Vector(0, 0, 0), Vector(35, 0, 35), Vector(70, 0, 0))

# Right leg edge
e3 = Edge.makeLine(Vector(70, 0, 0), Vector(70, 0, -leg_length))

# Combine into a wire
path_wire = Wire.assembleEdges([e1, e2, e3])

# Create a Workplane with the path wire as a CadQuery object
path = cq.Workplane("XY").newObject([path_wire])

# Sweep outer profile
outer = cq.Workplane("XY").circle(outer_radius).sweep(path)

# Rebuild path for inner sweep
path2 = cq.Workplane("XY").newObject([Wire.assembleEdges([
    Edge.makeLine(Vector(0, 0, -leg_length), Vector(0, 0, 0)),
    Edge.makeThreePointArc(Vector(0, 0, 0), Vector(35, 0, 35), Vector(70, 0, 0)),
    Edge.makeLine(Vector(70, 0, 0), Vector(70, 0, -leg_length))
])])

inner = cq.Workplane("XY").circle(inner_radius).sweep(path2)

result = outer.cut(inner)