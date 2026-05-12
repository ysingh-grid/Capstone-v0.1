import cadquery as cq

# Parametric dimensions
plate_length = 60.0   # X dimension (mm)
plate_width  = 40.0   # Y dimension (mm)
plate_thickness = 10.0  # Z dimension (mm)

hole_diameter = 5.0   # M5 hole diameter (mm)
corner_offset = 3.0   # Distance from plate edge to hole center (mm)

# Create the base plate centered on the origin
result = (
    cq.Workplane("XY")
    .box(plate_length, plate_width, plate_thickness, centered=(True, True, True))
)

# Position the hole centers at each corner using a 2x2 array
result = (
    result
    .faces(">Z")               # Select top face for drilling
    .workplane()
    .rarray(
        xSpacing=plate_length - 2 * corner_offset,
        ySpacing=plate_width  - 2 * corner_offset,
        xCount=2,
        yCount=2,
        center=True
    )
    .hole(hole_diameter)
)

# The final solid is stored in 'result'