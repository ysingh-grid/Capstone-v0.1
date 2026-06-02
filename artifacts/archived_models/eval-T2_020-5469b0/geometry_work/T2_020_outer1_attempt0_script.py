import cadquery as cq

# ================== PARAMETRIC VARIABLES ==================
# Base Plate dimensions
base_width = 60.0       # X-direction
base_depth = 40.0       # Y-direction
base_thickness = 4.0    # Z-direction

# Vertical Wall dimensions
wall_width = 40.0       # X-direction
wall_height = 30.0      # Z-direction (rising from base top)
wall_thickness = 4.0    # Y-direction

# Hole specifications
base_hole_dia = 6.0
base_hole_x = 25.0      # Offset from X=0
base_hole_y = 20.0      # Y coordinate

wall_hole_dia = 5.0
wall_hole_x = 12.0      # Offset from X=0
wall_hole_z = 19.0      # Z coordinate (absolute)

# ================== GEOMETRY GENERATION ==================

# 1. Create the base plate
# Centered in X, starting at Y=0, Z=0
base = cq.Workplane("XY").box(
    base_width, base_depth, base_thickness, centered=(True, False, False)
)

# 2. Create the vertical wall
# Centered in X, starting at Y=0, rising from Z = base_thickness
wall = (
    cq.Workplane("XY")
    .workplane(offset=base_thickness)
    .box(wall_width, wall_thickness, wall_height, centered=(True, False, False))
)

# 3. Combine the base and wall into a single solid L-bracket
bracket = base.union(wall)

# 4. Create cylinders to cut the base plate holes (aligned along Z-axis)
base_hole_radius = base_hole_dia / 2.0
hole_base_left = (
    cq.Workplane("XY")
    .workplane(offset=base_thickness / 2.0)
    .center(-base_hole_x, base_hole_y)
    .cylinder(10.0, base_hole_radius)
)

hole_base_right = (
    cq.Workplane("XY")
    .workplane(offset=base_thickness / 2.0)
    .center(base_hole_x, base_hole_y)
    .cylinder(10.0, base_hole_radius)
)

# 5. Create cylinders to cut the vertical wall holes (aligned along Y-axis)
# The XZ workplane is at Y=0. A cylinder centered at Y=0 with length 20.0
# will extend from Y=-10.0 to Y=10.0, completely through the wall (Y=0..4).
wall_hole_radius = wall_hole_dia / 2.0
hole_wall_left = (
    cq.Workplane("XZ")
    .center(-wall_hole_x, wall_hole_z)
    .cylinder(20.0, wall_hole_radius)
)

hole_wall_right = (
    cq.Workplane("XZ")
    .center(wall_hole_x, wall_hole_z)
    .cylinder(20.0, wall_hole_radius)
)

# 6. Perform the subtraction to create the holes
result = (
    bracket
    .cut(hole_base_left)
    .cut(hole_base_right)
    .cut(hole_wall_left)
    .cut(hole_wall_right)
)