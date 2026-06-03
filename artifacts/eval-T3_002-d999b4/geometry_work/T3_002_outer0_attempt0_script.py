import cadquery as cq

# Parametric dimensions
xlen = 80.0
ylen = 50.0
zlen = 25.0
wall_thickness = 2.0
outer_fillet_radius = 8.0
hole_diameter = 3.2
hole_spacing_x = 64.0
hole_spacing_y = 34.0

# Create the outer solid box, centered on XY, bottom at Z=0
outer_solid = cq.Workplane("XY").rect(xlen, ylen).extrude(zlen)

# Fillet the 4 vertical corners (edges parallel to Z-axis)
outer_solid_filleted = outer_solid.edges("|Z").fillet(outer_fillet_radius)

# Shell the enclosure by removing the top face (+Z) and shelling inward
# This maintains the outer dimensions while creating a 2mm wall thickness
enclosure = outer_solid_filleted.faces(">Z").shell(-wall_thickness)

# Position the four mounting holes on the bottom face (<Z)
hole_positions = [
    (-hole_spacing_x / 2.0, -hole_spacing_y / 2.0),
    (hole_spacing_x / 2.0, -hole_spacing_y / 2.0),
    (hole_spacing_x / 2.0, hole_spacing_y / 2.0),
    (-hole_spacing_x / 2.0, hole_spacing_y / 2.0)
]

# Select the bottom face, create a workplane, and drill the mounting holes
result = enclosure.faces("<Z").workplane().pushPoints(hole_positions).hole(hole_diameter)