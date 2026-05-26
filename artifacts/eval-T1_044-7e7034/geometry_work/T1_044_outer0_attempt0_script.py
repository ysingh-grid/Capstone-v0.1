import cadquery as cq

# Parametric variables for the thin rectangular fin
length = 60.0      # Dimension along X-axis
thickness = 2.0    # Dimension along Y-axis
height = 80.0      # Dimension along Z-axis

# Create the rectangular fin aligned to the XY workplane
# and centered on the origin (X, Y, and Z axes)
result = cq.Workplane("XY").box(
    length, 
    thickness, 
    height, 
    centered=(True, True, True)
)