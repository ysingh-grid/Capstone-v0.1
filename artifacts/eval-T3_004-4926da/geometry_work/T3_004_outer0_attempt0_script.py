import cadquery as cq

# --- Parametric Dimensions ---
bore_radius = 6.0          # inner radius (X=6)
outer_radius = 30.0        # outer radius (X=30)
pulley_width = 20.0        # total height in Z
v_root_radius = 20.0       # V-groove root radius (X=20)
v_root_z = 10.0            # V-groove root Z position
bottom_flange_z = 5.0      # bottom flange top Z
top_flange_z = 15.0        # top flange bottom Z

keyway_width = 4.0         # keyway width in Y
keyway_depth = 2.5         # keyway radial depth (from bore surface)
keyway_x_start = bore_radius                    # X=6 (bore surface)
keyway_x_end = bore_radius + keyway_depth       # X=8.5
keyway_z_length = pulley_width                  # full 20mm in Z

# --- Build the V-belt pulley by revolving a closed 2D profile ---
# Profile vertices in (X, Z) order (as per design plan):
# (6,0) -> (30,0) -> (30,5) -> (20,10) -> (30,15) -> (30,20) -> (6,20) -> (6,0)
#
# In CadQuery, revolve works on the XZ workplane where X=radial, Y=axial(Z).
# We use the XZ workplane so that the profile X maps to radial distance
# and the profile Z maps to the axial (height) direction.
# The revolve axis will be the Z axis (0,0,1).

# Build profile as a closed wire on the XZ plane using Workplane
# On XZ plane: horizontal axis = X (radial), vertical axis = Z (axial/height)
pulley_body = (
    cq.Workplane("XZ")
    .moveTo(bore_radius, 0.0)           # (6, 0)
    .lineTo(outer_radius, 0.0)          # (30, 0)
    .lineTo(outer_radius, bottom_flange_z)  # (30, 5)
    .lineTo(v_root_radius, v_root_z)    # (20, 10) - diagonal inward to V-groove root
    .lineTo(outer_radius, top_flange_z) # (30, 15) - diagonal outward to top flange
    .lineTo(outer_radius, pulley_width) # (30, 20)
    .lineTo(bore_radius, pulley_width)  # (6, 20)
    .close()                            # back to (6, 0)
    .revolve(
        angleDegrees=360,
        axisStart=(0, 0, 0),
        axisEnd=(0, 0, 1)               # revolve around Z axis
    )
)

# --- Cut the keyway slot into the bore on the +X side ---
# Keyway: X from 6 to 8.5, Y from -2 to +2, Z from 0 to 20
# Use a box: length in X = 2.5, width in Y = 4.0, height in Z = 20.0
# Center the box at X = (6 + 8.5)/2 = 7.25, Y = 0, Z = 10

keyway_x_center = (keyway_x_start + keyway_x_end) / 2.0  # 7.25
keyway_x_size = keyway_x_end - keyway_x_start              # 2.5

keyway = (
    cq.Workplane("XY")
    .box(
        keyway_x_size,      # length in X = 2.5mm
        keyway_width,       # width in Y = 4.0mm
        keyway_z_length,    # height in Z = 20.0mm
        centered=(True, True, True)
    )
    .translate((keyway_x_center, 0.0, keyway_z_length / 2.0))
)

# Subtract the keyway from the pulley body
result = pulley_body.cut(keyway)