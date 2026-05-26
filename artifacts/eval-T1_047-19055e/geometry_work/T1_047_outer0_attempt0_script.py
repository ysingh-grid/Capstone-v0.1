import cadquery as cq

# Parametric dimensions
base_diameter = 60.0
top_diameter = 40.0
height = 35.0

# Calculate radii
base_radius = base_diameter / 2.0
top_radius = top_diameter / 2.0

# Generate the truncated cone (frustum) solid using CadQuery's built-in Solid generator
cone_solid = cq.Solid.makeCone(base_radius, top_radius, height)

# Wrap the solid into a Workplane object aligned with the XY plane
result = cq.Workplane("XY").add(cone_solid)