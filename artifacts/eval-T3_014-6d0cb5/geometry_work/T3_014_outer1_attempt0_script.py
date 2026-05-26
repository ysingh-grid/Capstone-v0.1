import cadquery as cq

# --- Parametric Dimensions ---
bend_radius = 35.0          # Radius of the centerline bend (mm)
pipe_outer_diameter = 20.0  # Outer diameter of the pipe (mm)
pipe_inner_diameter = 16.0  # Inner diameter of the pipe (mm)

pipe_or = pipe_outer_diameter / 2.0
pipe_ir = pipe_inner_diameter / 2.0

# --- Path Definition ---
# Semicircular path on the XZ plane starting at (0,0,0) and ending at (70,0,0).
# A positive radius creates a counter-clockwise arc curving upward into +Z.
path = cq.Workplane("XZ").radiusArc((2 * bend_radius, 0), bend_radius)

# --- Profile & Sweeping ---
# The XY plane is perpendicular to the path start at (0,0,0).
# We sweep the outer and inner profiles separately to ensure clean, valid geometry.
outer_solid = cq.Workplane("XY").circle(pipe_or).sweep(path)
inner_solid = cq.Workplane("XY").circle(pipe_ir).sweep(path)

# Cut the inner volume from the outer volume to create the hollow U-bend pipe
result = outer_solid.cut(inner_solid)