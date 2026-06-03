import cadquery as cq
import math

# Parameters
bend_radius = 40.0      # centerline bend radius (mm)
pipe_or = 10.0          # outer radius (20mm OD)
pipe_ir = 8.0           # inner radius (16mm ID)
bend_angle_deg = 45.0   # sweep angle in degrees

# The arc lies in the XZ plane.
# Arc center is at (40, 0, 0) in world space.
# Arc starts at origin (0,0,0) heading +Z, curves 45 degrees toward +X.
# Arc endpoint: center + bend_radius * (-cos(45), 0, sin(45))
#   = (40 - 40*cos(45), 0, 40*sin(45)) = (~11.716, 0, ~28.284)
arc_end_x = bend_radius - bend_radius * math.cos(math.radians(bend_angle_deg))
arc_end_z = bend_radius * math.sin(math.radians(bend_angle_deg))

# Build the sweep path on the XZ workplane.
# On XZ workplane: horizontal axis = X, vertical axis = Z.
# We start at the origin and sweep to (arc_end_x, arc_end_z) in XZ coords.
# The arc has its center at (bend_radius, 0) in XZ workplane coords (i.e., X=40, Z=0 in world).
# radiusArc with positive radius curves CCW in the XZ plane.
# Starting at origin (0,0) in XZ plane, ending at (arc_end_x, arc_end_z).
# With center at (40, 0), this is a CCW arc when viewed from -Y direction.
# Positive radius on XZ workplane should give the correct arc direction.
path = (
    cq.Workplane("XZ")
    .radiusArc((arc_end_x, arc_end_z), bend_radius)
)

# Sweep outer cylinder along the arc path
# Cross-section circle is on XY plane (perpendicular to +Z = initial tangent direction)
outer = cq.Workplane("XY").circle(pipe_or).sweep(path, isFrenet=True)

# Sweep inner cylinder along the same arc path to create the bore
inner = cq.Workplane("XY").circle(pipe_ir).sweep(path, isFrenet=True)

# Subtract inner from outer to create hollow pipe elbow
result = outer.cut(inner)