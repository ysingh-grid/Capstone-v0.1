import cadquery as cq

# --- PARAMETERS ---
# Flange dimensions (Section 1: Z=0 to Z=3)
flange_width_x = 70.0
flange_length_y = 50.0
flange_thickness = 3.0

# Loft transition dimensions (Section 2: Z=3 to Z=53)
loft_base_width_x = 60.0
loft_base_length_y = 40.0
loft_top_diameter = 30.0
loft_height = 50.0

# Neck dimensions (Section 3: Z=53 to Z=63)
neck_diameter = 30.0
neck_height = 10.0

# --- ASSEMBLY ---

# 1. Create the rectangular mounting flange
# Centered in X and Y, standing on the XY plane (Z=0 to Z=flange_thickness)
flange = cq.Workplane("XY").box(
    flange_width_x, 
    flange_length_y, 
    flange_thickness, 
    centered=(True, True, False)
)

# 2. Add the lofted transition section
# We reference the top face of the flange (Z=3), construct the rectangular profile,
# offset by loft_height (to Z=53), construct the circular profile, and loft.
loft_top_radius = loft_top_diameter / 2.0
combined = (
    flange.faces(">Z")
    .workplane()
    .rect(loft_base_width_x, loft_base_length_y)
    .workplane(offset=loft_height)
    .circle(loft_top_radius)
    .loft(combine=True)
)

# 3. Add the cylindrical neck
# Select the topmost circular face at Z=53, draw a circle, and extrude it by neck_height.
neck_radius = neck_diameter / 2.0
result = (
    combined.faces(">Z")
    .workplane()
    .circle(neck_radius)
    .extrude(neck_height)
)