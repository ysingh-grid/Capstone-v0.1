import cadquery as cq

# --- Parametric Dimensions ---
outer_diameter = 50.0
total_length = 70.0
bore_1_dia = 15.0
bore_1_len = 30.0
bore_2_dia = 20.0
bore_2_len = 40.0
keyway_width = 10.0
keyway_depth = 2.0
chamfer_size = 1.0

# --- Geometry Construction ---

# 1. Create the main cylinder body standing on the XY plane (Z from 0 to total_length)
result = cq.Workplane("XY").cylinder(
    height=total_length,
    radius=outer_diameter / 2.0,
    centered=(True, True, False)
)

# 2. Chamfer the outer circular rims
# Selecting top and bottom end edges before drilling holes ensures we target the main outer rims
result = result.edges(">Z or <Z").chamfer(chamfer_size)

# 3. Create the stepped central bore
# First section: 15mm diameter, 30mm deep from the bottom face (Z=0)
result = result.faces("<Z").workplane().hole(bore_1_dia, bore_1_len)

# Second section: 20mm diameter, 40mm deep from the top face (Z=70)
result = result.faces(">Z").workplane().hole(bore_2_dia, bore_2_len)

# 4. Cut the flat keyway along the entire Z-axis length
# We define a cutting box of 10mm width and 10mm height, positioned to cut 2mm into the cylinder
tool_height = 10.0
keyway_y_center = (outer_diameter / 2.0) - keyway_depth + (tool_height / 2.0)

keyway_tool = (
    cq.Workplane("XY")
    .center(0, keyway_y_center)
    .rect(keyway_width, tool_height)
    .extrude(total_length)
)

# Apply the keyway cut
result = result.cut(keyway_tool)