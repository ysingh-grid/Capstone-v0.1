import cadquery as cq

# Parametric dimensions
length = 80.0
width = 40.0
height = 30.0
wall_thickness = 3.0
base_thickness = 3.0

# Calculate profile coordinates in YZ plane
# Local X corresponds to World Y, Local Y corresponds to World Z
y_outer = width / 2.0
y_inner = y_outer - wall_thickness
z_outer_min = -height / 2.0
z_outer_max = height / 2.0
z_inner_min = z_outer_min + base_thickness

# Define the points of the U-channel cross-section
pts = [
    (-y_outer, z_outer_max),  # Top-left outer
    (-y_outer, z_outer_min),  # Bottom-left outer
    (y_outer, z_outer_min),   # Bottom-right outer
    (y_outer, z_outer_max),   # Top-right outer
    (y_inner, z_outer_max),   # Top-right inner
    (y_inner, z_inner_min),   # Bottom-right inner
    (-y_inner, z_inner_min),  # Bottom-left inner
    (-y_inner, z_outer_max),  # Top-left inner
]

# Create the U-channel by drawing the profile on YZ plane,
# extruding it along X-axis, and centering it at the origin.
result = (
    cq.Workplane("YZ")
    .polyline(pts)
    .close()
    .extrude(length)
    .translate((-length / 2.0, 0, 0))
)