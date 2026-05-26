import cadquery as cq

# Define parametric variables
bend_radius = 40.0      # Radius of the bend centerline
outer_diameter = 20.0   # Outer diameter of the pipe
inner_diameter = 16.0   # Inner diameter of the pipe

outer_radius = outer_diameter / 2.0
inner_radius = inner_diameter / 2.0

# Create the sweep path in the XZ plane (quarter-circle arc)
# Path starts at (0,0) and ends at (bend_radius, bend_radius)
path = cq.Workplane("XZ").radiusArc((bend_radius, bend_radius), bend_radius)

# Sweep the outer profile along the path
outer_pipe = cq.Workplane("XY").circle(outer_radius).sweep(path)

# Sweep the inner profile along the same path
inner_pipe = cq.Workplane("XY").circle(inner_radius).sweep(path)

# Cut the inner volume from the outer volume to make the pipe hollow
result = outer_pipe.cut(inner_pipe)