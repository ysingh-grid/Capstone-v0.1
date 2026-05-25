import cadquery as cq

# Parameters
seat_width = 480.0
seat_depth = 450.0
seat_thickness = 20.0
seat_height = 460.0  # Top surface of the seat
leg_diameter = 25.0
backrest_height = 460.0
backrest_thickness = 20.0

# 1. Seat Plate
# Base of seat is at Z = seat_height - seat_thickness = 440
seat = (
    cq.Workplane("XY")
    .workplane(offset=seat_height - seat_thickness)
    .box(seat_width, seat_depth, seat_thickness, centered=(True, True, False))
    .edges("|Z").fillet(20.0)
    .edges(">Z").fillet(5.0)
)

# 2. Backrest (contoured and rotated)
backrest_flat = (
    cq.Workplane("XY")
    .box(seat_width - 40, backrest_height, backrest_thickness, centered=(True, True, True))
    .edges("|Z").fillet(20.0)
    .edges(">Z or <Z").fillet(3.0)
)

# Rotate backrest by 12 degrees to match the 102-degree recline (90 + 12 = 102)
# and position it at the back of the seat plate
backrest = (
    backrest_flat
    .rotate((0, 0, 0), (1, 0, 0), 12.0)
    .translate((0, -258.0, 685.0))
)

# 3. Front Legs (straight down to the floor at Z=0)
front_leg_left = (
    cq.Workplane("XY")
    .workplane(offset=0)
    .center(-200.0, 180.0)
    .circle(leg_diameter / 2.0)
    .extrude(seat_height - seat_thickness)
)

front_leg_right = (
    cq.Workplane("XY")
    .workplane(offset=0)
    .center(200.0, 180.0)
    .circle(leg_diameter / 2.0)
    .extrude(seat_height - seat_thickness)
)

# 4. Rear Legs (angled backwards to prevent tipping)
rear_leg_left = (
    cq.Workplane("XY")
    .workplane(offset=0)
    .center(-200.0, -240.0)
    .circle(leg_diameter / 2.0)
    .workplane(offset=seat_height - seat_thickness)
    .center(0.0, 60.0)
    .circle(leg_diameter / 2.0)
    .loft()
)

rear_leg_right = (
    cq.Workplane("XY")
    .workplane(offset=0)
    .center(200.0, -240.0)
    .circle(leg_diameter / 2.0)
    .workplane(offset=seat_height - seat_thickness)
    .center(0.0, 60.0)
    .circle(leg_diameter / 2.0)
    .loft()
)

# 5. Cross Bracing
left_brace = (
    cq.Workplane("XY")
    .workplane(offset=150.0)
    .center(-200.0, -20.0)
    .box(20.0, 400.0, 20.0)
)

right_brace = (
    cq.Workplane("XY")
    .workplane(offset=150.0)
    .center(200.0, -20.0)
    .box(20.0, 400.0, 20.0)
)

cross_brace = (
    cq.Workplane("XY")
    .workplane(offset=150.0)
    .center(0.0, 0.0)
    .box(400.0, 20.0, 20.0)
)

# Union everything into a single watertight solid
result = (
    seat
    .union(backrest)
    .union(front_leg_left)
    .union(front_leg_right)
    .union(rear_leg_left)
    .union(rear_leg_right)
    .union(left_brace)
    .union(right_brace)
    .union(cross_brace)
)