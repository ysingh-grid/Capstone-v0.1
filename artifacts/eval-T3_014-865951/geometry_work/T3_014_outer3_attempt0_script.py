import cadquery as cq

# Parameters
outer_radius = 10.0   # pipe outer radius (OD=20mm)
inner_radius = 8.0    # pipe inner radius (ID=16mm)
bend_radius = 35.0    # bend centerline radius
leg_length = 10.0     # straight leg stubs

# The U-bend: revolve annular cross-section 180° around Y-axis at X=35
# Cross-section on XZ plane: annulus centered at (35, 0) in XZ coords
# Revolve axis: Y-axis through (35, 0, 0), i.e., local Y at X=35

# Build annular cross-section on XZ workplane, centered at (bend_radius, 0)
# then revolve 180° around the Z-axis of the XZ workplane (which is the global Y-axis? No...)
# 
# In CadQuery revolve on XZ workplane: the workplane normal is Y.
# revolve rotates around an axis IN the workplane.
# We want to revolve around a vertical axis (global Y) passing through X=35.
# On XZ workplane, "axisStart" and "axisEnd" are in XZ local coords.
# The Y-axis in global = the normal of XZ plane, not an in-plane axis.
#
# Better: use XY workplane, draw annulus at (35, 0), revolve around X=35 line
# Actually use revolve on YZ workplane centered at X=35:

# Approach: work on XZ plane, draw the cross-section as a circle at (35, 0),
# revolve 180° around the local Y axis (which is global Z=0 line in the XZ plane... )
#
# Simplest correct approach:
# - Work on YZ workplane (normal = X direction)
# - Draw annulus centered at (bend_radius, 0) in YZ = (Y=35, Z=0) in global
# - Revolve 180° around Z-axis (axisStart=(0,0,0), axisEnd=(0,0,1) in YZ local)
# This would create a half-torus in the XY plane, not XZ.
#
# Correct approach for XZ plane bend:
# - Cross-section should be in YZ plane at position X=0 (start of bend)
# - The bend center is at (35, 0, 0)
# - Revolve 180° around Y-axis

# Use the sweep approach with proper wire construction
# Build path as edges directly

import cadquery as cq
from cadquery import Edge, Wire, Vector

# Create the semicircular arc path in XZ plane
# Center at (35, 0, 0), radius 35, from (0,0,0) to (70,0,0) through (35,0,35)
start = Vector(0, 0, 0)
mid = Vector(35, 0, 35)
end = Vector(70, 0, 0)

arc_edge = Edge.makeThreePointArc(start, mid, end)
path_wire = Wire.assembleEdges([arc_edge])

# Add leg stubs as straight lines
leg_start_edge = Edge.makeLine(Vector(0, 0, -leg_length), Vector(0, 0, 0))
leg_end_edge = Edge.makeLine(Vector(70, 0, 0), Vector(70, 0, -leg_length))

# Full path wire with legs
full_wire = Wire.assembleEdges([leg_start_edge, arc_edge, leg_end_edge])

# Create a workplane at the start of the path (bottom of left leg)
# The pipe cross-section should be perpendicular to the path at start
# At start point (0,0,-leg_length), path direction is +Z, so cross-section is on XY plane

outer_solid = cq.Workplane("XY").circle(outer_radius).sweep(full_wire)
inner_solid = cq.Workplane("XY").circle(inner_radius).sweep(full_wire)

result = outer_solid.cut(inner_solid)