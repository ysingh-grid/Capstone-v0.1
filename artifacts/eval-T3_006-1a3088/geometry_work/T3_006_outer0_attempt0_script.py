import cadquery as cq

# --- Parametric dimensions ---
base_radius    = 25.0   # mm, at Z=0
wall_end_z     = 5.0    # mm, straight wall top
belly_radius   = 28.0   # mm, at Z=25
belly_z        = 25.0
shoulder_radius = 22.0  # mm, at Z=45
shoulder_z     = 45.0
neck_base_radius = 10.0 # mm, at Z=55
neck_base_z    = 55.0
neck_top_radius = 10.0  # mm, at Z=65
neck_top_z     = 65.0
wall_thickness = 2.0    # mm

# Build the profile on the XZ plane (treating X as radius, Y as height in 2D wire)
# We work on the YZ workplane so that the "X" of the wire becomes the radial direction
# and "Y" of the wire becomes Z height. The revolve axis will be the Y axis of YZ plane
# which maps to the Z axis in 3D space.

# Actually, let's use the XZ workplane approach:
# In CadQuery, to revolve around Z axis, we build the profile in a plane
# containing the Z axis, e.g. the XZ plane (ZX workplane).
# In ZX workplane: "X" maps to world Z, "Y" maps to world X (radial).
# We'll build the 2D closed profile explicitly.

# Profile vertices (radius, z):
# (25, 0) -> (25, 5) -> (28, 25) -> (22, 45) -> (10, 55) -> (10, 65)
# Then close back through the axis: (0, 65) -> (0, 0) -> (25, 0)

# We use the XZ workplane where horizontal=X (maps to world X) and vertical=Z (maps to world Z).
# Revolve around the Z axis using axisStart=(0,0,0), axisEnd=(0,0,1).

result = (
    cq.Workplane("XZ")
    # Start at base point (radius=25, z=0)
    .moveTo(25.0, 0.0)
    # Straight wall up to Z=5
    .lineTo(25.0, 5.0)
    # Outward to belly at Z=25
    .lineTo(28.0, 25.0)
    # Inward to shoulder at Z=45
    .lineTo(22.0, 45.0)
    # Further inward to neck base at Z=55
    .lineTo(10.0, 55.0)
    # Straight neck up to Z=65
    .lineTo(10.0, 65.0)
    # Close through axis: go to axis top
    .lineTo(0.0, 65.0)
    # Down the axis to origin
    .lineTo(0.0, 0.0)
    # Close back to start
    .close()
    # Revolve 360 degrees around the Z axis
    # axisStart and axisEnd define the revolution axis in world space
    .revolve(360.0, axisStart=(0, 0, 0), axisEnd=(0, 0, 1))
)

# Shell the solid: remove the top face (at Z=65, the neck opening) and shell inward 2mm
# Negative thickness = inward shelling (preserves outer dimensions)
result = (
    result
    .faces(">Z")
    .shell(-wall_thickness)
)