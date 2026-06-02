import cadquery as cq

# Parametric dimensions
plate_length = 60.0          # X dimension (mm)
plate_width  = 40.0          # Y dimension (mm)
plate_thickness = 10.0      # Z dimension (mm)

hole_diameter = 5.0          # M5 hole diameter (mm)
corner_offset = 2.5          # distance from each edge to hole center (mm)

# Calculate hole centers relative to plate origin
half_len = plate_length / 2.0
half_wid = plate_width / 2.0

# Positions of the four corner holes
hole_positions = [
    (half_len - corner_offset,  half_wid - corner_offset),
    (-half_len + corner_offset,  half_wid - corner_offset),
    (half_len - corner_offset, -half_wid + corner_offset),
    (-half_len + corner_offset, -half_wid + corner_offset)
]

# Build plate with holes
result = (
    cq.Workplane("XY")
    .box(plate_length, plate_width, plate_thickness, centered=(True, True, True))
    .faces(">Z")                     # select top face
    .workplane()
    .pushPoints(hole_positions)      # add all hole centers
    .hole(hole_diameter)             # drill through holes
)