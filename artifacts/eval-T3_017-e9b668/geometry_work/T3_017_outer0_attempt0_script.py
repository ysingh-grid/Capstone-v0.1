import cadquery as cq

# Parametric dimensions
outer_diameter = 30.0
inner_diameter = 24.0
outer_radius = outer_diameter / 2.0  # 15mm
inner_radius = inner_diameter / 2.0  # 12mm
pipe_length = 100.0

# Create outer cylinder along X axis (rotate 90 degrees around Y axis)
outer_x = (
    cq.Workplane("XY")
    .cylinder(pipe_length, outer_radius)
    .rotate((0, 0, 0), (0, 1, 0), 90)
)

# Create outer cylinder along Z axis (default orientation is along Z)
outer_z = (
    cq.Workplane("XY")
    .cylinder(pipe_length, outer_radius)
)

# Union the two outer cylinders to form the combined outer shell
outer_combined = outer_x.union(outer_z)

# Create inner bore cylinder along X axis
inner_x = (
    cq.Workplane("XY")
    .cylinder(pipe_length, inner_radius)
    .rotate((0, 0, 0), (0, 1, 0), 90)
)

# Create inner bore cylinder along Z axis
inner_z = (
    cq.Workplane("XY")
    .cylinder(pipe_length, inner_radius)
)

# Union the two inner bore cylinders to form the combined bore
inner_combined = inner_x.union(inner_z)

# Subtract the combined bore from the combined outer shell
result = outer_combined.cut(inner_combined)