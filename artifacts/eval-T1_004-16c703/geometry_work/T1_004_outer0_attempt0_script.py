import cadquery as cq

# Parameters
base_diameter = 30.0
base_radius = base_diameter / 2.0
height = 45.0

# Create a solid cone using the CadQuery Solid.makeCone primitive
# radius1 is the base radius, radius2 is the tip radius (0 for a sharp cone)
cone_solid = cq.Solid.makeCone(base_radius, 0.0, height)

# Wrap the solid in a Workplane container and assign to result
result = cq.Workplane("XY").add(cone_solid)