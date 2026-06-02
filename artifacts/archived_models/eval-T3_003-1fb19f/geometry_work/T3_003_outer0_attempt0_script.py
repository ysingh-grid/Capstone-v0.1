import cadquery as cq

# --- PARAMETERS ---
# Overall enclosure dimensions
xlen = 70.0
ylen = 50.0
zlen = 30.0

# Shell and fillets
wall_thickness = 2.0
floor_thickness = 2.0
outer_fillet_radius = 4.0

# Screw bosses
boss_outer_diameter = 8.0
boss_hole_diameter = 3.0
boss_pos_x = 27.0
boss_pos_y = 17.0

# Positions of the 4 screw bosses (symmetrical in XY)
boss_positions = [
    (boss_pos_x, boss_pos_y),
    (boss_pos_x, -boss_pos_y),
    (-boss_pos_x, boss_pos_y),
    (-boss_pos_x, -boss_pos_y)
]

# --- GEOMETRY GENERATION ---

# 1. Create the outer box centered in X and Y, sitting on Z=0
outer_box = (
    cq.Workplane("XY")
    .box(xlen, ylen, zlen, centered=(True, True, False))
)

# 2. Fillet the 4 vertical edges (edges parallel to Z)
outer_box = outer_box.edges("|Z").fillet(outer_fillet_radius)

# 3. Hollow out the box (shell inward 2mm) by removing the top face (+Z)
enclosure = outer_box.faces(">Z").shell(-wall_thickness)

# 4. Create the solid cylindrical bosses
# These start at the inner floor (Z = floor_thickness) and extend to the rim (Z = zlen)
boss_height = zlen - floor_thickness
bosses = (
    cq.Workplane("XY")
    .workplane(offset=floor_thickness)
    .pushPoints(boss_positions)
    .circle(boss_outer_diameter / 2.0)
    .extrude(boss_height)
)

# Combine the bosses with the main shelled enclosure
enclosure = enclosure.union(bosses)

# 5. Create through-holes that run from Z=0 to Z=zlen
holes = (
    cq.Workplane("XY")
    .pushPoints(boss_positions)
    .circle(boss_hole_diameter / 2.0)
    .extrude(zlen)
)

# Cut the through-holes from the combined enclosure body
result = enclosure.cut(holes)