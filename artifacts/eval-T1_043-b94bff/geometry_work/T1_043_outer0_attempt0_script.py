import cadquery as cq

# Define parametric variables
cap_radius = 15.0
cylinder_height = 50.0

# Create the central cylinder, centered on the origin
# This extends from Z = -25 to Z = 25
cylinder = cq.Workplane("XY").cylinder(height=cylinder_height, radius=cap_radius, centered=(True, True, True))

# Create the top sphere at the top face of the cylinder (Z = 25)
top_sphere = cq.Workplane("XY").workplane(offset=cylinder_height / 2.0).sphere(cap_radius)

# Create the bottom sphere at the bottom face of the cylinder (Z = -25)
bottom_sphere = cq.Workplane("XY").workplane(offset=-cylinder_height / 2.0).sphere(cap_radius)

# Union the cylinder and the spheres to form the complete capsule
result = cylinder.union(top_sphere).union(bottom_sphere)