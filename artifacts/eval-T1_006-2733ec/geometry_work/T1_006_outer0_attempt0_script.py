import cadquery as cq

# Parametric dimensions
length = 100.0      # Dimension along X axis (mm)
width = 60.0        # Dimension along Y axis (mm)
thickness = 3.0     # Dimension along Z axis (mm)

# Create a flat rectangular plate centered on the XY plane,
# sitting on the plane (Z=0) and extending in the +Z direction.
result = cq.Workplane("XY").box(
    length, 
    width, 
    thickness, 
    centered=(True, True, False)
)