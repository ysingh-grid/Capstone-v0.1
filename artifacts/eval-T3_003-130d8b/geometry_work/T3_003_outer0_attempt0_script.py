import cadquery as cq

# --- Parametric dimensions ---
outer_x = 70.0
outer_y = 50.0
outer_z = 30.0
fillet_r = 4.0
wall_t = 2.0
boss_od = 8.0
boss_hole_d = 3.0
boss_x = 27.0
boss_y = 17.0
boss_bottom_z = 2.0   # inner floor level
boss_top_z = 30.0     # rim height

# Step 1: Create solid box 70x50x30, centered in XY, base at Z=0
enclosure = (
    cq.Workplane("XY")
    .box(outer_x, outer_y, outer_z, centered=(True, True, False))
)

# Step 2: Fillet only the four vertical edges (parallel to Z-axis)
enclosure = enclosure.edges("|Z").fillet(fillet_r)

# Step 3: Shell open on top face (+Z), 2mm inward wall thickness
# Negative thickness = inward shell (preserves outer dims)
enclosure = enclosure.faces(">Z").shell(-wall_t)

# Step 4: Add four solid cylindrical screw bosses inside the enclosure
# Each boss: 8mm OD, from Z=2 (inner floor) to Z=30 (rim)
boss_height = boss_top_z - boss_bottom_z  # 28mm

boss_positions = [
    ( boss_x,  boss_y),
    (-boss_x,  boss_y),
    ( boss_x, -boss_y),
    (-boss_x, -boss_y),
]

for (bx, by) in boss_positions:
    boss = (
        cq.Workplane("XY")
        .workplane(offset=boss_bottom_z)
        .center(bx, by)
        .circle(boss_od / 2.0)
        .extrude(boss_height)
    )
    enclosure = enclosure.union(boss)

# Step 5: Cut 3mm through-holes through each boss and floor (Z=0 to Z=30)
# Use pushPoints on bottom face workplane and cut full depth
hole_points = [(bx, by) for (bx, by) in boss_positions]

enclosure = (
    enclosure
    .faces("<Z")
    .workplane()
    .pushPoints(hole_points)
    .hole(boss_hole_d)
)

result = enclosure