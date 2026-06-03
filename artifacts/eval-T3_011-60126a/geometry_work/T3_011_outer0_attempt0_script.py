import cadquery as cq
import math

# ── Parameters ────────────────────────────────────────────────────────────────
num_teeth        = 20
tip_radius       = 24.0      # mm  (gear outer / tooth tip)
root_radius      = 20.0      # mm  (tooth root / valley)
gear_thickness   = 10.0      # mm  (Z = 0 → 10)

hub_outer_radius = 8.0       # mm  (hub OD = 16 mm)
hub_height       = 30.0      # mm  (Z = 0 → 30)

bore_radius      = 5.0       # mm  (bore diameter = 10 mm)

keyway_width     = 4.0       # mm  (Y direction, centred on Y=0)
keyway_x_start   = 5.0       # mm  (= bore_radius, inner wall of keyway)
keyway_x_end     = 7.5       # mm  (= bore_radius + 2.5 mm depth)

set_screw_dia    = 4.0       # mm
set_screw_z      = 20.0      # mm  (height along hub)

# ── 1. Gear tooth profile (star-polygon / sinusoidal polar) ──────────────────
# One full tooth spans 360/num_teeth = 18 degrees.
# We sample each tooth with several points transitioning tip→root→tip.

pts = []
steps_per_tooth = 12          # interpolation points per tooth
total_pts = num_teeth * steps_per_tooth

for i in range(total_pts):
    angle_deg = 360.0 * i / total_pts
    angle_rad = math.radians(angle_deg)

    # fractional position within current tooth (0 = valley, 0.5 = tip centre, 1 = valley)
    tooth_phase = (i % steps_per_tooth) / steps_per_tooth
    # cosine wave: 1.0 at tooth centre (tip), 0.0 at boundaries (root/valley)
    tip_fraction = 0.5 * (1.0 - math.cos(2.0 * math.pi * tooth_phase))

    r = root_radius + (tip_radius - root_radius) * tip_fraction
    x = r * math.cos(angle_rad)
    y = r * math.sin(angle_rad)
    pts.append((x, y))

# Close the polygon
pts.append(pts[0])

# Build the gear body as an extruded closed polygon
gear_wire = (
    cq.Workplane("XY")
    .polyline(pts)
    .close()
)
gear_body = gear_wire.extrude(gear_thickness)  # Z = 0 → gear_thickness

# ── 2. Hub cylinder (Z = 0 → hub_height, centred at origin) ──────────────────
hub = (
    cq.Workplane("XY")
    .cylinder(hub_height, hub_outer_radius,
              centered=(True, True, False))   # sits on Z=0
)

# ── 3. Union gear body + hub ──────────────────────────────────────────────────
combined = gear_body.union(hub)

# ── 4. Central bore (diameter 10 mm, full 30 mm length) ──────────────────────
bore_tool = (
    cq.Workplane("XY")
    .cylinder(hub_height, bore_radius,
              centered=(True, True, False))
)
combined = combined.cut(bore_tool)

# ── 5. Keyway slot (rectangular, +X side, full 30 mm length) ─────────────────
# Box: X from keyway_x_start (5 mm) to keyway_x_end (7.5 mm)
#       Y from -2 mm to +2 mm  (width = 4 mm, centred on Y=0)
#       Z from 0 to hub_height (30 mm)
keyway_length_x = keyway_x_end - keyway_x_start          # 2.5 mm
keyway_cx       = keyway_x_start + keyway_length_x / 2.0  # 6.25 mm

keyway_tool = (
    cq.Workplane("XY")
    .center(keyway_cx, 0.0)
    .box(keyway_length_x, keyway_width, hub_height,
         centered=(True, True, False))
)
combined = combined.cut(keyway_tool)

# ── 6. Radial set screw hole (4 mm dia, along X axis, at Z = 20 mm) ──────────
# Cylinder axis along X, passing fully through hub (X = -8 → +8 mm)
# Build as a cylinder standing on the YZ plane, then rotate 90° about Y
set_screw_length = 2.0 * hub_outer_radius + 2.0          # 18 mm (generous)

set_screw_tool = (
    cq.Workplane("YZ")
    .workplane(offset=-(set_screw_length / 2.0))          # start at X = -9
    .center(0.0, set_screw_z)                              # Y=0, Z=20
    .circle(set_screw_dia / 2.0)
    .extrude(set_screw_length)
)
combined = combined.cut(set_screw_tool)

# ── Final result ──────────────────────────────────────────────────────────────
result = combined