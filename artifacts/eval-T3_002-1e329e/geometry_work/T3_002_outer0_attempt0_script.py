import cadquery as cq

# Parametric dimensions
outer_x = 80.0
outer_y = 50.0
outer_z = 25.0
fillet_radius = 8.0
wall_thickness = 2.0
inner_fillet_radius = fillet_radius - wall_thickness  # 6mm
hole_diameter = 3.2
hole_pattern_x = 64.0  # spacing between hole centers in X
hole_pattern_y = 34.0  # spacing between hole centers in Y
floor_thickness = wall_thickness  # 2mm floor

# Step 1: Create the outer rounded-rectangle prism
# Extrude a rectangle from Z=0 upward, then fillet the vertical edges
outer_body = (
    cq.Workplane("XY")
    .rect(outer_x, outer_y)
    .extrude(outer_z)
)

# Apply 8mm fillet to the four vertical edges (parallel to Z axis)
outer_body = outer_body.edges("|Z").fillet(fillet_radius)

# Step 2: Create the inner cavity solid to subtract
# Inner cavity: starts at Z=floor_thickness, goes to the top (Z=outer_z)
# Inner dimensions: outer - 2*wall on each side = 76x46
# Inner fillet radius = 6mm to maintain uniform wall at corners
inner_x = outer_x - 2 * wall_thickness  # 76mm
inner_y = outer_y - 2 * wall_thickness  # 46mm
inner_z = outer_z - floor_thickness      # 23mm

inner_cavity = (
    cq.Workplane("XY")
    .workplane(offset=floor_thickness)
    .rect(inner_x, inner_y)
    .extrude(inner_z)
)

# Apply inner fillet to vertical edges of the cavity
inner_cavity = inner_cavity.edges("|Z").fillet(inner_fillet_radius)

# Step 3: Subtract the inner cavity from the outer body to create the hollow tray
tray = outer_body.cut(inner_cavity)

# Step 4: Drill four mounting holes through the bottom face
# Hole centers at (+/-32, +/-17) in XY, going through the 2mm floor
# Use pushPoints on the bottom face workplane to avoid face-selection issues after cuts
half_px = hole_pattern_x / 2.0  # 32mm
half_py = hole_pattern_y / 2.0  # 17mm

hole_positions = [
    ( half_px,  half_py),
    ( half_px, -half_py),
    (-half_px,  half_py),
    (-half_px, -half_py),
]

result = (
    tray
    .faces("<Z")
    .workplane()
    .pushPoints(hole_positions)
    .hole(hole_diameter, floor_thickness)
)