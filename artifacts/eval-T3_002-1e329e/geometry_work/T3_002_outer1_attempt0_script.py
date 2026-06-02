import cadquery as cq

# Parametric dimensions
outer_x = 80.0
outer_y = 50.0
outer_z = 25.0
fillet_radius = 8.0
wall_thickness = 2.0
hole_diameter = 3.2
hole_pattern_x = 64.0
hole_pattern_y = 34.0

# Use the shell() approach as recommended to avoid geometric artifacts
# Step 1: Create outer rounded-rectangle prism
# Step 2: Fillet the four vertical edges
# Step 3: Shell inward by removing the top face
# Step 4: Drill mounting holes through the bottom

half_px = hole_pattern_x / 2.0  # 32mm
half_py = hole_pattern_y / 2.0  # 17mm

result = (
    cq.Workplane("XY")
    .rect(outer_x, outer_y)
    .extrude(outer_z)
    .edges("|Z")
    .fillet(fillet_radius)
    .faces(">Z")
    .shell(-wall_thickness)
    .faces("<Z")
    .workplane()
    .pushPoints([
        ( half_px,  half_py),
        ( half_px, -half_py),
        (-half_px,  half_py),
        (-half_px, -half_py),
    ])
    .hole(hole_diameter)
)