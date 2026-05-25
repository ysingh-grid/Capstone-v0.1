import cadquery as cq

# Parametric dimensions
table_width = 1200.0  # X-axis
table_depth = 600.0   # Y-axis
table_thickness = 25.0
leg_height = 725.0
leg_width = 40.0
leg_inset = 20.0

# Calculate leg positions relative to the center origin
leg_x_pos = (table_width / 2.0) - leg_inset - (leg_width / 2.0)
leg_y_pos = (table_depth / 2.0) - leg_inset - (leg_width / 2.0)

# Leg centers on the XY plane
leg_centers = [
    (leg_x_pos, leg_y_pos),
    (leg_x_pos, -leg_y_pos),
    (-leg_x_pos, leg_y_pos),
    (-leg_x_pos, -leg_y_pos)
]

# Create the 4 legs starting at Z=0 and extruding UP to leg_height
legs = (
    cq.Workplane("XY")
    .pushPoints(leg_centers)
    .rect(leg_width, leg_width)
    .extrude(leg_height)
)

# Create the tabletop at Z = leg_height
tabletop = (
    cq.Workplane("XY")
    .workplane(offset=leg_height)
    .box(table_width, table_depth, table_thickness, centered=(True, True, False))
)

# Combine legs and tabletop into a single solid
result = legs.union(tabletop)