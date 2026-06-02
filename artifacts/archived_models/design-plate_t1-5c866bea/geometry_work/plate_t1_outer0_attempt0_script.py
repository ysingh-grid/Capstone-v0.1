import cadquery as cq

# Parametric dimensions
plate_length = 60.0          # X dimension (mm)
plate_width  = 40.0          # Y dimension (mm)
plate_thickness = 10.0      # Z dimension (mm)

hole_diameter = 5.0          # M5 hole diameter (mm)
hole_offset_x = 25.0         # distance from plate center to hole centre in X (mm)
hole_offset_y = 15.0         # distance from plate center to hole centre in Y (mm)

# Create the main plate
result = (
    cq.Workplane("XY")
    .box(plate_length, plate_width, plate_thickness, centered=True)
)

# Define the four corner hole positions relative to the plate centre
hole_positions = [
    ( hole_offset_x,  hole_offset_y),   # front‑right
    (-hole_offset_x,  hole_offset_y),   # front‑left
    ( hole_offset_x, -hole_offset_y),   # back‑right
    (-hole_offset_x, -hole_offset_y)    # back‑left
]

# Add through holes on the top face of the plate
result = (
    result
    .faces(">Z")
    .workplane()
    .pushPoints(hole_positions)
    .hole(hole_diameter)
)