import cadquery as cq

# Parametric dimensions
base_radius = 25.0
base_straight_height = 5.0
belly_radius = 28.0
belly_height = 25.0
shoulder_radius = 22.0
shoulder_height = 45.0
neck_radius = 10.0
neck_height_start = 55.0
total_height = 65.0
wall_thickness = 2.0

# Create the 2D profile in the XZ plane.
# In the XZ plane, local x maps to global X (radius), and local y maps to global Z (height).
profile = (
    cq.Workplane("XZ")
    .lineTo(base_radius, 0.0)
    .lineTo(base_radius, base_straight_height)
    .lineTo(belly_radius, belly_height)
    .lineTo(shoulder_radius, shoulder_height)
    .lineTo(neck_radius, neck_height_start)
    .lineTo(neck_radius, total_height)
    .lineTo(0.0, total_height)
    .close()
)

# Revolve the profile 360 degrees around the Z-axis (which is the local Y-axis in XZ plane)
solid = profile.revolve(360, (0, 0), (0, 1))

# Remove the top face at Z=65 and shell inward to create the hollow interior
result = solid.faces(">Z").shell(-wall_thickness)