import cadquery as cq

# Define parametric variables
bend_radius = 40.0
outer_diameter = 20.0
inner_diameter = 16.0
outer_radius = outer_diameter / 2.0
wall_thickness = (outer_diameter - inner_diameter) / 2.0

# Create the sweep path in the XZ plane.
# The path starts at (0,0) heading in the +Z direction (local +Y)
# and ends at (40,40) heading in the +X direction (local +X).
path = cq.Workplane("XZ").moveTo(0, 0).radiusArc((bend_radius, bend_radius), -bend_radius)

# Create the solid pipe by sweeping the outer circle
solid_pipe = cq.Workplane("XY").circle(outer_radius).sweep(path)

# Hollow out the pipe by hollowing it with the end faces removed.
# The end faces are located at the start (Z=0, facing -Z) and end (X=40, facing +X).
result = solid_pipe.faces("<Z or >X").shell(-wall_thickness)