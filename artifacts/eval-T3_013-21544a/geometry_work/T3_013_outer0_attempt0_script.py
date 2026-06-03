import cadquery as cq

# Parametric dimensions
bend_r = 40.0    # bend centerline radius (mm)
pipe_or = 10.0   # outer radius (mm)
pipe_ir = 8.0    # inner radius (mm), 2mm wall thickness

# Create the quarter-circle arc path on the XZ plane
# Arc starts at origin (0,0) heading in +Z, curves to (40,40) heading in +X
# On XZ workplane: X maps to world-X, Y maps to world-Z
# radiusArc with positive radius goes CCW in the XZ plane
path = cq.Workplane("XZ").radiusArc((bend_r, bend_r), bend_r)

# Sweep outer solid circle along the arc path
# Profile is on XY plane (perpendicular to Z, which is the initial tangent direction)
outer = cq.Workplane("XY").circle(pipe_or).sweep(path, isFrenet=True)

# Sweep inner solid circle along the same arc path
inner = cq.Workplane("XY").circle(pipe_ir).sweep(path, isFrenet=True)

# Subtract inner from outer to create the hollow pipe elbow
result = outer.cut(inner)