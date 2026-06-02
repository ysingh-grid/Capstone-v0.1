import cadquery as cq

# Define parametric dimensions
pipe_od = 30.0          # Outer diameter of the pipes (mm)
pipe_id = 24.0          # Inner diameter of the pipes (mm)
pipe_x_length = 100.0   # Length of the pipe along X-axis (mm)
pipe_z_length = 100.0   # Length of the pipe along Z-axis (mm)

# Calculate radii
outer_radius = pipe_od / 2.0
inner_radius = pipe_id / 2.0

# Create the outer solid for the X-axis pipe.
# The YZ plane's normal points along the X-axis, aligning this cylinder with X.
outer_x = cq.Workplane("YZ").cylinder(
    height=pipe_x_length, 
    radius=outer_radius, 
    centered=(True, True, True)
)

# Create the outer solid for the Z-axis pipe.
# The XY plane's normal points along the Z-axis, aligning this cylinder with Z.
outer_z = cq.Workplane("XY").cylinder(
    height=pipe_z_length, 
    radius=outer_radius, 
    centered=(True, True, True)
)

# Union the two outer cylinders to form the main solid shape of the cross fitting
outer_cross = outer_x.union(outer_z)

# Create the inner solid tool for the X-axis pipe.
# We make it slightly longer (+2.0 mm) to ensure a clean, flush cut at the pipe ends.
inner_x = cq.Workplane("YZ").cylinder(
    height=pipe_x_length + 2.0, 
    radius=inner_radius, 
    centered=(True, True, True)
)

# Create the inner solid tool for the Z-axis pipe.
# Also made slightly longer to ensure a clean cut.
inner_z = cq.Workplane("XY").cylinder(
    height=pipe_z_length + 2.0, 
    radius=inner_radius, 
    centered=(True, True, True)
)

# Union the two inner cylinders to create a single continuous hollow intersection tool
inner_cross = inner_x.union(inner_z)

# Subtract the inner hollow shape from the outer solid to finish the pipe fitting
result = outer_cross.cut(inner_cross)