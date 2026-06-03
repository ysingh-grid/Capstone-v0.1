import cadquery as cq

# --- Parametric Dimensions ---
flange_x = 70.0
flange_y = 50.0
flange_z = 3.0

transition_rect_x = 60.0
transition_rect_y = 40.0
transition_height = 50.0

neck_diameter = 30.0
neck_radius = neck_diameter / 2.0
neck_height = 10.0

# --- Step 1: Rectangular Mounting Flange (Z=0 to Z=3) ---
# Solid box 70x50x3mm, centered in XY, sitting from Z=0 to Z=3
flange = (
    cq.Workplane("XY")
    .box(flange_x, flange_y, flange_z, centered=(True, True, False))
)

# --- Step 2: Lofted Transition Body (Z=3 to Z=53) ---
# Loft from 60x40 rectangle at Z=3 to 30mm diameter circle at Z=53
# Build on a workplane at Z=3, draw rect, then offset to Z=53 and draw circle
loft_body = (
    cq.Workplane("XY")
    .workplane(offset=flange_z)          # workplane at Z=3
    .rect(transition_rect_x, transition_rect_y)
    .workplane(offset=transition_height)  # workplane at Z=53
    .circle(neck_radius)
    .loft(combine=False)
)

# --- Step 3: Cylindrical Neck (Z=53 to Z=63) ---
# Cylinder of radius 15mm, height 10mm, centered in XY, base at Z=53
neck = (
    cq.Workplane("XY")
    .workplane(offset=flange_z + transition_height)  # Z=53
    .circle(neck_radius)
    .extrude(neck_height)
)

# --- Step 4: Union all three components ---
result = flange.union(loft_body).union(neck)