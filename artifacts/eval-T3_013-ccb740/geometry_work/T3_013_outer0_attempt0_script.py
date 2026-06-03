import cadquery as cq

# Define parametric variables
bend_radius = 40.0
outer_diameter = 20.0
inner_diameter = 16.0
outer_radius = outer_diameter / 2.0
inner_radius = inner_diameter / 2.0

# Create the sweep path in the XZ plane.
# The path starts at (0,0) heading in the +Z direction (local +Y) 
# and ends at (40,40) heading in the +X direction (local +X).
# This is a clockwise arc, so we use a negative radius.
path = cq.Workplane("XZ").radiusArc((bend_radius, bend_radius), -bend_radius)

# Create the outer solid by sweeping the outer circular profile along the path
outer_pipe = cq.Workplane("XY").circle(outer_radius).sweep(path)

# Create the inner solid by sweeping the inner circular profile along the same path
inner_pipe = cq.Workplane("XY").circle(inner_radius).sweep(path)

# Cut the inner solid from the outer solid to produce the hollow elbow
result = outer_pipe.cut(inner_pipe)