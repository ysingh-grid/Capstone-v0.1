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
# The YZ plane is at X=0. Cutting blindly in the +X direction cuts through only the +X wall.
result = (
    result.workplane(plane="YZ")
    .circle(set_screw_diameter / 2.0)
    .cutBlind(outer_diameter)
)