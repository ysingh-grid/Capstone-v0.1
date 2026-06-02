import cadquery as cq

# 1. Base central cylinder
base_center = cq.Workplane("XY").cylinder(50, 25, centered=(True, True, False)) # height 50, radius 25

# 5 spokes
spoke = (
    cq.Workplane("YZ")
    .cylinder(275, 20, centered=(True, True, False)) # length 275, radius 20
    .translate((25, 0, 20)) # raise by 20 so it's centered vertically at Z=20
)

# Rotate and union spokes
base = base_center
for i in range(5):
    angle = i * 72
    rotated_spoke = spoke.rotate((0, 0, 0), (0, 0, 1), angle)
    base = base.union(rotated_spoke)

# 2. Central support column (with slight overlap for robust union)
column = cq.Workplane("XY").workplane(offset=48).cylinder(404, 25, centered=(True, True, False))

# 3. Contoured seat pan
seat_box = cq.Workplane("XY").workplane(offset=450).box(450, 450, 30, centered=(True, True, False))
# Sphere for contouring
sphere_radius = 800
dip = 5
sphere_z = 480 + sphere_radius - dip
contour_sphere = cq.Workplane("XY").workplane(offset=sphere_z).sphere(sphere_radius)
seat = seat_box.cut(contour_sphere)

# 4. Vertical mounting bracket (with slight overlap in Y)
bracket = cq.Workplane("XY").workplane(offset=400).box(50, 10, 150, centered=(True, False, False)).translate((0, -234, 0))

# 5. Tilted rectangular backrest
backrest_raw = cq.Workplane("XY").box(400, 20, 500, centered=(True, True, False))
# Rotate by -15 degrees around X axis to tilt it backwards
backrest_rotated = backrest_raw.rotate((0, 0, 0), (1, 0, 0), -15)
# Translate to align and overlap with bracket
backrest = backrest_rotated.translate((0, -224, 520))

# Union all components
result = base.union(column).union(seat).union(bracket).union(backrest)