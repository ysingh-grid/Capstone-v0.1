import cadquery as cq

# Define parametric dimensions
length = 35.0  # Dimension along X axis (mm)
width = 35.0   # Dimension along Y axis (mm)
height = 50.0  # Dimension along Z axis (mm)

# Create the solid cuboid
# Centered on the X and Y axes, with the bottom face resting on the XY plane (Z=0 to Z=50)
result = cq.Workplane("XY").box(
    length, 
    width, 
    height, 
    centered=(True, True, False)
)