import cadquery as cq

# --- Parametric dimensions ---
outer_x = 70.0
outer_y = 50.0
outer_z = 30.0
wall_thickness = 2.0
fillet_radius = 4.0

boss_diameter = 8.0
boss_z_bottom = 2.0  # sits on inner floor top surface
boss_z_top = 30.0    # flush with rim
boss_x_offset = 27.0
boss_y_offset = 17.0

hole_diameter = 3.0

# --- Step 1: Create the outer box, centered in XY, base at Z=0 ---
enclosure = (
    cq.Workplane("XY")
    .box(outer_x, outer_y, outer_z, centered=(True, True, False))
)

# --- Step 2: Fillet only the four vertical edges (parallel to Z) ---
enclosure = enclosure.edges("|Z").fillet(fillet_radius)

# --- Step 3: Shell inward 2mm, removing the top face ---
enclosure = enclosure.faces(">Z").shell(-wall_thickness)

# --- Step 4: Create four boss cylinders and union them to the enclosure ---
boss_height = boss_z_top - boss_z_bottom  # 28mm

boss_positions = [
    ( boss_x_offset,  boss_y_offset),
    (-boss_x_offset,  boss_y_offset),
    ( boss_x_offset, -boss_y_offset),
    (-boss_x_offset, -boss_y_offset),
]

for (bx, by) in boss_positions:
    boss = (
        cq.Workplane("XY")
        .workplane(offset=boss_z_bottom)
        .center(bx, by)
        .circle(boss_diameter / 2.0)
        .extrude(boss_height)
    )
    enclosure = enclosure.union(boss)

# --- Step 5: Cut four vertical through-holes (3mm dia) through bosses and floor ---
# Start below Z=0 and extrude upward past Z=30 to ensure full penetration
holes_tool = (
    cq.Workplane("XY")
    .workplane(offset=-1.0)  # start 1mm below the bottom
    .pushPoints(boss_positions)
    .circle(hole_diameter / 2.0)
    .extrude(outer_z + 2.0)  # extends from Z=-1 to Z=31, cutting through floor and bosses
)

enclosure = enclosure.cut(holes_tool)

# --- Assign final result ---
result = enclosure