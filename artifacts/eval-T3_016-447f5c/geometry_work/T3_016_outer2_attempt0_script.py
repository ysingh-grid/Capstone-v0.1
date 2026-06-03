import cadquery as cq

# --- PARAMETERS ---
bend_angle = 45.0  # Bend angle in degrees
bend_radius = 40.0  # Radius of the bend centerline (mm)
outer_diameter = 20.0  # Outer diameter of the pipe (mm)
inner_diameter = 16.0  # Inner diameter of the pipe (mm)

outer_radius = outer_diameter / 2.0
inner_radius = inner_diameter / 2.0

# --- GEOMETRY GENERATION ---
# Create the concentric circles (annulus) on the XY plane, and revolve it
# around an axis parallel to the Y-axis to create a perfectly non-sheared elbow.
result = (
    cq.Workplane("XY")
    .circle(outer_radius)
    .circle(inner_radius)
    .revolve(bend_angle, (bend_radius, 0, 0), (bend_radius, 1, 0))
)