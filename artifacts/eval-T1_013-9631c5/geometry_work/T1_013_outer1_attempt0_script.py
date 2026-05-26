import cadquery as cq

# Parametric dimensions
total_length = 60.0
width = 20.0
thickness = 8.0

# In slot2D, the 'length' parameter is the distance between the centers of the two semicircles.
# For an overall length of 60mm and a width (diameter) of 20mm, the center-to-center distance is 40mm.
center_to_center_length = total_length - width

# Create the stadium shape using the built-in slot2D method, which is centered at the origin.
result = (
    cq.Workplane("XY")
    .slot2D(center_to_center_length, width)
    .extrude(thickness)
)