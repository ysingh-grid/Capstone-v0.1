import cadquery as cq
import math

# Parametric dimensions
bottom_journal_dia = 15.0
bottom_journal_len = 20.0
top_journal_dia = 15.0
top_journal_len = 20.0
gear_seat_len = 15.0
gear_teeth = 20
gear_tip_r = 22.0
gear_root_r = 18.0
bore_dia = 8.0
keyway_w = 3.0
keyway_depth = 3.0

# 1. Create the bottom journal cylinder (Z = 0 to 20)
result = cq.Workplane("XY").circle(bottom_journal_dia / 2.0).extrude(bottom_journal_len)

# 2. Generate the star-polygon vertices for the integrated gear
pts = []
num_vertices = 2 * gear_teeth
for i in range(num_vertices):
    angle = i * (2 * math.pi / num_vertices)
    r = gear_tip_r if i % 2 == 0 else gear_root_r
    pts.append((r * math.cos(angle), r * math.sin(angle)))

# 3. Create the integrated gear section (Z = 20 to 35)
gear_sketch = cq.Sketch().polygon(pts)
gear = (
    cq.Workplane("XY")
    .workplane(offset=bottom_journal_len)
    .placeSketch(gear_sketch)
    .extrude(gear_seat_len)
)

# Union the bottom journal and the gear section
result = result.union(gear)

# 4. Create the top journal cylinder (Z = 35 to 55)
top_journal = (
    cq.Workplane("XY")
    .workplane(offset=bottom_journal_len + gear_seat_len)
    .circle(top_journal_dia / 2.0)
    .extrude(top_journal_len)
)

# Union the top journal
result = result.union(top_journal)

# 5. Cut the central through-bore along the entire Z axis
result = result.faces(">Z").workplane().hole(bore_dia)

# 6. Cut the keyway slot in the gear section (Z = 20 to 35) on the +X side
# To prevent a thin wall from forming due to the bore's curvature, the cut box
# starts deeper inside the bore at X = 2.0 and extends to the target outer radius of X = 7.0.
keyway_box_len = 5.0  # Spans 5mm from X=2.0 to X=7.0
keyway_x_center = 4.5
keyway = (
    cq.Workplane("XY")
    .workplane(offset=bottom_journal_len)
    .center(keyway_x_center, 0.0)
    .rect(keyway_box_len, keyway_w)
    .extrude(gear_seat_len)
)

result = result.cut(keyway)