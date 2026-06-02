import cadquery as cq

# Parameters
major_axis = 40.0
minor_axis = 20.0
height = 25.0

# Calculated semi-axes
semi_major = major_axis / 2.0
semi_minor = minor_axis / 2.0

# Create the elliptical cylinder
# We construct a 2D ellipse on the XY plane and extrude it along the Z-axis.
result = (
    cq.Workplane("XY")
    .ellipse(semi_major, semi_minor)
    .extrude(height)
)