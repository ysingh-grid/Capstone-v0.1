import cadquery as cq

# Parametric dimensions
bend_radius = 35.0       # Centerline radius of the 180-degree bend
outer_diameter = 20.0    # Outer diameter of the pipe
inner_diameter = 16.0    # Inner diameter of the pipe
outer_radius = outer_diameter / 2.0
inner_radius = inner_diameter / 2.0

# Define the sweep path on the XZ plane.
# The path starts at local (0,0) [global (0,0,0)], arcs through (35, 35) [global (35,0,35)],
# and ends at (70, 0) [global (70,0,0)].
# On the XZ workplane, local X maps to global X and local Y maps to global Z.
path = cq.Workplane("XZ").threePointArc((bend_radius, bend_radius), (2 * bend_radius, 0))

# Create the outer solid by sweeping a circle of the outer radius along the path.
# The profile is defined on the XY plane, which is perpendicular to the start of the path.
outer_profile = cq.Workplane("XY").circle(outer_radius)
outer_solid = outer_profile.sweep(path)

# Create the inner solid by sweeping a circle of the inner radius along the same path.
inner_profile = cq.Workplane("XY").circle(inner_radius)
inner_solid = inner_profile.sweep(path)

# Cut the inner solid from the outer solid to produce the hollow U-bend pipe.
result = outer_solid.cut(inner_solid)