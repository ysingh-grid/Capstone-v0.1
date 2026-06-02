import cadquery as cq

# Define design parameters
bottom_plate_length = 30.0
top_plate_length = 30.0
bracket_depth = 25.0
overall_height = 26.0
plate_thickness = 3.0
web_thickness = 3.0

# 1. Create the vertical web centered at X=0, spanning Z=0 to Z=26
web = (
    cq.Workplane("XY")
    .box(web_thickness, bracket_depth, overall_height)
    .translate((0, 0, overall_height / 2.0))
)

# 2. Create the bottom plate extending from X=0 to X=30, Z=0 to Z=3
bottom_plate = (
    cq.Workplane("XY")
    .box(bottom_plate_length, bracket_depth, plate_thickness)
    .translate((bottom_plate_length / 2.0, 0, plate_thickness / 2.0))
)

# 3. Create the top plate extending from X=-30 to X=0, Z=23 to Z=26
top_plate_z_center = overall_height - (plate_thickness / 2.0)
top_plate = (
    cq.Workplane("XY")
    .box(top_plate_length, bracket_depth, plate_thickness)
    .translate((-top_plate_length / 2.0, 0, top_plate_z_center))
)

# 4. Union the components to form the final Z-bracket
result = web.union(bottom_plate).union(top_plate)