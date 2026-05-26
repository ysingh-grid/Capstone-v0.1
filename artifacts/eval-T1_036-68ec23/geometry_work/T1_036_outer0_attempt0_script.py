import cadquery as cq

# --- Parametric Dimensions ---
diameter = 80.0     # Outer diameter of the circular disc
thickness = 1.0    # Thickness (height along Z-axis)

# Calculate radius
radius = diameter / 2.0

# --- Construction ---
# Create a 2D circle on the XY plane and extrude it in the +Z direction
result = (
    cq.Workplane("XY")
    .circle(radius)
    .extrude(thickness)
)