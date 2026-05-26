import cadquery as cq

# Parameters
sphere_radius = 15.0

# Create a solid sphere centered at the origin (0, 0, 0)
result = cq.Workplane("XY").sphere(sphere_radius)