import cadquery as cq

# --- PARAMETERS ---
base_plate_length = 80.0
base_plate_width = 50.0
base_plate_thickness = 3.0

standoff_diameter = 8.0
standoff_height = 12.0
hole_diameter = 3.2

# 3x2 array spacing
spacing_x = 30.0
spacing_y = 30.0

# Coordinates for the 6 posts (3 columns at -30, 0, 30; 2 rows at -15, 15)
points = [
    (-spacing_x, -spacing_y / 2.0),
    (0.0, -spacing_y / 2.0),
    (spacing_x, -spacing_y / 2.0),
    (-spacing_x, spacing_y / 2.0),
    (0.0, spacing_y / 2.0),
    (spacing_x, spacing_y / 2.0)
]

# --- GEOMETRY GENERATION ---

# 1. Create the base plate centered on XY, with the bottom face at Z=0
result = (
    cq.Workplane("XY")
    .box(base_plate_length, base_plate_width, base_plate_thickness)
    .translate((0, 0, base_plate_thickness / 2.0))
)

# 2. Add the six standoff posts on the top face (Z=3) extending to Z=15
result = (
    result.faces(">Z")
    .workplane()
    .pushPoints(points)
    .circle(standoff_diameter / 2.0)
    .extrude(standoff_height)
)

# 3. Create the pilot through-holes cutting from Z=15 down to Z=0
holes = (
    cq.Workplane("XY", origin=(0, 0, base_plate_thickness + standoff_height))
    .pushPoints(points)
    .circle(hole_diameter / 2.0)
    .extrude(-(base_plate_thickness + standoff_height))
)

# 4. Cut the holes from the main body
result = result.cut(holes)