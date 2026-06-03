import math
import cadquery as cq

# --- PARAMETERS ---
bend_angle = 45.0  # Bend angle in degrees
bend_radius = 40.0  # Radius of the bend centerline (mm)
outer_diameter = 20.0  # Outer diameter of the pipe (mm)
inner_diameter = 16.0  # Inner diameter of the pipe (mm)

outer_radius = outer_diameter / 2.0
inner_radius = inner_diameter / 2.0

# Calculate the endpoint of the 45-degree arc on the XZ plane.
# The arc starts at (0,0) heading +Z (which is local +Y on XZ workplane)
# and curves towards +X (local +X).
# Center of the arc is at (bend_radius, 0).
end_x = bend_radius * (1.0 - math.cos(math.radians(bend_angle)))
end_z = bend_radius * math.sin(math.radians(bend_angle))

# --- GEOMETRY GENERATION ---

# 1. Define the sweep path on the XZ plane.
# We use a negative radius to draw a clockwise arc from (0,0) to (end_x, end_z).
path = cq.Workplane("XZ").moveTo(0, 0).radiusArc((end_x, end_z), -bend_radius)

# 2. Sweep the outer profile (circle) along the path.
outer_pipe = cq.Workplane("XY").circle(outer_radius).sweep(path)

# 3. Sweep the inner profile (circle) along the same path.
inner_void = cq.Workplane("XY").circle(inner_radius).sweep(path)

# 4. Subtract the inner void from the outer pipe to make it hollow.
result = outer_pipe.cut(inner_void)