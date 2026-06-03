import cadquery as cq

# Parametric dimensions
outer_radius = 15.0      # 30mm outer diameter
inner_radius = 12.0      # 24mm inner diameter
pipe_length = 100.0      # length of each pipe arm
wall_thickness = 3.0     # outer_radius - inner_radius

# Step 1: Create outer solid cylinder along X axis
# Default cylinder is along Z, so rotate 90 degrees about Y to align with X
outer_x = (
    cq.Workplane("YZ")
    .cylinder(pipe_length, outer_radius)
)

# Step 2: Create outer solid cylinder along Z axis (default orientation)
outer_z = (
    cq.Workplane("XY")
    .cylinder(pipe_length, outer_radius)
)

# Step 3: Union the two outer cylinders to form the combined outer body
outer_body = outer_x.union(outer_z)

# Step 4: Create inner bore cylinder along X axis
inner_x = (
    cq.Workplane("YZ")
    .cylinder(pipe_length, inner_radius)
)

# Step 5: Create inner bore cylinder along Z axis
inner_z = (
    cq.Workplane("XY")
    .cylinder(pipe_length, inner_radius)
)

# Step 6: Union the two inner bore cylinders to form the continuous '+' shaped hollow interior
inner_bore = inner_x.union(inner_z)

# Step 7: Subtract the unioned inner bore from the unioned outer body
# This creates the hollow cross fitting with wall thickness of 3mm
result = outer_body.cut(inner_bore)