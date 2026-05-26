import cadquery as cq

# Parametric variables
outer_diameter = 30.0
inner_diameter = 24.0
length = 80.0

outer_radius = outer_diameter / 2.0
inner_radius = inner_diameter / 2.0

# Create the outer cylinder centered on the XY plane
outer_cylinder = cq.Workplane("XY").cylinder(height=length, radius=outer_radius)

# Create the inner cylinder to be used as a cutting tool
inner_cylinder = cq.Workplane("XY").cylinder(height=length, radius=inner_radius)

# Subtract the inner cylinder from the outer cylinder to form the hollow tube
result = outer_cylinder.cut(inner_cylinder)