import cadquery as cq

# Parametric dimensions
OD = 30.0          # outer diameter
ID = 24.0          # inner diameter
OR = OD / 2.0      # outer radius = 15mm
IR = ID / 2.0      # inner radius = 12mm
WALL = 3.0         # wall thickness

RUN_LENGTH = 100.0  # main pipe length along X
BRANCH_LENGTH = 50.0  # branch pipe length along +Z

# --- Step 1: Create outer solid of run pipe (cylinder along X axis) ---
# CadQuery cylinders default along Z, so we rotate to align with X axis
run_outer = (
    cq.Workplane("YZ")
    .cylinder(RUN_LENGTH, OR, centered=(True, True, True))
)

# --- Step 2: Create outer solid of branch pipe (cylinder along +Z axis, from Z=0 to Z=50) ---
# Branch starts at Z=0 and goes to Z=50, so center is at Z=25
branch_outer = (
    cq.Workplane("XY")
    .workplane(offset=25.0)
    .cylinder(BRANCH_LENGTH, OR, centered=(True, True, True))
)

# --- Step 3: Union outer solids ---
outer_union = run_outer.union(branch_outer)

# --- Step 4: Create inner hollow of run pipe (cylinder along X axis) ---
run_inner = (
    cq.Workplane("YZ")
    .cylinder(RUN_LENGTH, IR, centered=(True, True, True))
)

# --- Step 5: Create inner hollow of branch pipe (cylinder along +Z axis) ---
# Extend downward past the run pipe inner radius to ensure full T-channel connectivity
# Start at Z = -IR (= -12mm) to fully penetrate the run pipe interior
branch_inner_height = BRANCH_LENGTH + IR  # 50 + 12 = 62mm
branch_inner_center_z = (BRANCH_LENGTH - IR) / 2.0  # center between Z=-12 and Z=50: (50-12)/2 = 19mm

branch_inner = (
    cq.Workplane("XY")
    .workplane(offset=branch_inner_center_z)
    .cylinder(branch_inner_height, IR, centered=(True, True, True))
)

# --- Step 6: Union inner hollow cylinders ---
inner_union = run_inner.union(branch_inner)

# --- Step 7: Subtract unified inner hollow from unified outer solid ---
result = outer_union.cut(inner_union)