import cadquery as cq

# Parametric dimensions
total_length = 1500.0
left_diameter = 60.0
left_length = 150.0
transition_length = 150.0
journal_diameter = 45.0
journal_length = 900.0  # Adjusted to maintain exactly 1500mm total length
overhung_diameter = 40.0
overhung_length = 300.0

mixer_hub_outer_diameter = 80.0
mixer_hub_length = 60.0

keyway_width = 25.0
keyway_depth = 14.0
chamfer_size = 2.0

# 1. Generate the stepped shaft profile in the XZ plane and revolve it
# Coordinates in (Radius, Z-position)
pts = [
    (0.0, 0.0),
    (left_diameter / 2.0, 0.0),
    (left_diameter / 2.0, left_length),
    (journal_diameter / 2.0, left_length + transition_length),
    (journal_diameter / 2.0, left_length + transition_length + journal_length),
    (overhung_diameter / 2.0, left_length + transition_length + journal_length),
    (overhung_diameter / 2.0, total_length),
    (0.0, total_length)
]

# Create the shaft solid by revolving 360 degrees around the Z axis
shaft = cq.Workplane("XZ").polyline(pts).close().revolve(360, (0, 0, 0), (0, 0, 1))

# 2. Model the Mixer Attachment Hub (Z: 1440 to 1500)
# Centered at Z = 1470 to make it flush with the end of the 1500mm shaft
hub_z_center = total_length - (mixer_hub_length / 2.0)
hub = cq.Workplane("XY").workplane(offset=hub_z_center).cylinder(mixer_hub_length, mixer_hub_outer_diameter / 2.0)

# 3. Union the shaft and the hub to form the main assembly
assembly = shaft.union(hub)

# 4. Apply 2mm x 45° chamfers to specified step transitions and ends
# We target:
# - Shaft bottom end (Z=0, Radius=30)
# - Shaft step transition shoulder (Z=1200, Radius=22.5)
# - Hub front edge (Z=1440, Radius=40)
# - Hub back edge (Z=1500, Radius=40)
edges_to_chamfer = (
    assembly.edges(cq.selectors.NearestToPointSelector((left_diameter / 2.0, 0.0, 0.0)))
    .add(assembly.edges(cq.selectors.NearestToPointSelector((journal_diameter / 2.0, 0.0, left_length + transition_length + journal_length))))
    .add(assembly.edges(cq.selectors.NearestToPointSelector((mixer_hub_outer_diameter / 2.0, 0.0, total_length - mixer_hub_length))))
    .add(assembly.edges(cq.selectors.NearestToPointSelector((mixer_hub_outer_diameter / 2.0, 0.0, total_length))))
)
assembly = assembly.chamfer(chamfer_size, edges_to_chamfer)

# 5. Model and cut the Square Keyway (25mm width x 14mm depth)
# Cut from Z=1420 to Z=1510 to ensure clean passage through the hub and shaft end
keyway_length = 90.0
keyway_z_center = total_length - (keyway_length / 2.0) + 10.0  # Extends slightly past Z=1500 for clean cut
keyway_y_start = (overhung_diameter / 2.0) - keyway_depth

# Box dimensions: X_len = 25 (width), Y_len = 50 (to clear the outer hub diameter), Z_len = 90
keyway_tool = (
    cq.Workplane("XY")
    .box(keyway_width, 50.0, keyway_length, centered=(True, False, True))
    .translate((0.0, keyway_y_start, keyway_z_center))
)

# Perform subtraction to create the final keyed shaft assembly
result = assembly.cut(keyway_tool)