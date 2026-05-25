import cadquery as cq

# ==================== PARAMETERS ====================
# Overall desk dimensions
desk_width = 1200.0
desk_depth = 600.0
desk_height = 750.0
tabletop_thickness = 20.0

# Support panel (left leg) dimensions
leg_thickness = 20.0
cabinet_height = desk_height - tabletop_thickness + 1.0  # 1mm overlap with tabletop

# Cabinet dimensions (on the right side)
cabinet_width = 400.0
cabinet_depth = 581.0  # 1mm overlap with drawer fronts
plinth_height = 50.0

# Modesty panel dimensions
modesty_thickness = 20.0
modesty_height = 400.0
modesty_z_start = 300.0

# Drawer dimensions
drawer_front_thickness = 20.0
drawer_width = cabinet_width - 16.0  # Small gap on the sides
drawer_height = 210.0
drawer_z_centers = [155.0, 385.0, 615.0]  # Evenly spaced drawer centers

# Handle dimensions
handle_width = 150.0
handle_thickness = 15.0
handle_height = 15.0

# ==================== MODEL GENERATION ====================

# 1. Tabletop (positioned at the top)
tabletop = (
    cq.Workplane("XY")
    .workplane(offset=desk_height - tabletop_thickness)
    .box(desk_width, desk_depth, tabletop_thickness, centered=(True, True, False))
)
# Beautify tabletop with a small chamfer on top edges
tabletop = tabletop.faces(">Z").edges().chamfer(2.0)

# 2. Left Support Panel (Leg)
left_leg = (
    cq.Workplane("XY")
    .box(leg_thickness, desk_depth, cabinet_height, centered=(True, True, False))
    .translate((-desk_width / 2 + leg_thickness / 2, 0, 0))
)

# 3. Cabinet Outer Housing (Right side)
cab_x_center = desk_width / 2 - cabinet_width / 2
cab_y_center = -desk_depth / 2 + cabinet_depth / 2

cabinet_body = (
    cq.Workplane("XY")
    .box(cabinet_width, cabinet_depth, cabinet_height, centered=(True, True, False))
    .translate((cab_x_center, cab_y_center, 0))
)

# 4. Modesty / Stability Panel (Back side)
# Overlap by 1mm on left leg and cabinet body for robust Union
modesty_length = desk_width - leg_thickness - cabinet_width + 2.0
mod_x_center = -desk_width / 2 + leg_thickness + (modesty_length - 2.0) / 2
mod_y_center = -desk_depth / 2 + modesty_thickness / 2

modesty_panel = (
    cq.Workplane("XY")
    .workplane(offset=modesty_z_start)
    .box(modesty_length, modesty_thickness, modesty_height, centered=(True, True, False))
    .translate((mod_x_center, mod_y_center, 0))
)

# 5. Drawer Fronts & Handles
drawers = []
handles = []

drawer_y_center = desk_depth / 2 - drawer_front_thickness / 2
handle_y_center = desk_depth / 2 + handle_thickness / 2 - 1.0  # 1mm overlap with drawer front

for z_center in drawer_z_centers:
    # Drawer front (using simple chamfer to prevent execution timeout)
    df = (
        cq.Workplane("XY")
        .workplane(offset=z_center - drawer_height / 2)
        .box(drawer_width, drawer_front_thickness, drawer_height, centered=(True, True, False))
        .translate((cab_x_center, drawer_y_center, 0))
    )
    df = df.faces(">Y").edges().chamfer(1.5)
    drawers.append(df)
    
    # Drawer pull handle (plain box to avoid complex fillet calculation timeouts)
    handle = (
        cq.Workplane("XY")
        .workplane(offset=z_center - handle_height / 2)
        .box(handle_width, handle_thickness, handle_height, centered=(True, True, False))
        .translate((cab_x_center, handle_y_center, 0))
    )
    handles.append(handle)

# ==================== ASSEMBLY (UNION) ====================
# Combine all individual solids into the final result
result = tabletop
result = result.union(left_leg)
result = result.union(cabinet_body)
result = result.union(modesty_panel)

for df in drawers:
    result = result.union(df)

for h in handles:
    result = result.union(h)