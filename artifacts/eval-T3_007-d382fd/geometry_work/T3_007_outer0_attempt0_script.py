import cadquery as cq

# --- Parametric dimensions ---
flange_x = 70.0
flange_y = 50.0
flange_z_start = 0.0
flange_z_end = 3.0
flange_thickness = 3.0

transition_rect_x = 60.0
transition_rect_y = 40.0
transition_z_start = 3.0
transition_z_end = 53.0
transition_height = 50.0
transition_top_diameter = 30.0
transition_top_radius = 15.0

neck_diameter = 30.0
neck_radius = 15.0
neck_z_start = 53.0
neck_z_end = 63.0
neck_height = 10.0

# --- Section 1: Rectangular mounting flange (Z=0 to Z=3) ---
# Centered in XY, sitting from Z=0 to Z=3
flange = (
    cq.Workplane("XY")
    .box(flange_x, flange_y, flange_thickness, centered=(True, True, False))
)

# --- Section 2: Lofted transition (Z=3 to Z=53) ---
# Profile 1: 60mm x 40mm rectangle at Z=3
# Profile 2: 30mm diameter circle at Z=53
# Build loft starting from Z=3 workplane
transition = (
    cq.Workplane("XY")
    .workplane(offset=transition_z_start)   # Move to Z=3
    .rect(transition_rect_x, transition_rect_y)
    .workplane(offset=transition_height)    # Move to Z=53
    .circle(transition_top_radius)
    .loft(combine=True)
)

# --- Section 3: Cylindrical neck (Z=53 to Z=63) ---
# Cylinder centered in XY, from Z=53 to Z=63
# We'll place it at Z=53 using centered=(True, True, False)
neck = (
    cq.Workplane("XY")
    .workplane(offset=neck_z_start)
    .circle(neck_radius)
    .extrude(neck_height)
)

# --- Union all three sections together ---
result = flange.union(transition).union(neck)