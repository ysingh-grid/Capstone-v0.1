import cadquery as cq

# --- Parametric Dimensions ---
plate_length_x = 80.0
plate_width_y = 50.0
plate_thickness_z = 3.0

post_diameter = 8.0
post_radius = post_diameter / 2.0
post_height = 12.0
post_z_start = plate_thickness_z  # Z=3
post_z_end = post_z_start + post_height  # Z=15

pilot_hole_diameter = 3.2
pilot_hole_radius = pilot_hole_diameter / 2.0
pilot_hole_depth = 15.0  # Full height, Z=0 to Z=15

# Array layout: 3 columns in X, 2 rows in Y
# X positions: -30, 0, +30 (spacing 30mm, centered at origin)
# Y positions: -15, +15 (spacing 30mm, centered at origin)
array_spacing_x = 30.0
array_spacing_y = 30.0

post_positions = []
x_offsets = [-array_spacing_x, 0.0, array_spacing_x]
y_offsets = [-array_spacing_y / 2.0, array_spacing_y / 2.0]

for x in x_offsets:
    for y in y_offsets:
        post_positions.append((x, y))

# --- Step 1: Create the base plate ---
# Centered at origin, lying flat on XY, from Z=0 to Z=3
result = (
    cq.Workplane("XY")
    .box(plate_length_x, plate_width_y, plate_thickness_z, centered=(True, True, False))
)

# --- Step 2: Add standoff posts on top face ---
# Each post is a cylinder of radius 4mm, height 12mm, standing from Z=3 to Z=15
# We create each post as a separate solid and union it with the base plate
for (px, py) in post_positions:
    post = (
        cq.Workplane("XY")
        .workplane(offset=post_z_start)
        .center(px, py)
        .cylinder(post_height, post_radius, centered=(True, True, False))
    )
    result = result.union(post)

# --- Step 3: Subtract pilot holes through full height ---
# Each pilot hole is 3.2mm diameter, running from Z=0 to Z=15 (full depth)
# Use pushPoints on the bottom face workplane to drill all holes at once
result = (
    result
    .faces("<Z")
    .workplane()
    .pushPoints(post_positions)
    .hole(pilot_hole_diameter, pilot_hole_depth)
)