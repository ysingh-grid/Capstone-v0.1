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

# --- GEOMETRY ---
# To avoid sweep distortions and guarantee a perfectly uniform pipe cross-section,
# we revolve the circles on the XY plane around an axis parallel to the Y-axis
# passing through the bend's center of curvature (X = bend_radius).
outer_solid = (
    cq.Workplane("XY")
    .circle(outer_radius)
    .revolve(bend_angle, (bend_radius, 0, 0), (bend_radius, 1, 0))
)

inner_solid = (
    cq.Workplane("XY")
    .circle(inner_radius)
    .revolve(bend_angle, (bend_radius, 0, 0), (bend_radius, 1, 0))
)

# Hollow out the elbow by subtracting the inner solid from the outer solid
result = outer_solid.cut(inner_solid)