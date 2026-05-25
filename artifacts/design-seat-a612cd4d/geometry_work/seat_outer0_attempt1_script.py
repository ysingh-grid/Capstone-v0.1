import cadquery as cq
import math

# --- PARAMETERS ---
overall_height = 920.0
seat_width = 480.0
seat_depth = 450.0
seat_height = 460.0
seat_thickness = 20.0
backrest_height = 460.0
backrest_thickness = 20.0
backrest_recline = 12.0  # degrees tilt back

leg_dia = 25.0
leg_rad = leg_dia / 2.0
brace_dia = 16.0
brace_rad = brace_dia / 2.0

z_floor = 0.0
z_seat_bottom = seat_height - seat_thickness  # 440.0
z_brace = 180.0

# Placement of legs (inset from seat edges)
inset = 30.0
x_leg = seat_width / 2.0 - inset
y_leg_front = seat_depth / 2.0 - inset
y_leg_rear = -seat_depth / 2.0 + inset

# 1. SEAT PLATE
# Positioned at Z from z_seat_bottom to seat_height
seat = (cq.Workplane("XY")
        .workplane(offset=z_seat_bottom)
        .box(seat_width, seat_depth, seat_thickness, centered=(True, True, False)))

# Fillet seat front vertical corners and top edges
seat = seat.edges("|Z and >Y").fillet(20.0)
seat = seat.edges(">Z").fillet(8.0)

# 2. BACKREST
# Mounted at the rear of the seat, tilted back by backrest_recline degrees
backrest_y_center = -seat_depth / 2.0 + backrest_thickness / 2.0
backrest = (cq.Workplane("XY")
            .workplane(offset=seat_height - 2.0)  # slightly overlap with seat for strong union
            .center(0, backrest_y_center)
            .transformed(rotate=(backrest_recline, 0, 0))
            .box(seat_width, backrest_thickness, backrest_height + 2.0, centered=(True, True, False)))

# Fillet backrest top corners
backrest = backrest.edges(">Z").fillet(8.0)

# 3. LEGS (extend slightly into the seat to ensure perfect union)
leg_top_z = z_seat_bottom + 5.0

# Front legs (vertical)
front_left_leg = (cq.Workplane("XY")
                  .workplane(offset=z_floor)
                  .center(-x_leg, y_leg_front)
                  .circle(leg_rad)
                  .extrude(leg_top_z))

front_right_leg = (cq.Workplane("XY")
                   .workplane(offset=z_floor)
                   .center(x_leg, y_leg_front)
                   .circle(leg_rad)
                   .extrude(leg_top_z))

# Rear legs (slanted backward to prevent tipping)
rear_leg_shift_y = -40.0
y_leg_rear_bottom = y_leg_rear + rear_leg_shift_y

rear_left_leg = (cq.Workplane("XY")
                 .workplane(offset=z_floor)
                 .center(-x_leg, y_leg_rear_bottom)
                 .circle(leg_rad)
                 .workplane(offset=leg_top_z)
                 .center(0, -rear_leg_shift_y)  # relative translation to reach y_leg_rear
                 .circle(leg_rad)
                 .loft())

rear_right_leg = (cq.Workplane("XY")
                  .workplane(offset=z_floor)
                  .center(x_leg, y_leg_rear_bottom)
                  .circle(leg_rad)
                  .workplane(offset=leg_top_z)
                  .center(0, -rear_leg_shift_y)
                  .circle(leg_rad)
                  .loft())

# 4. CROSS-BRACING
# Calculate Y coordinates of the rear legs at Z = z_brace
fraction = z_brace / z_seat_bottom
y_rear_at_brace = y_leg_rear_bottom + (y_leg_rear - y_leg_rear_bottom) * fraction

# Side brace left
left_brace = (cq.Workplane("XZ")
              .workplane(offset=y_rear_at_brace)
              .center(-x_leg, z_brace)
              .circle(brace_rad)
              .extrude(y_leg_front - y_rear_at_brace))

# Side brace right
right_brace = (cq.Workplane("XZ")
               .workplane(offset=y_rear_at_brace)
               .center(x_leg, z_brace)
               .circle(brace_rad)
               .extrude(y_leg_front - y_rear_at_brace))

# Center brace
y_center_brace = (y_leg_front + y_rear_at_brace) / 2.0
center_brace = (cq.Workplane("YZ")
                .workplane(offset=-x_leg)
                .center(y_center_brace, z_brace)
                .circle(brace_rad)
                .extrude(2 * x_leg))

# Combine all components into the final solid
result = (seat
          .union(backrest)
          .union(front_left_leg)
          .union(front_right_leg)
          .union(rear_left_leg)
          .union(rear_right_leg)
          .union(left_brace)
          .union(right_brace)
          .union(center_brace))