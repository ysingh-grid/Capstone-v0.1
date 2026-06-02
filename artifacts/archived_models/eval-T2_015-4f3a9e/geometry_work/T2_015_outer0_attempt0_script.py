import cadquery as cq

# Parametric dimensions
shaft_diameter = 20.0
shaft_radius = shaft_diameter / 2.0
shaft_length = 60.0

keyway_width = 6.0
keyway_depth = 3.0
keyway_bottom_x = shaft_radius - keyway_depth  # 7.0 mm

# Create the main upright cylinder shaft centered at the origin
shaft = cq.Workplane("XY").cylinder(height=shaft_length, radius=shaft_radius)

# Define the cutter box size and position
# We make the cutter slightly wider in the X direction to guarantee a clean cut outer boundary
cutter_x_size = 10.0
cutter_x_center = keyway_bottom_x + (cutter_x_size / 2.0)

# Create the keyway cutter tool and position it
cutter = (
    cq.Workplane("XY")
    .box(cutter_x_size, keyway_width, shaft_length)
    .translate((cutter_x_center, 0.0, 0.0))
)

# Subtract the cutter from the shaft to produce the keyway slot
result = shaft.cut(cutter)