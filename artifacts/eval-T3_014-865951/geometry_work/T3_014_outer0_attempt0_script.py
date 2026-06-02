import cadquery as cq

# Parameters
outer_radius = 10.0       # pipe outer radius (mm)
inner_radius = 8.0        # pipe inner radius (mm)
bend_radius = 35.0        # centerline bend radius (mm)
leg_length = 10.0         # straight leg stub length (mm)

# The U-bend arc goes from (0,0,0) to (70,0,0) in XZ plane, arcing through apex at (35,0,35).
# We build the sweep path on the XZ workplane.
# The path consists of:
#   - A straight segment from (0, -leg_length) to (0, 0) (the left leg, going in +Z)
#   - A semicircular arc from (0,0) to (70,0) with radius 35 (apex at Z=35)
#   - A straight segment from (70, 0) to (70, -leg_length) (the right leg, going in -Z)
# On XZ workplane: horizontal axis = X, vertical axis = Z

# Build the sweep path as a wire on the XZ workplane
# XZ workplane: X is horizontal, Z is vertical (local Y maps to global Z)
path = (
    cq.Workplane("XZ")
    .moveTo(0, -leg_length)          # start of left leg (x=0, z=-leg_length in XZ)
    .lineTo(0, 0)                    # end of left leg at origin
    .radiusArc((bend_radius * 2, 0), -bend_radius)  # semicircular arc to (70, 0), radius negative for CW (arching to +Z)
    .lineTo(bend_radius * 2, -leg_length)            # right leg going down
)

# Sweep outer circle along the path
outer = cq.Workplane("XY").circle(outer_radius).sweep(path)

# Sweep inner circle along the same path
inner = cq.Workplane("XY").circle(inner_radius).sweep(path)

# Subtract inner from outer to create hollow pipe
result = outer.cut(inner)