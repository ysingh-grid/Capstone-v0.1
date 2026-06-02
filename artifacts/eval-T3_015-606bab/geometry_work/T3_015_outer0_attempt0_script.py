import cadquery as cq

# Parameters
od = 30.0          # outer diameter
id_ = 24.0         # inner diameter
wall = 3.0         # wall thickness
main_len = 100.0   # main pipe length along X
branch_len = 50.0  # branch pipe length along +Z

or_ = od / 2.0     # outer radius = 15mm
ir_ = id_ / 2.0    # inner radius = 12mm

# Step 1: Create outer solid of main pipe
# Cylinder along X axis, length 100mm, centered at origin
main_outer = (
    cq.Workplane("YZ")
    .cylinder(main_len, or_, direct=(1, 0, 0), centered=(True, True, True))
)

# Step 2: Create outer solid of branch pipe
# Cylinder along +Z axis, from Z=0 to Z=50 (center at Z=25)
branch_outer = (
    cq.Workplane("XY")
    .workplane(offset=branch_len / 2.0)
    .cylinder(branch_len, or_, direct=(0, 0, 1), centered=(True, True, True))
)

# Step 3: Union the two outer cylinders
outer_union = main_outer.union(branch_outer)

# Step 4: Create inner hollow of main pipe (slightly longer for clean boolean)
main_inner = (
    cq.Workplane("YZ")
    .cylinder(main_len + 2.0, ir_, direct=(1, 0, 0), centered=(True, True, True))
)

# Step 5: Create inner hollow of branch pipe (slightly longer for clean boolean)
# Extend slightly below Z=0 to ensure clean intersection with main bore
branch_inner = (
    cq.Workplane("XY")
    .workplane(offset=branch_len / 2.0)
    .cylinder(branch_len + 2.0, ir_, direct=(0, 0, 1), centered=(True, True, True))
)

# Step 6: Union the two inner hollows to form T-shaped void
inner_union = main_inner.union(branch_inner)

# Step 7: Subtract T-shaped void from outer union
result = outer_union.cut(inner_union)