import cadquery as cq

# ================== PARAMETRIC VARIABLES ==================
# Overall bounding box dimensions
flange_width_x = 70.0
flange_length_y = 50.0
flange_thickness_z = 3.0

# Transition section dimensions
transition_start_width_x = 60.0
transition_start_length_y = 40.0
transition_end_diameter = 30.0
transition_height = 50.0  # From Z=3 to Z=53

# Cylindrical neck dimensions
neck_diameter = 30.0
neck_height = 10.0  # From Z=53 to Z=63

# Hollow duct properties
wall_thickness = 2.0
flange_opening_x = 60.0
flange_opening_y = 40.0

# Derived dimensions for the inner transition (to maintain wall thickness)
inner_transition_start_x = transition_start_width_x - 2 * wall_thickness
inner_transition_start_y = transition_start_length_y - 2 * wall_thickness
inner_transition_end_dia = transition_end_diameter - 2 * wall_thickness

# ================== OUTER SOLID GENERATION ==================
# Create the rectangular mounting flange (Z: 0 to 3)
outer_flange = (
    cq.Workplane("XY")
    .box(flange_width_x, flange_length_y, flange_thickness_z, centered=(True, True, False))
)

# Create the smooth outer loft transition (Z: 3 to 53)
outer_transition = (
    cq.Workplane("XY")
    .workplane(offset=flange_thickness_z)
    .rect(transition_start_width_x, transition_start_length_y)
    .workplane(offset=transition_height)
    .circle(transition_end_diameter / 2.0)
    .loft(ruled=False)
)

# Create the outer cylindrical neck (Z: 53 to 63)
outer_neck = (
    cq.Workplane("XY")
    .workplane(offset=flange_thickness_z + transition_height)
    .circle(transition_end_diameter / 2.0)
    .extrude(neck_height)
)

# Combine all outer shapes into a single solid
outer_solid = outer_flange.union(outer_transition).union(outer_neck)

# ================== INNER VOID GENERATION ==================
# Create the flange opening. Overlaps slightly with Z=3 to ensure a clean union.
inner_flange = (
    cq.Workplane("XY")
    .workplane(offset=-1.0)
    .box(flange_opening_x, flange_opening_y, flange_thickness_z + 1.05, centered=(True, True, False))
)

# Create the inner loft transition (Z: 3 to 53)
inner_transition = (
    cq.Workplane("XY")
    .workplane(offset=flange_thickness_z)
    .rect(inner_transition_start_x, inner_transition_start_y)
    .workplane(offset=transition_height)
    .circle(inner_transition_end_dia / 2.0)
    .loft(ruled=False)
)

# Create the inner cylindrical neck. Overlaps slightly to ensure clean cuts.
inner_neck = (
    cq.Workplane("XY")
    .workplane(offset=flange_thickness_z + transition_height - 0.1)
    .circle(inner_transition_end_dia / 2.0)
    .extrude(neck_height + 1.2)
)

# Combine all inner shapes into a single void solid
inner_solid = inner_flange.union(inner_transition).union(inner_neck)

# ================== FINAL SUBTRACTION ==================
# Subtract the inner void from the outer solid to create the hollow duct adapter
result = outer_solid.cut(inner_solid)