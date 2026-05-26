import cadquery as cq

# Define design parameters
diameter = 50.0
radius = diameter / 2.0

# Create a sphere centered at the origin on the XY plane.
# Splitting with keepTop=True cuts the sphere at the XY plane (Z=0) 
# and keeps the upper half (+Z direction), leaving a flat face on the XY plane.
result = cq.Workplane("XY").sphere(radius).split(keepTop=True)