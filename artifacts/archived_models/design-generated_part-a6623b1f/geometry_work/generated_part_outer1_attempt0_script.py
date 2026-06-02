import cadquery as cq

# Parametric variables
total_height = 100.0       # Overall height of the I-beam profile (Y-axis)
total_width = 50.0         # Overall width of the I-beam flanges (X-axis)
flange_thickness = 37.5    # Thickness of the top and bottom flanges (adjusted to 37.5mm to allow 25mm web height with 100mm total height)
web_thickness = 4.0        # Thickness of the connecting web
length = 300.0             # Extrusion length along the Z-axis

# Derived dimensions
web_height = total_height - (2 * flange_thickness)  # Resolves to exactly 25.0mm

# Define the points for the right half of the I-beam profile (X >= 0)
# The origin (0,0) is at the center of the profile cross-section.
pts = [
    (0, total_height / 2.0),
    (total_width / 2.0, total_height / 2.0),
    (total_width / 2.0, total_height / 2.0 - flange_thickness),
    (web_thickness / 2.0, total_height / 2.0 - flange_thickness),
    (web_thickness / 2.0, -total_height / 2.0 + flange_thickness),
    (total_width / 2.0, -total_height / 2.0 + flange_thickness),
    (total_width / 2.0, -total_height / 2.0),
    (0, -total_height / 2.0)
]

# Create the profile on the XY workplane, mirror it about the Y-axis 
# to make it symmetric, and extrude it along the Z-axis.
result = (
    cq.Workplane("XY")
    .polyline(pts)
    .mirrorY()
    .extrude(length)
)