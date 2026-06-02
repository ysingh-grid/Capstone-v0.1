import cadquery as cq

# Parametric dimensions
base_diameter = 40.0
top_diameter = 20.0
height = 30.0

# Calculate radii
base_radius = base_diameter / 2.0
top_radius = top_diameter / 2.0

# Create the truncated cone (frustum) using the Solid.makeCone constructor
# This places the base at (0, 0, 0) and extends along the Z-axis by the height.
frustum_solid = cq.Solid.makeCone(
    radius1=base_radius,
    radius2=top_radius,
    height=height,
    pnt=(0, 0, 0),
    dir=(0, 0, 1)
)

# Wrap the solid in a Workplane object for the final result
result = cq.Workplane(obj=frustum_solid)