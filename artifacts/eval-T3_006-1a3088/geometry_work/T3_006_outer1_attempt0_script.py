import cadquery as cq

# Build the profile on the XZ workplane and revolve around Z axis
# The XZ workplane has X horizontal and Z vertical in local 2D coords
# We need to revolve around the local Y axis (which is world Z)

result = (
    cq.Workplane("XZ")
    .moveTo(25.0, 0.0)
    .lineTo(25.0, 5.0)
    .lineTo(28.0, 25.0)
    .lineTo(22.0, 45.0)
    .lineTo(10.0, 55.0)
    .lineTo(10.0, 65.0)
    .lineTo(0.0, 65.0)
    .lineTo(0.0, 0.0)
    .close()
    .revolve(360.0, axisStart=(0, 0), axisEnd=(0, 1))
)

# Shell inward by 2mm, removing the top face (neck opening at Z=65)
result = (
    result
    .faces(">Z")
    .shell(-2.0)
)