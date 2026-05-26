import cadquery as cq

# Parametric dimensions
base_x = 50.0  # Base length along X-axis
base_y = 30.0  # Base width along Y-axis
top_x = 30.0   # Top face length along X-axis
top_y = 15.0   # Top face width along Y-axis
height = 40.0  # Height of the frustum along Z-axis

# Create the tapered rectangular block using a loft between two centered rectangles
result = (
    cq.Workplane("XY")
    .rect(base_x, base_y)            # Create base rectangle at Z = 0
    .workplane(offset=height)        # Move to the top plane at Z = height
    .rect(top_x, top_y)              # Create top rectangle
    .loft()                          # Loft the two profiles to create the solid
)