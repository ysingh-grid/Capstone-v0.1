import cadquery as cq

# Parametric dimensions
total_length = 60.0
width = 20.0
thickness = 8.0

# In CadQuery, the 'length' argument for slot2D is the overall length of the slot.
# We pass total_length (60.0) directly.
result = (
    cq.Workplane("XY")
    .slot2D(total_length, width)
    .extrude(thickness)
)