import cadquery as cq

# Parametric dimensions
xlen = 70.0
ylen = 50.0
zlen = 30.0
edge_fillet_radius = 4.0
wall_thickness = 2.0

boss_outer_diameter = 8.0
boss_inner_hole_diameter = 3.0
boss_x_offset = 27.0
boss_y_offset = 17.0

# 1. Create the outer enclosure body (centered in XY, resting on Z=0)
body = cq.Workplane("XY").box(xlen, ylen, zlen, centered=(True, True, False))

# 2. Fillet the four vertical edges
body = body.edges("|Z").fillet(edge_fillet_radius)

# 3. Shell the enclosure to make it open on top (+Z) with 2mm wall thickness
body = body.faces(">Z").shell(-wall_thickness)

# 4. Generate the four solid screw bosses
# They start at the inner floor (Z = wall_thickness) and extend to the rim (Z = zlen)
boss_points = [
    (boss_x_offset, boss_y_offset),
    (boss_x_offset, -boss_y_offset),
    (-boss_x_offset, boss_y_offset),
    (-boss_x_offset, -boss_y_offset)
]

boss_height = zlen - wall_thickness
bosses = (
    cq.Workplane("XY")
    .workplane(offset=wall_thickness)
    .pushPoints(boss_points)
    .circle(boss_outer_diameter / 2.0)
    .extrude(boss_height)
)

# Combine the bosses with the main enclosure body
body = body.union(bosses)

# 5. Drill the 3mm through-holes through the bosses and the floor (Z=0 to Z=30)
result = (
    body.faces("<Z")
    .workplane()
    .pushPoints(boss_points)
    .hole(boss_inner_hole_diameter)
)