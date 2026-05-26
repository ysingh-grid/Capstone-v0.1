import cadquery as cq

# Parametric dimensions
length = 100.0          # along X axis
height = 40.0           # total height along Z axis
flange_width = 20.0     # flange width along Y axis
flange_thickness = 3.0  # thickness of both top and bottom flanges
web_thickness = 2.0     # thickness of the vertical web

# Calculate web height (total height minus the two flanges)
web_height = height - (2.0 * flange_thickness)

# Create the top flange (centered at Z = 18.5)
top_flange = (
    cq.Workplane("XY")
    .workplane(offset=(height / 2.0 - flange_thickness / 2.0))
    .box(length, flange_width, flange_thickness, centered=(True, True, True))
)

# Create the bottom flange (centered at Z = -18.5)
bottom_flange = (
    cq.Workplane("XY")
    .workplane(offset=-(height / 2.0 - flange_thickness / 2.0))
    .box(length, flange_width, flange_thickness, centered=(True, True, True))
)

# Create the vertical web (centered at Z = 0)
web = (
    cq.Workplane("XY")
    .box(length, web_thickness, web_height, centered=(True, True, True))
)

# Union the components to form a single solid I-beam
result = top_flange.union(bottom_flange).union(web)