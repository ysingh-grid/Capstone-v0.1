import cadquery as cq

# Parametric dimensions
base_radius = 25.0      # radius at Z=0
wall_start_z = 5.0      # straight wall up to here
belly_radius = 28.0     # max radius at belly
belly_z = 25.0
shoulder_radius = 22.0  # shoulder
shoulder_z = 45.0
neck_base_radius = 10.0 # neck starts here
neck_base_z = 55.0
neck_top_radius = 10.0  # neck top (opening)
neck_top_z = 65.0
wall_thickness = 2.0    # shell wall thickness

# Strategy:
# 1. Build a closed 2D profile in the XZ plane (X = radius, Z = height)
#    by connecting the outer profile points and closing through the axis.
# 2. Revolve 360 degrees around the Z axis to form a solid.
# 3. Shell inward with 2mm thickness, removing the top face (neck opening).

# Profile polyline vertices (outer profile, in X-Z coordinates):
# (25, 0) -> (25, 5) -> (28, 25) -> (22, 45) -> (10, 55) -> (10, 65)
# Close the profile by going along the axis:
# (10, 65) -> (0, 65) -> (0, 0) -> (25, 0)

# We work on the XZ plane. CadQuery's Workplane("XZ") has:
#   - drawing X maps to world X
#   - drawing Y maps to world Z
# So our profile points become (x_world, z_world) = (drawX, drawY)

result = (
    cq.Workplane("XZ")
    # Start at base outer edge
    .moveTo(base_radius, 0.0)
    # Outer profile: straight segments connecting all profile vertices
    .polyline([
        (base_radius,    wall_start_z),   # (25, 5)
        (belly_radius,   belly_z),         # (28, 25)
        (shoulder_radius, shoulder_z),     # (22, 45)
        (neck_base_radius, neck_base_z),   # (10, 55)
        (neck_top_radius,  neck_top_z),    # (10, 65)
        # Close through axis
        (0.0, neck_top_z),                 # (0, 65) - axis top
        (0.0, 0.0),                        # (0, 0)  - axis bottom
    ])
    # Close back to start point (25, 0)
    .close()
    # Revolve 360 degrees around the Z axis (axis defined by two points on Z axis)
    # In XZ workplane, the revolve axis is the Y axis of the workplane = world Z axis
    .revolve(360, axisStart=(0, 0), axisEnd=(0, 1))
)

# Shell the solid: remove the top face (neck opening at Z=65) and shell inward 2mm
# Negative thickness = inward shelling (preserves outer dimensions)
result = (
    result
    .faces(">Z")   # Select the topmost face (circular neck opening at Z=65)
    .shell(-wall_thickness)
)