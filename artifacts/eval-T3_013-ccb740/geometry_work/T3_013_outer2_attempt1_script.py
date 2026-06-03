import cadquery as cq

# Define parametric variables
bend_radius = 40.0
outer_diameter = 20.0
inner_diameter = 16.0
outer_radius = outer_diameter / 2.0
inner_radius = inner_diameter / 2.0

# Create the sweep path in the XZ plane
path = cq.Workplane("XZ").moveTo(0, 0).radiusArc((bend_radius, bend_radius), -bend_radius)

# Create the outer and inner solid shapes separately
outer = cq.Workplane("XY").circle(outer_radius).sweep(path)
inner = cq.Workplane("XY").circle(inner_radius).sweep(path)

# Cut the inner from the outer to create the hollow pipe
result = outer.cut(inner)