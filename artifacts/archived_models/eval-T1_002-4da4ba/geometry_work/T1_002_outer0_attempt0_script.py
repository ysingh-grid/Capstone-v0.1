import cadquery as cq

# --- Parametric Dimensions ---
diameter = 25.0
height = 40.0
radius = diameter / 2.0

# --- Construction ---
# Create a cylinder on the XY workplane, with its central axis along Z.
# Setting centered=(True, True, False) centers it on X and Y, 
# and places the bottom face of the cylinder at Z=0.
result = cq.Workplane("XY").cylinder(
    height=height,
    radius=radius,
    centered=(True, True, False)
)