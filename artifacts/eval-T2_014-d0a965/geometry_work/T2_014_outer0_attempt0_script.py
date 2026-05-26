import cadquery as cq

# Parametric dimensions
length_x = 80.0          # Total length of the tube along the X-axis
outer_width_y = 30.0     # Outer width of the cross-section along the Y-axis
outer_height_z = 40.0    # Outer height of the cross-section along the Z-axis
wall_thickness = 2.0     # Wall thickness on all four sides

# Derived dimensions for the inner hollow cavity
inner_width_y = outer_width_y - (2.0 * wall_thickness)
inner_height_z = outer_height_z - (2.0 * wall_thickness)

# Make the cutting solid slightly longer in X to ensure a clean, manifold cut through the ends
cut_length_x = length_x + 10.0

# Create the outer rectangular box centered at the origin
outer_box = cq.Workplane("XY").box(length_x, outer_width_y, outer_height_z, centered=(True, True, True))

# Create the inner rectangular box centered at the origin
inner_box = cq.Workplane("XY").box(cut_length_x, inner_width_y, inner_height_z, centered=(True, True, True))

# Subtract the inner box from the outer box to form the hollow tube open on both ends
result = outer_box.cut(inner_box)