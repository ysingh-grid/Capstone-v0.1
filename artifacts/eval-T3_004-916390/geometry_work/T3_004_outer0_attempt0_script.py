import cadquery as cq

# --- Parametric Dimensions ---
bore_radius = 6.0          # inner radius (bore)
outer_radius = 30.0        # outer radius
pulley_height = 20.0       # total Z height
v_root_x = 20.0            # V-groove root radius
v_root_z = 10.0            # V-groove root height
bottom_flange_z = 5.0      # bottom flange top Z
top_flange_z = 15.0        # top flange bottom Z

keyway_x_start = 6.0       # start at bore surface
keyway_x_end = 8.5         # 2.5mm deep radially
keyway_width = 4.0         # 4mm wide in Y
keyway_half_width = keyway_width / 2.0  # 2mm each side

# --- Build the 2D profile in the XZ plane ---
# Profile vertices (X=radial, Z=height):
# (6,0) -> (30,0) -> (30,5) -> (20,10) -> (30,15) -> (30,20) -> (6,20) -> close
# We draw this on the XY workplane where X=radial, Y=Z-axis of pulley.
# Then revolve around the Y axis (which becomes the pulley Z axis).

# Use the XZ plane for the profile: in CadQuery XZ workplane,
# horizontal = X (radial), vertical = Z (height)
# We'll draw on the XY workplane and revolve around the Y axis.

profile_pts = [
    (bore_radius, 0),           # (6, 0)  - bottom inner
    (outer_radius, 0),          # (30, 0) - bottom outer
    (outer_radius, bottom_flange_z),  # (30, 5) - bottom flange top
    (v_root_x, v_root_z),       # (20, 10) - V-groove root
    (outer_radius, top_flange_z),     # (30, 15) - top flange bottom
    (outer_radius, pulley_height),    # (30, 20) - top outer
    (bore_radius, pulley_height),     # (6, 20)  - top inner
]

# Build the closed wire profile on XY plane (X=radial, Y=height)
# Revolve around Y axis (the pulley Z axis)
wire = (
    cq.Workplane("XY")
    .moveTo(profile_pts[0][0], profile_pts[0][1])
    .lineTo(profile_pts[1][0], profile_pts[1][1])
    .lineTo(profile_pts[2][0], profile_pts[2][1])
    .lineTo(profile_pts[3][0], profile_pts[3][1])
    .lineTo(profile_pts[4][0], profile_pts[4][1])
    .lineTo(profile_pts[5][0], profile_pts[5][1])
    .lineTo(profile_pts[6][0], profile_pts[6][1])
    .close()
)

# Revolve around the Y axis (axisStart and axisEnd define the Y axis)
# This maps: profile X -> radial, profile Y -> pulley Z
pulley = wire.revolve(
    angleDegrees=360,
    axisStart=(0, 0, 0),
    axisEnd=(0, 1, 0)
)

# The pulley is now standing with its axis along Y.
# We need it along Z. Rotate 90 degrees around X to bring Y-axis to Z-axis.
# Actually, let's reconsider: revolving around Y axis with profile in XY plane
# gives a solid with axis along Y. We want axis along Z.
# Better approach: use XZ workplane and revolve around Z axis directly.

# Rebuild using a different approach: draw profile in XZ plane, revolve around Z
# In CadQuery, Workplane("XZ") has X going right and Z going up (into screen by default)
# Let's use a custom approach with splineApprox or direct wire building

# Alternative: Build on XY, revolve around Y, then rotate
# But simpler: use Workplane and draw in a plane where we can revolve around Z

# Let's use the approach of building a face and revolving around Z axis
# by constructing the profile in the YZ plane (X=0 is the axis)

# Re-approach: Draw profile in the XZ workplane where:
# - horizontal (X in workplane) = radial distance from Z axis
# - vertical (Y in workplane) = Z height of pulley
# Then revolve around the Z axis of world coordinates

# CadQuery's revolve with axisStart/axisEnd in world coords:
# We draw on XY plane (profile X = radial, profile Y = pulley Z)
# and revolve around the world Z axis: axisStart=(0,0,0), axisEnd=(0,0,1)
# But the profile must be offset from the axis (X > 0)

pulley_body = (
    cq.Workplane("XY")
    .moveTo(profile_pts[0][0], profile_pts[0][1])
    .lineTo(profile_pts[1][0], profile_pts[1][1])
    .lineTo(profile_pts[2][0], profile_pts[2][1])
    .lineTo(profile_pts[3][0], profile_pts[3][1])
    .lineTo(profile_pts[4][0], profile_pts[4][1])
    .lineTo(profile_pts[5][0], profile_pts[5][1])
    .lineTo(profile_pts[6][0], profile_pts[6][1])
    .close()
    .revolve(
        angleDegrees=360,
        axisStart=(0, 0, 0),
        axisEnd=(0, 1, 0)   # revolve around Y axis (profile Y = radial, X = height after rotation)
    )
)

# This gives axis along Y. Rotate to make axis along Z.
# Rotate -90 degrees around X axis: Y -> Z
import cadquery as cq
from cadquery import Vector

# Clean rebuild with correct axis
# Profile in XY plane: X=radial distance, Y=pulley Z height
# Revolve around Y axis → pulley axis = Y
# Then rotate 90° around X to bring Y-axis pulley to Z-axis pulley

# Step 1: Create revolve solid with axis along Y
pts = [
    (bore_radius, 0),
    (outer_radius, 0),
    (outer_radius, bottom_flange_z),
    (v_root_x, v_root_z),
    (outer_radius, top_flange_z),
    (outer_radius, pulley_height),
    (bore_radius, pulley_height),
]

solid_y_axis = (
    cq.Workplane("XY")
    .moveTo(pts[0][0], pts[0][1])
    .lineTo(pts[1][0], pts[1][1])
    .lineTo(pts[2][0], pts[2][1])
    .lineTo(pts[3][0], pts[3][1])
    .lineTo(pts[4][0], pts[4][1])
    .lineTo(pts[5][0], pts[5][1])
    .lineTo(pts[6][0], pts[6][1])
    .close()
    .revolve(360, axisStart=(0, 0, 0), axisEnd=(0, 1, 0))
)

# Step 2: Rotate so that Y axis becomes Z axis
# Rotation: -90 degrees around X axis transforms Y -> Z
pulley_solid = solid_y_axis.rotate((0, 0, 0), (1, 0, 0), -90)

# Step 3: Create keyway cutter box
# Keyway: X from 6 to 8.5, Y from -2 to +2, Z from 0 to 20
# Box centered at X = (6+8.5)/2 = 7.25, Y = 0, Z = 10
keyway_cx = (keyway_x_start + keyway_x_end) / 2.0  # 7.25
keyway_len_x = keyway_x_end - keyway_x_start        # 2.5
keyway_cutter = (
    cq.Workplane("XY")
    .box(
        keyway_len_x,      # X dimension (radial depth = 2.5mm)
        keyway_width,      # Y dimension (4mm wide)
        pulley_height,     # Z dimension (full 20mm height)
        centered=(True, True, True)
    )
    .translate((keyway_cx, 0, pulley_height / 2.0))
)

# Step 4: Subtract keyway from pulley
result = pulley_solid.cut(keyway_cutter)