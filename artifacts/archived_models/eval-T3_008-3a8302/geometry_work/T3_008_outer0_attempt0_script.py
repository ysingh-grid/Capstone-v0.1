import math
import cadquery as cq

# Parametric Dimensions
bore_diameter = 8.0
bottom_journal_diameter = 15.0
bottom_journal_length = 20.0

gear_teeth_count = 20
gear_tip_radius = 22.0
gear_root_radius = 18.0
gear_face_width = 15.0

top_journal_diameter = 15.0
top_journal_length = 20.0

keyway_width = 3.0
keyway_depth = 3.0
keyway_start_radius = bore_diameter / 2.0  # 4.0 mm

# 1. Create the bottom journal (Z=0 to Z=20)
bottom_journal = (
    cq.Workplane("XY")
    .workplane(offset=0.0)
    .circle(bottom_journal_diameter / 2.0)
    .extrude(bottom_journal_length)
)

# 2. Create the integrated gear (Z=20 to Z=35) with a star-polygon profile
num_vertices = int(gear_teeth_count * 2)
gear_pts = []
for i in range(num_vertices):
    angle = i * (2.0 * math.pi / num_vertices)
    # Alternate between tip radius and root radius to form the teeth
    r = gear_tip_radius if (i % 2 == 0) else gear_root_radius
    x = r * math.cos(angle)
    y = r * math.sin(angle)
    gear_pts.append((x, y))

gear_solid = (
    cq.Workplane("XY")
    .workplane(offset=bottom_journal_length)
    .polyline(gear_pts)
    .close()
    .extrude(gear_face_width)
)

# 3. Create the top journal (Z=35 to Z=55)
top_journal = (
    cq.Workplane("XY")
    .workplane(offset=bottom_journal_length + gear_face_width)
    .circle(top_journal_diameter / 2.0)
    .extrude(top_journal_length)
)

# Combine the three shaft sections into a single solid
shaft_solid = bottom_journal.union(gear_solid).union(top_journal)

# 4. Create the central through-bore (Z=0 to Z=55)
total_length = bottom_journal_length + gear_face_width + top_journal_length
bore = (
    cq.Workplane("XY")
    .circle(bore_diameter / 2.0)
    .extrude(total_length)
)

# Subtract the bore from the shaft
shaft_with_bore = shaft_solid.cut(bore)

# 5. Create the keyway slot (Z=20 to Z=35, +X side, from X=4 to X=7)
keyway_x_center = keyway_start_radius + (keyway_depth / 2.0)  # 4.0 + 1.5 = 5.5
keyway = (
    cq.Workplane("XY")
    .workplane(offset=bottom_journal_length)
    .center(keyway_x_center, 0.0)
    .rect(keyway_depth, keyway_width)
    .extrude(gear_face_width)
)

# Cut the keyway from the main body
result = shaft_with_bore.cut(keyway)