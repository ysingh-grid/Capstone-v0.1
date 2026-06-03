import cadquery as cq

# Parametric Dimensions
box_x = 70.0
box_y = 50.0
box_z = 30.0
fillet_r = 4.0
wall_thickness = 2.0

boss_dia = 8.0
boss_r = boss_dia / 2.0
boss_pos_x = 27.0
boss_pos_y = 17.0

hole_dia = 3.0
hole_r = hole_dia / 2.0

# Symmetry coordinates for the 4 bosses/holes
points = [
    (boss_pos_x, boss_pos_y),
    (-boss_pos_x, boss_pos_y),
    (-boss_pos_x, -boss_pos_y),
    (boss_pos_x, -boss_pos_y)
]

# 1. Create the outer box (centered in XY, base at Z=0)
box = (
    cq.Workplane("XY")
    .box(box_x, box_y, box_z, centered=(True, True, False))
)

# 2. Fillet the 4 vertical edges
box = box.edges("|Z").fillet(fillet_r)

# 3. Shell the box inward (removes top face at Z=30, wall thickness 2mm)
# The inner floor is now at Z = 2.0
enclosure = box.faces(">Z").shell(-wall_thickness)

# 4. Create the solid cylindrical bosses standing from Z=2 to Z=30
bosses = (
    cq.Workplane("XY")
    .workplane(offset=wall_thickness)
    .pushPoints(points)
    .circle(boss_r)
    .extrude(box_z - wall_thickness)
)

# Combine the enclosure body and the solid bosses
body_with_bosses = enclosure.union(bosses)

# 5. Create through-holes from Z=0 to Z=30
holes = (
    cq.Workplane("XY")
    .workplane(offset=0.0)
    .pushPoints(points)
    .circle(hole_r)
    .extrude(box_z)
)

# Cut the holes from the combined body to finish the part
result = body_with_bosses.cut(holes)