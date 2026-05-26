import cadquery as cq

# Parametric dimensions
base_length_x = 60.0
base_width_y = 30.0
height_z = 25.0

# Define the vertices of the triangular cross-section in the YZ plane.
# In the YZ plane, local X map to global Y, and local Y map to global Z.
# The base is centered at Y=0 (local X=0) and sits on the XY plane (global Z=0, local Y=0).
pts = [
    (-base_width_y / 2.0, 0),          # Bottom-left corner of the triangle
    (base_width_y / 2.0, 0),           # Bottom-right corner of the triangle
    (0, height_z)                      # Apex of the triangle
]

# Create the wedge:
# 1. Start on the "YZ" workplane (normal is global +X).
# 2. Offset the workplane to X = -30 (half the length) to center the extrusion.
# 3. Draw the triangular profile.
# 4. Extrude along the +X direction by the overall length (60mm) to center it.
result = (
    cq.Workplane("YZ")
    .workplane(offset=-base_length_x / 2.0)
    .polyline(pts)
    .close()
    .extrude(base_length_x)
)