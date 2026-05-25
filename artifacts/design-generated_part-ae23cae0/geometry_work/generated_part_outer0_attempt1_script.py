import cadquery as cq
import math

# Dimensions
thick = 4.0
fc_pattern = 30.5
sec_pattern = 20.0
motor_bcd = 16.0
motor_pad_dia = 28.0
arm_width = 12.0
diag = 250.0
motor_dist = diag / 2.0  # 125.0
motor_offset = motor_dist * math.sin(math.radians(45)) # 88.388

# Central fuselage
fuse_l = 120.0
fuse_w = 40.0

# Build base body
result = cq.Workplane("XY").rect(fuse_w, fuse_l).extrude(thick)
result = result.edges("|Z").fillet(10.0)

# Create arms
arms = []
for angle in [45, 135, 225, 315]:
    arm = (cq.Workplane("XY")
           .rect(arm_width, motor_dist)
           .extrude(thick)
           .translate((0, motor_dist / 2.0, 0))
           .rotate((0,0,0), (0,0,1), angle))
    arms.append(arm)

# Create motor pads
pads = []
motor_centers = [
    (motor_offset, motor_offset),
    (-motor_offset, motor_offset),
    (-motor_offset, -motor_offset),
    (motor_offset, -motor_offset)
]
for x, y in motor_centers:
    pad = (cq.Workplane("XY")
           .workplane(offset=0)
           .center(x, y)
           .circle(motor_pad_dia / 2.0)
           .extrude(thick))
    pads.append(pad)

# Union arms and pads into main body
for arm in arms:
    result = result.union(arm)

for pad in pads:
    result = result.union(pad)

result = result.clean()

# Create Flight Controller holes
fc_half = fc_pattern / 2.0
fc_points = [
    (fc_half, fc_half),
    (-fc_half, fc_half),
    (-fc_half, -fc_half),
    (fc_half, -fc_half)
]
result = (result.faces(">Z").workplane()
          .pushPoints(fc_points)
          .hole(3.0))

# Create secondary accessory holes
sec_half = sec_pattern / 2.0
sec_y_center = -35.0
sec_points = [
    (sec_half, sec_y_center + sec_half),
    (-sec_half, sec_y_center + sec_half),
    (-sec_half, sec_y_center - sec_half),
    (sec_half, sec_y_center - sec_half)
]
result = (result.faces(">Z").workplane()
          .pushPoints(sec_points)
          .hole(2.0))

# Create motor center holes
result = (result.faces(">Z").workplane()
          .pushPoints(motor_centers)
          .hole(5.0))

# Create motor screw holes (16 holes total)
screw_points = []
for x_m, y_m in motor_centers:
    for angle in [45, 135, 225, 315]:
        rad = math.radians(angle)
        xs = x_m + (motor_bcd / 2.0) * math.cos(rad)
        ys = y_m + (motor_bcd / 2.0) * math.sin(rad)
        screw_points.append((xs, ys))

result = (result.faces(">Z").workplane()
          .pushPoints(screw_points)
          .hole(3.0))