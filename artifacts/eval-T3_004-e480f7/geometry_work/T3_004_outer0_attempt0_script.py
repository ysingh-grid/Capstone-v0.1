import cadquery as cq

# Parametric dimensions
outer_diameter = 60.0
bore_diameter = 12.0
pulley_width = 20.0

# V-groove parameters
v_groove_outer_z_start = 5.0
v_groove_root_radius = 20.0
v_groove_outer_z_end = 15.0

# Keyway parameters
keyway_width = 4.0
keyway_depth_from_bore = 2.5

# Computed helper dimensions
bore_radius = bore_diameter / 2.0
outer_radius = outer_diameter / 2.0
keyway_max_x = bore_radius + keyway_depth_from_bore

# Create the revolved pulley body
# We sketch on the XZ plane where local X = global X, and local Y = global Z.
# We then revolve 360 degrees around the Z axis (which is local Y: (0,0) to (0,1)).
pulley_body = (
    cq.Workplane("XZ")
    .moveTo(bore_radius, 0)
    .lineTo(outer_radius, 0)
    .lineTo(outer_radius, v_groove_outer_z_start)
    .lineTo(v_groove_root_radius, pulley_width / 2.0)
    .lineTo(outer_radius, v_groove_outer_z_end)
    .lineTo(outer_radius, pulley_width)
    .lineTo(bore_radius, pulley_width)
    .close()
    .revolve(360, (0, 0), (0, 1))
)

# Create the keyway cutter
# To ensure a clean and robust cut, the cutter is extended slightly 
# in the -X direction (into the bore) and along the +/- Z directions.
keyway_tool_width_x = keyway_depth_from_bore + 2.0  # Overlap into the bore
keyway_center_x = keyway_max_x - (keyway_tool_width_x / 2.0)
keyway_height_z = pulley_width + 4.0  # Overhang Z ends for a clean cut

keyway_cutter = (
    cq.Workplane("XY")
    .workplane(offset=pulley_width / 2.0)
    .center(keyway_center_x, 0)
    .box(keyway_tool_width_x, keyway_width, keyway_height_z, centered=(True, True, True))
)

# Cut the keyway from the pulley body to produce the final solid
result = pulley_body.cut(keyway_cutter)