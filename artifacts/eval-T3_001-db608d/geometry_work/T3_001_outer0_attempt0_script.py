import cadquery as cq

# Parametric dimensions
width = 60.0          # X-dimension of the container
length = 40.0         # Y-dimension of the container
height = 30.0         # Z-dimension of the container
wall_thickness = 2.0  # Thickness of the walls and floor
outer_radius = 5.0    # Radius of outer vertical corners
inner_radius = 3.0    # Radius of inner vertical corners (outer_radius - wall_thickness)

# Create the outer solid box, centered on X/Y and resting on the XY plane (Z=0 to Z=30)
outer_box = (
    cq.Workplane("XY")
    .box(width, length, height, centered=(True, True, False))
    .edges("|Z")
    .fillet(outer_radius)
)

# Create the inner cavity to be subtracted
# Start at Z = wall_thickness to preserve the bottom floor
# The height is set to 'height' so it extends beyond the top of the outer box (Z=32) for a clean cut
cavity_width = width - 2 * wall_thickness
cavity_length = length - 2 * wall_thickness
cavity_height = height

inner_cavity = (
    cq.Workplane("XY")
    .workplane(offset=wall_thickness)
    .box(cavity_width, cavity_length, cavity_height, centered=(True, True, False))
    .edges("|Z")
    .fillet(inner_radius)
)

# Cut the cavity from the outer solid to yield the open-top container
result = outer_box.cut(inner_cavity)