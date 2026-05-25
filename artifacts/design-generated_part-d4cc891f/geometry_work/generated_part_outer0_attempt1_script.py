```python
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
INNER_DIM_Y = OUTER_DIM_Y - 2 * RAIL_THICKNESS  # 1984 mm

# Create the components
# 1. Side Rails
left_rail = cq.Workplane("XY").workplane(offset=FRAME_TOP_Z - RAIL_HEIGHT/2).box(RAIL_THICKNESS, OUTER_DIM_Y, RAIL_HEIGHT)
left_rail = left_rail.translate((-OUTER_DIM_X/2 + RAIL_THICKNESS/2, 0, 0))

right_rail = cq.Workplane("XY").workplane(offset=FRAME_TOP_Z - RAIL_HEIGHT/2).box(RAIL_THICKNESS, OUTER_DIM_Y, RAIL_HEIGHT)
right_rail = right_rail.translate((OUTER_DIM_X/2 - RAIL_THICKNESS/2, 0, 0))

# 2. Head and Foot Rails (fit between side rails)
head_rail = cq.Workplane("XY").workplane(offset=FRAME_TOP_Z - RAIL_HEIGHT/2).box(INNER_DIM_X, RAIL_THICKNESS, RAIL_HEIGHT)
head_rail = head_rail.translate((0, OUTER_DIM_Y/2 - RAIL_THICKNESS/2, 0))

foot_rail = cq.Workplane("XY").workplane(offset=FRAME_TOP_Z - RAIL_HEIGHT/2).box(INNER_DIM_X, RAIL_THICKNESS, RAIL_HEIGHT)
foot_rail = foot_rail.translate((0, -OUTER_DIM_Y/2 + RAIL_THICKNESS/2, 0))

# 3. Corner Legs
leg_height = FRAME_TOP_Z
leg_x_offset = -INNER_DIM_X/2 + LEG_WIDTH/2
leg_y_offset = -INNER_DIM_Y/2 + LEG_WIDTH/2

leg1 = cq.Workplane("XY").workplane(offset=leg_height/2).box(LEG_WIDTH, LEG_WIDTH, leg_height).translate((leg_x_offset, leg_y_offset, 0))
leg2 = cq.Workplane("XY").workplane(offset=leg_height/2).box(LEG_WIDTH, LEG_WIDTH, leg_height).translate((-leg_x_offset, leg_y_offset, 0))
leg3 = cq.Workplane("XY").workplane(offset=leg_height/2).box(LEG_WIDTH, LEG_WIDTH, leg_height).translate((leg_x_offset, -leg_y_offset, 0))
leg4 = cq.Workplane("XY").workplane(offset=leg_height/2).box(LEG_WIDTH, LEG_WIDTH, leg_height).translate((-leg_x_offset, -leg_y_offset, 0