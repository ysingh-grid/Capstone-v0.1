import cadquery as cq

# Parametric dimensions
base_side = 40.0  # Length of the square base sides (mm)
height = 50.0     # Height of the pyramid (mm)

# To represent a sharp apex using a loft, we use an extremely small square 
# at the top workplane. This ensures clean geometry with a matching number of vertices.
apex_epsilon = 1e-4 

# Build the pyramid by lofting from the 40x40 base to the near-zero top square
result = (
    cq.Workplane("XY")
    .rect(base_side, base_side)
    .workplane(offset=height)
    .rect(apex_epsilon, apex_epsilon)
    .loft(combine=True)
)