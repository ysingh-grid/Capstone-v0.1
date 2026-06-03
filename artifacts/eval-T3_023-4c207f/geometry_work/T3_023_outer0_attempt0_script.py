import cadquery as cq

# Parametric dimensions
plate_length = 80.0
plate_width = 50.0
plate_thickness = 3.0

grid_spacing_x = 30.0
grid_spacing_y = 30.0
grid_count_x = 3
grid_count_y = 2

post_diameter = 8.0
post_height = 12.0
hole_diameter = 3.2

# 1. Create the rectangular base plate
# The plate is centered on XY, with Z starting at 0 and ending at plate_thickness (3mm)
result = cq.Workplane("XY").box(
    plate_length, plate_width, plate_thickness, centered=(True, True, False)
)

# 2. Create the 3x2 array of cylindrical standoff posts on the top face of the plate
# Select the top face of the plate (Z=3) to define the workplane
result = (
    result.faces(">Z")
    .workplane()
    # Generate a grid of points centered on the plate
    .rarray(grid_spacing_x, grid_spacing_y, grid_count_x, grid_count_y)
    # Draw the post profiles and extrude them upwards by 12mm (to Z=15)
    .circle(post_diameter / 2.0)
    .extrude(post_height)
)

# 3. Drill the M3 clearance pilot holes through the center of each post and the plate
# Select the top faces of the standoff posts (which are now the topmost Z faces at Z=15)
# and drill the through-holes
result = result.faces(">Z").workplane().hole(hole_diameter)