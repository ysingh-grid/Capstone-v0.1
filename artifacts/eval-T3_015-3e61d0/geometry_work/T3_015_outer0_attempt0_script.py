import cadquery as cq

# --- Parametric Dimensions ---
main_length = 100.0
main_outer_diameter = 30.0
main_inner_diameter = 24.0

branch_height_from_center = 50.0
branch_outer_diameter = 30.0
branch_inner_diameter = 24.0

# Calculate radii
main_outer_radius = main_outer_diameter / 2.0
main_inner_radius = main_inner_diameter / 2.0
branch_outer_radius = branch_outer_diameter / 2.0
branch_inner_radius = branch_inner_diameter / 2.0

# --- Outer Solid Construction ---
# Create the main pipe cylinder centered along the X axis
# Start at YZ plane, offset by -50mm, and extrude 100mm along the X direction (+X)
outer_main = (
    cq.Workplane("YZ")
    .workplane(offset=-main_length / 2.0)
    .circle(main_outer_radius)
    .extrude(main_length)
)

# Create the branch pipe cylinder centered at X=0, Y=0, extending from Z=0 to Z=50
outer_branch = (
    cq.Workplane("XY")
    .circle(branch_outer_radius)
    .extrude(branch_height_from_center)
)

# Combine the outer volumes
outer_tee = outer_main.union(outer_branch)

# --- Inner Cutout Construction ---
# Create the main pipe inner cylinder (made slightly longer to ensure clean open ends)
inner_main = (
    cq.Workplane("YZ")
    .workplane(offset=-(main_length / 2.0 + 1.0))
    .circle(main_inner_radius)
    .extrude(main_length + 2.0)
)

# Create the branch pipe inner cylinder (made slightly taller to ensure clean open top)
inner_branch = (
    cq.Workplane("XY")
    .circle(branch_inner_radius)
    .extrude(branch_height_from_center + 1.0)
)

# Combine the inner volumes to ensure a continuous internal cavity
inner_tee = inner_main.union(inner_branch)

# --- Final T-Pipe Assembly ---
# Hollow out the pipe tee by subtracting the inner cavity from the outer solid
result = outer_tee.cut(inner_tee)