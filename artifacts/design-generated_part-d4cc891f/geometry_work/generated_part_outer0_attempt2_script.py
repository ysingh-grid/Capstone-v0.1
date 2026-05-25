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
leg4 = cq.Workplane("XY").workplane(offset=leg_height/2).box(LEG_WIDTH, LEG_WIDTH, leg_height).translate((-leg_x_offset, -leg_y_offset, 0))

# 4. Cleats for Slats
cleat_y_length = INNER_DIM_Y - 2 * LEG_WIDTH
left_cleat = cq.Workplane("XY").workplane(offset=FRAME_TOP_Z - SLAT_THICKNESS - CLEAT_SIZE/2).box(CLEAT_SIZE, cleat_y_length, CLEAT_SIZE)
left_cleat = left_cleat.translate((-INNER_DIM_X/2 + CLEAT_SIZE/2, 0, 0))

right_cleat = cq.Workplane("XY").workplane(offset=FRAME_TOP_Z - SLAT_THICKNESS - CLEAT_SIZE/2).box(CLEAT_SIZE, cleat_y_length, CLEAT_SIZE)
right_cleat = right_cleat.translate((INNER_DIM_X/2 - CLEAT_SIZE/2, 0, 0))

# 5. Center Support Rail and Legs
center_rail_top = FRAME_TOP_Z - SLAT_THICKNESS
center_rail_offset = center_rail_top - RAIL_HEIGHT/2
center_rail = cq.Workplane("XY").workplane(offset=center_rail_offset).box(RAIL_THICKNESS, INNER_DIM_Y, RAIL_HEIGHT)

center_leg_height = center_rail_top - RAIL_HEIGHT
center_leg1 = cq.Workplane("XY").workplane(offset=center_leg_height/2).box(LEG_WIDTH, LEG_WIDTH, center_leg_height).translate((0, -INNER_DIM_Y/3, 0))
center_leg2 = cq.Workplane("XY").workplane(offset=center_leg_height/2).box(LEG_WIDTH, LEG_WIDTH, center_leg_height).translate((0, INNER_DIM_Y/3, 0))

# 6. Slats
slats = []
num_slats = 11
slat_span_y = INNER_DIM_Y - SLAT_WIDTH
for i in range(num_slats):
    y_pos = -slat_span_y/2 + i * (slat_span_y / (num_slats - 1))
    slat = cq.Workplane("XY").workplane(offset=FRAME_TOP_Z - SLAT_THICKNESS/2).box(INNER_DIM_X, SLAT_WIDTH, SLAT_THICKNESS).translate((0, y_pos, 0))
    slats.append(slat)

# Combine all into one compound shape
result = left_rail
result