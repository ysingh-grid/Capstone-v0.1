import cadquery as cq

# Design Parameters
diameter = 40.0
height = 10.0
radius = diameter / 2.0

# Create the cylindrical hockey puck body centered at the origin
# This centers the cylinder in X, Y, and Z axes.
result = cq.Workplane("XY").cylinder(height=height, radius=radius, centered=(True, True, True))