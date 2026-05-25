import cadquery as cq

def make_tapered_leg(x, y, r_bottom, r_top, h):
    wp1 = cq.Workplane("XY").workplane(offset=0).center(x, y).circle(r_bottom)
    wp2 = wp1.workplane(offset=h).circle(r_top)
    return wp1.loft()

# Seat
seat_pts = [(-225, 225), (225, 225), (200, -225), (-200, -225)]
seat = cq.Workplane("XY").workplane(offset=425).polyline(seat_pts).close().extrude(25)

# Front legs
lf_leg = make_tapered_leg(-205, 205, 10, 20, 450)
rf_leg = make_tapered_leg(205, 205, 10, 20, 450)

# Rear legs (bottom)
lr_leg_bottom = make_tapered_leg(-185, -210, 10, 15, 450)
rr_leg_bottom = make_tapered_leg(185, -210, 10, 15, 450)

# Rear legs (top)
lr_leg_top = cq.Workplane("XY").workplane(offset=450).center(-185, -210).circle(15).extrude(450)
rr_leg_top = cq.Workplane("XY").workplane(offset=450).center(185, -210).circle(15).extrude(450)

# Top rail
top_rail = (cq.Workplane("XY")
            .workplane(offset=850)
            .center(0, -210)
            .box(400, 30, 50, centered=(True, True, False)))

# Slats
slat_middle = (cq.Workplane("XY")
               .workplane(offset=450)
               .center(0, -210)
               .box(30, 10, 400, centered=(True, True, False)))

slat_left = (cq.Workplane("XY")
             .workplane(offset=450)
             .center(-70, -210)
             .box(30, 10, 400, centered=(True, True, False)))

slat_right = (cq.Workplane("XY")
              .workplane(offset=450)
              .center(70, -210)
              .box(30, 10, 400, centered=(True, True, False)))

# Union everything
result = (seat
          .union(lf_leg)
          .union(rf_leg)
          .union(lr_leg_bottom)
          .union(rr_leg_bottom)
          .union(lr_leg_top)
          .union(rr_leg_top)
          .union(top_rail)
          .union(slat_middle)
          .union(slat_left)
          .union(slat_right))