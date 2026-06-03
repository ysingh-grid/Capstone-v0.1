import cadquery as cq

# Parameters
outer_length = 60.0
outer_width = 40.0
outer_height = 30.0
wall_thickness = 2.0
outer_radius = 5.0
inner_radius = outer_radius - wall_thickness  # 3.0

# Create the outer solid box, centered in X and Y, sitting on the XY plane (Z starts at 0)
outer_body = (
    cq.Workplane("XY")
    .box(outer_length, outer_width, outer_height, centered=(True, True, False))
    .edges("|Z")
    .fillet(outer_radius)
)

# Create the inner cavity solid to subtract
# Sits on a workplane offset by wall_thickness (Z = 2.0), extending to the top (Z = 30.0)
inner_cavity = (
    cq.Workplane("XY")
    .workplane(offset=wall_thickness)
    .box(
        outer_length - 2.0 * wall_thickness,
        outer_width - 2.0 * wall_thickness,
        outer_height - wall_thickness,
        centered=(True, True, False)
    )
    .edges("|Z")
    .fillet(inner_radius)
)

# Perform subtraction to create the final open-top container
result = outer_body.cut(inner_cavity)