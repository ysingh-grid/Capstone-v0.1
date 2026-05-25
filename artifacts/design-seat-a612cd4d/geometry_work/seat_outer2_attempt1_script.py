import cadquery as cq
import math

# Dimensions
seat_width = 480.0
seat_depth = 450.0
seat_thickness = 20.0
seat_height = 460.0  # Top of seat plate
backrest_thickness = 20.0
backrest_recline_angle = 12.0  # degrees from vertical
leg_radius = 12.5
brace_radius = 8.0

# 1. Seat Plate
seat = (
    cq.Workplane("XY")
    .workplane(offset=seat_height - seat_thickness)
    .box(seat_width, seat_depth, seat_thickness, centered=(True, True, False))
    .fillet(8.0)
)

# 2. Backrest
# Positioned at the back edge of the seat: X=0, Y=-225, Z=460.
# We rotate the workplane by -12 degrees around the X-axis so that local +Z points along the recline.
# To ensure the top of the backrest is close to Z=920, the local height is computed.
backrest_height_local = 460.0 / math.cos(math.radians(backrest_recline_angle))
backrest = (
    cq.Workplane("XY")
    .workplane(offset=