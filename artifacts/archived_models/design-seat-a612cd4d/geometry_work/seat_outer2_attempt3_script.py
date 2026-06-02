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
bracket_thickness = 5.0
bracket_size = 50.0

# 1. Seat Plate
seat = (
    cq.Workplane("XY")
    .workplane(offset=seat_height - seat_thickness)
    .box(seat_width, seat_depth, seat_thickness, centered=(True, True, False))
    .edges("|Z")
    .fillet(15.0)
)

# 2. Backrest
# Positioned at the back edge of the seat, slightly overlapping into the seat plate for a clean union.
backrest_height = 460.0
backrest = (
    cq.Workplane("XY")
    .box(seat_width, backrest_thickness, backrest_height + 5.0, centered=(True, True, False))
    .edges("|Z")
    .fillet(15.0)
    .rotate((0, 0, 0), (1, 0, 0), backrest_recline_angle)
    .translate((0, seat_depth / 2.0 - backrest_thickness / 2.0, seat_height - 5.0))
)

# 3. Front Legs (Vertical)
front_leg_left = (
    cq.Workplane("XY")
    .workplane(offset=0)
    .center(-seat_width / 2.0 + 30, -seat_depth / 2.0 + 30)
    .circle(leg_radius)
    .extrude(seat_height - seat_thickness)
)

front_leg_right = (
    cq.Workplane("XY")
    .workplane(offset=0)
    .center(seat_width / 2.0 - 30, -seat_depth / 2.0 + 30)
    .circle(leg_radius)
    .extrude(seat_height - seat_thickness)
)

# 4. Rear Legs (Angled backward by 10 degrees)
leg_angle = 10.0
leg_length = (seat_height - seat_thickness) / math.cos(math.radians(leg_angle))

rear_leg_left = (
    cq.Workplane("XY")
    .workplane(offset=seat_height - seat_thickness)
    .center(-seat_width / 2.0 + 30, seat_depth / 2.0 - 30)
    .transformed(rotate=(180.0 - leg_angle, 0, 0))
    .circle(leg_radius)
    .extrude(leg_length)
)

rear_leg_right = (
    cq.Workplane("XY")
    .workplane(offset=seat_height - seat_thickness)
    .center(seat_width / 2.0 - 30, seat_depth / 2.0 - 30)
    .transformed(rotate=(180.0 - leg_angle, 0, 0))
    .circle(leg_radius)
    .extrude(leg_length)
)

# 5. Mounting Brackets (Under the seat)
brackets = (
    cq.Workplane("XY")
    .workplane(offset=seat_height - seat_thickness - bracket_thickness)
    .pushPoints([
        (-seat_width / 2.0 + 30, -seat_depth / 2.0 + 30),
        (seat_width / 2.0 - 30, -seat_depth / 2.0 + 30),
        (-seat_width / 2.0 + 30, seat_depth / 2.0 - 30),
        (seat_width / 2.0 - 30, seat_depth / 2.0 - 30),
    ])
    .box(bracket_size, bracket_size, bracket_thickness, centered=(True, True, False))
)

# 6. Cross-Bracing Bars at Z = 150
# At Z=150, rear legs are shifted backward due to the 10-degree tilt:
# Shift = (440 - 150) * tan(10) = 290 * 0.1763 = 51.13 mm
rear_y_pos = (seat_depth / 2.0 - 30) + 51.13

front_brace = (
    cq.Workplane("YZ")
    .workplane(offset=-seat_width / 2.0 + 30)
    .center(-seat_depth / 2.0 + 30, 150.0)
    .circle(brace_radius)
    .extrude(seat_width - 60.0)
)

rear_brace = (
    cq.Workplane("YZ")
    .workplane(offset=-seat_width / 2.0 + 30)
    .center(rear_y_pos, 150.0)
    .circle(brace_radius)
    .extrude(seat_width - 60.0)
)

left_brace = (
    cq.Workplane("XZ")
    .workplane(offset=-seat_depth / 2.0 + 30)
    .center(-seat_width / 2.0 + 30, 150.0)
    .circle(brace_radius)
    .extrude(rear_y_pos - (-seat_depth / 2.0 + 30))
)

right_brace = (
    cq.Workplane("XZ")
    .workplane(offset=-seat_depth / 2.0 + 30)
    .center(seat_width / 2.0 - 30, 150.0)
    .circle(brace_radius)
    .extrude(rear_y_pos - (-seat_depth / 2.0 + 30))
)

# Combine all components into a single solid
result = (
    seat
    .union(backrest)
    .union(front_leg_left)
    .union(front_leg_right)
    .union(rear_leg_left)
    .union(rear_leg_right)
    .union(front_brace)
    .union(rear_brace)
    .union(left_brace)
    .union(right_brace)
    .union(brackets)
)