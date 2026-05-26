import cadquery as cq

# Parameters
length = 80.0             # Length along the X-axis
total_height = 40.0       # Total height along the Z-axis
flange_width = 30.0       # Width of the horizontal flange along the Y-axis
flange_thickness = 3.0    # Thickness of the flange along the Z-axis
web_thickness = 3.0       # Thickness of the vertical web along the Y-axis

# Calculated dimensions
web_height = total_height - flange_thickness # Height of the web (37.0mm)

# Create the vertical web sitting on the XY plane (Z=0 to Z=37)
# Centered on X and Y, flat on the Z-plane (centered=(True, True, False))
web = cq.Workplane("XY").box(
    length, 
    web_thickness, 
    web_height, 
    centered=(True, True, False)
)

# Create the horizontal flange sitting on top of the web (Z=37 to Z=40)
# Offset the workplane to Z=37, then build the flange upwards
flange = (
    cq.Workplane("XY")
    .workplane(offset=web_height)
    .box(
        length, 
        flange_width, 
        flange_thickness, 
        centered=(True, True, False)
    )
)

# Union the web and flange to create a single solid T-beam
result = web.union(flange)