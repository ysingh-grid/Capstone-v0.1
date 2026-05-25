import cadquery as cq

# Parametric Dimensions (all in mm)
OUTER_DIM_X = 2060.0          # Outer width of the bed frame
OUTER_DIM_Y = 2060.0          # Outer length of the bed frame
FRAME_TOP_Z = 610.0           # Height of the top of the frame above ground (2 feet)

# Standard Wood Dimensions
RAIL_HEIGHT = 140.0           # Height of the side/head/foot rails (nominal 2x6 is 140mm)
RAIL_THICKNESS = 38.0         # Thickness of the rails (nominal 2-by is 38mm)
LEG_WIDTH = 89.0              # Post leg width (nominal 4x4 is 89mm)
CLEAT_SIZE = 38.0             # Support cleat cross-section (38x38mm)
SLAT_THICKNESS = 19.0         # Mattress support slat thickness (nominal 1-by is 19mm)
SLAT_WIDTH = 89.0             # Slat width (nominal 1x4 is 89mm)

# Derived Coordinates
RAIL_BOTTOM_Z = FRAME_TOP_Z - RAIL_HEIGHT
INNER_DIM_X = OUTER_DIM_X - 2 * RAIL_THICKNESS  # 1984 mm
INNER