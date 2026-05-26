import cadquery as cq

# Parametric dimensions
base_diameter = 40.0
base_thickness = 3.0
hemisphere_radius = base_diameter / 2.0

# Create the circular base cylinder (Z = 0 to Z = 3)
base = cq.Workplane("XY").circle(base_diameter / 2.0).extrude(base_thickness)

# Create the top hemisphere (Z = 3 to Z = 23)
# To create a perfect hemisphere, we place a full sphere at Z = 3 and split it, keeping the top half.
hemisphere = (
    cq.Workplane("XY")
    .workplane(offset=base_thickness)
    .sphere(hemisphere_radius)
    .split(keepTop=True)
)

# Seamlessly union the base and the hemisphere
result = base.union(hemisphere)