import cadquery as cq
import math

# --- Parametric dimensions ---
flange_diameter = 80.0
flange_radius = 40.0
flange_thickness = 16.0

center_bore_diameter = 32.0
center_bore_radius = 16.0

bolt_hole_diameter = 9.0
bolt_hole_radius = 4.5
bolt_hole_pcd_radius = 27.5
bolt_hole_count = 6
bolt_hole_start_angle_deg = 0.0

gasket_groove_inner_radius = 19.0
gasket_groove_outer_radius = 25.0
gasket_groove_depth = 2.0

# --- Step 1: Create the main flange disc ---
# Cylinder centered at origin, Z=0 to Z=16
result = (
    cq.Workplane("XY")
    .cylinder(flange_thickness, flange_radius, centered=(True, True, False))
)

# --- Step 2: Subtract the center bore (32mm diameter, through full thickness) ---
center_bore = (
    cq.Workplane("XY")
    .cylinder(flange_thickness, center_bore_radius, centered=(True, True, False))
)
result = result.cut(center_bore)

# --- Step 3: Subtract six bolt holes on a 55mm PCD ---
# Compute all bolt hole center positions
bolt_hole_positions = []
for i in range(bolt_hole_count):
    angle_deg = bolt_hole_start_angle_deg + i * 60.0
    angle_rad = math.radians(angle_deg)
    x = bolt_hole_pcd_radius * math.cos(angle_rad)
    y = bolt_hole_pcd_radius * math.sin(angle_rad)
    bolt_hole_positions.append((x, y))

# Create one compound tool cylinder for all bolt holes and subtract
for (x, y) in bolt_hole_positions:
    bolt_hole = (
        cq.Workplane("XY")
        .transformed(offset=(x, y, 0))
        .cylinder(flange_thickness, bolt_hole_radius, centered=(True, True, False))
    )
    result = result.cut(bolt_hole)

# --- Step 4: Subtract the gasket groove on the top face ---
# The groove is an annular ring between inner radius 19mm and outer radius 25mm,
# 2mm deep from the top face (Z=14 to Z=16).
# Implement as: subtract outer cylinder (r=25, h=2) then add back inner cylinder (r=19, h=2)

# Outer cylinder of groove (positioned at Z=14 to Z=16)
groove_outer = (
    cq.Workplane("XY")
    .transformed(offset=(0, 0, flange_thickness - gasket_groove_depth))
    .cylinder(gasket_groove_depth, gasket_groove_outer_radius, centered=(True, True, False))
)

# Inner cylinder to add back (fills the center of the groove cut)
groove_inner = (
    cq.Workplane("XY")
    .transformed(offset=(0, 0, flange_thickness - gasket_groove_depth))
    .cylinder(gasket_groove_depth, gasket_groove_inner_radius, centered=(True, True, False))
)

# Subtract outer, then union back the inner to create the ring groove
result = result.cut(groove_outer).union(groove_inner)