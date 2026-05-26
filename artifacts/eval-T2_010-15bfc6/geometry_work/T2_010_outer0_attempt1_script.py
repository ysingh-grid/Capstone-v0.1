import cadquery as cq

# Parametric variables
outer_diameter = 25.0
inner_diameter = 15.0
height = 12.0
set_screw_diameter = 5.0

# Step 1: Create the main cylindrical collar body
# By default, cylinder() is centered at the origin, spanning from Z = -6.0 to Z = 6.0
result = cq.Workplane("XY").cylinder(height, outer_diameter / 2.0)

# Step 2: Cut the coaxial central bore
result = result.faces(">Z").workplane().hole(inner_diameter)

# Step 3: Drill the radial set screw hole along the X-axis through one wall
# We create a separate cylinder representing the hole on the YZ plane and cut it.
# This starts at X=0 and extrudes in the +X direction, cutting only the +X wall.
hole = (
    cq.Workplane("YZ")
    .circle(set_screw_diameter / 2.0)
    .extrude(outer_diameter)
)

result = result.cut(hole)