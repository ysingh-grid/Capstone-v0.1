import cadquery as cq

# --- PARAMETERS ---
# Dimensions of the rectangular bar
bar_width = 10.0   # Dimension along X axis
bar_length = 200.0 # Dimension along Y axis (length of the bar)
bar_height = 10.0  # Dimension along Z axis

# --- MODEL GENERATION ---
# Create a 3D rectangular box centered at the origin
result = cq.Workplane("XY").box(
    bar_width, 
    bar_length, 
    bar_height, 
    centered=(True, True, True)
)