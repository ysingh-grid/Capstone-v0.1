import math
import cadquery as cq

# --- PARAMETERS ---
bend_angle = 45.0          # Bend angle in degrees
bend_radius = 40.0         # Radius of the bend centerline (mm)
outer_diameter = 20.0      # Outer diameter of the pipe (mm)
inner_diameter = 16.0      # Inner diameter of the pipe (mm)

# --- CALCULATIONS ---
# Outer and inner radii
outer_radius = outer_diameter / 2.0
inner_radius = inner_diameter / 2.0

# Calculate the end point of the 45-degree arc in the XZ plane.
# The path starts at (0, 0, 0) and curves towards +X while rising in +Z.
angle_rad = math.radians(bend_angle)
end_x = bend_radius * (1.0 - math.cos(angle_rad))
end_z = bend_radius * math.sin(angle_rad)

# --- GEOMETRY ---
# 1. Create the sweep path on the XZ plane.
# Since we start at (0,0) and curve towards +X (clockwise around the center of rotation),
# we use a negative radius to define a clockwise arc.
path = cq.Workplane("XZ").radiusArc((end_x, end_z), -bend_radius)

# 2. Create the outer profile on the XY plane and sweep it along the path
outer_solid = cq.Workplane("XY").circle(outer_radius).sweep(path)

# 3. Create the inner profile on the XY plane and sweep it along the path
inner_solid = cq.Workplane("XY").circle(inner_radius).sweep(path)

# 4. Hollow out the elbow by subtracting the inner solid from the outer solid
result = outer_solid.cut(inner_solid)