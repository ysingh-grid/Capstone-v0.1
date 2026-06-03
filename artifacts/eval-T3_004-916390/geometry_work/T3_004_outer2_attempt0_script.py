import cadquery as cq

# --- Parametric Dimensions ---
bore_radius = 6.0
outer_radius = 30.0
pulley_height = 20.0
v_root_x = 20.0
v_root_z = 10.0
bottom_flange_z = 5.0
top_flange_z = 15.0

keyway_x_start = 6.0
keyway_x_end = 8.5
keyway_width = 4.0

# --- Build profile on XY workplane (X=radial, Y=height) ---
# Revolve around the Y axis (local Y = height axis)
# Profile: (6,0)->(30,0)->(30,5)->(20,10)->(30,15)->(30,20)->(6,20)->close
pulley_body = (
    cq.Workplane("XY")
    .moveTo(bore_radius, 0)
    .lineTo(outer_radius, 0)
    .lineTo(outer_radius, bottom_flange_z)
    .lineTo(v_root_x, v_root_z)
    .lineTo(outer_radius, top_flange_z)
    .lineTo(outer_radius, pulley_height)
    .lineTo(bore_radius, pulley_height)
    .close()
    .revolve(359.9, axisStart=(0, 0, 0), axisEnd=(0, 1, 0))
)

# After revolving around Y axis:
# - The pulley axis is along Y (from Y=0 to Y=20)
# - Rotate -90 degrees around X axis to make Y→Z
# This maps: Y→Z, Z→-Y, X stays X
# So pulley spans Z=0 to Z=20 after rotation? Let's check:
# Point at Y=0 stays at Z=0, point at Y=20 goes to Z=20. Yes.
pulley_body = pulley_body.rotate((0, 0, 0), (1, 0, 0), 90)

# --- Create keyway cutter ---
# Keyway: X from 6 to 8.5 (radial depth 2.5mm), Y from -2 to +2 (4mm wide), Z from 0 to 20
keyway_cx = (keyway_x_start + keyway_x_end) / 2.0   # 7.25
keyway_len_x = keyway_x_end - keyway_x_start          # 2.5

keyway_cutter = (
    cq.Workplane("XY")
    .box(
        keyway_len_x,    # X dimension: 2.5mm radial depth
        keyway_width,    # Y dimension: 4mm wide
        pulley_height,   # Z dimension: 20mm full height
        centered=(True, True, False)  # centered in X,Y; base at Z=0
    )
    .translate((keyway_cx, 0, 0))
)

# --- Subtract keyway from pulley ---
result = pulley_body.cut(keyway_cutter)