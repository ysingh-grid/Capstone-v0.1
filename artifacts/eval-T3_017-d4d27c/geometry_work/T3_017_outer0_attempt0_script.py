import cadquery as cq

# Design Parameters
pipe_length = 100.0
pipe_outer_diameter = 30.0
pipe_inner_diameter = 24.0

# Calculate radii and half-length for symmetric extrusion
pipe_or = pipe_outer_diameter / 2.0
pipe_ir = pipe_inner_diameter / 2.0
half_length = pipe_length / 2.0

# Create the outer cylinder along the X-axis (sketched on YZ plane, extruded along X)
outer_x = cq.Workplane("YZ").circle(pipe_or).extrude(half_length, both=True)

# Create the outer cylinder along the Z-axis (sketched on XY plane, extruded along Z)
outer_z = cq.Workplane("XY").circle(pipe_or).extrude(half_length, both=True)

# Union the two outer cylinders to form the solid cross shape
outer_combined = outer_x.union(outer_z)

# Create the inner cylinder along the X-axis for the internal bore
inner_x = cq.Workplane("YZ").circle(pipe_ir).extrude(half_length, both=True)

# Create the inner cylinder along the Z-axis for the internal bore
inner_z = cq.Workplane("XY").circle(pipe_ir).extrude(half_length, both=True)

# Union the two inner cylinders to form the solid intersection core
inner_combined = inner_x.union(inner_z)

# Subtract the inner core from the outer shape to create the continuous hollow '+' passage
result = outer_combined.cut(inner_combined)