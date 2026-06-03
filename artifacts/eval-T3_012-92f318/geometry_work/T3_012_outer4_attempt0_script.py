import cadquery as cq
import math

# === Parametric Dimensions ===
base_plate_x = 60.0
base_plate_y = 60.0
base_plate_z = 5.0

lower_post_radius = 10.0
lower_post_z_bottom = 5.0
lower_post_z_top = 18.0
lower_post_height = lower_post_z_top - lower_post_z_bottom  # 13mm

retaining_shoulder_radius = 7.0
retaining_shoulder_z_bottom = 18.0
retaining_shoulder_z_top = 40.0
retaining_shoulder_height = retaining_shoulder_z_top - retaining_shoulder_z_bottom  # 22mm

gear_tip_radius = 20.0
gear_root_radius = 16.0
gear_num_teeth = 16
gear_z_bottom = 10.0
gear_z_top = 18.0
gear_face_width = gear_z_top - gear_z_bottom  # 8mm

central_bore_radius = 4.0

mounting_hole_diameter = 6.0
mounting_hole_offset_x = 22.0
mounting_hole_offset_y = 22.0

# === Build Base Plate ===
base_plate = (
    cq.Workplane("XY")
    .box(base_plate_x, base_plate_y, base_plate_z, centered=(True, True, False))
)

# === Build Lower Post ===
lower_post = (
    cq.Workplane("XY")
    .workplane(offset=lower_post_z_bottom)
    .cylinder(lower_post_height, lower_post_radius, centered=(True, True, False))
)

# === Build Retaining Shoulder ===
retaining_shoulder = (
    cq.Workplane("XY")
    .workplane(offset=retaining_shoulder_z_bottom)
    .cylinder(retaining_shoulder_height, retaining_shoulder_radius, centered=(True, True, False))
)

# === Build Spur Gear using SUBTRACTIVE method ===
# Start with a solid cylinder at tip diameter
gear_blank = (
    cq.Workplane("XY")
    .workplane(offset=gear_z_bottom)
    .cylinder(gear_face_width, gear_tip_radius, centered=(True, True, False))
)

# For each of 16 inter-tooth gaps, cut a slot from root radius to beyond tip radius.
# Each pitch angle = 360/16 = 22.5 degrees.
# Each tooth occupies half the pitch (11.25 deg), gap occupies half (11.25 deg).
tooth_angle = 2.0 * math.pi / gear_num_teeth  # 22.5 degrees per tooth in radians
gap_half_angle = tooth_angle / 4.0  # gap spans half the pitch, so half = tooth_angle/4

outer_cut_radius = gear_tip_radius + 5.0  # extend beyond tip to ensure clean cut

gear = gear_blank
for i in range(gear_num_teeth):
    # Gap center angle: halfway between tooth i and tooth i+1
    gap_center = (i + 0.5) * tooth_angle

    # Angular extent of the gap
    gap_start = gap_center - gap_half_angle
    gap_end = gap_center + gap_half_angle

    # Build gap profile polygon with inner arc points at root_radius
    n_arc_pts = 5
    gap_pts = []

    # Inner arc from gap_start to gap_end at root_radius
    for j in range(n_arc_pts + 1):
        frac = j / n_arc_pts
        angle = gap_start + frac * (gap_end - gap_start)
        gap_pts.append((gear_root_radius * math.cos(angle), gear_root_radius * math.sin(angle)))

    # Outer corners beyond tip radius
    gap_pts.append((outer_cut_radius * math.cos(gap_end), outer_cut_radius * math.sin(gap_end)))
    gap_pts.append((outer_cut_radius * math.cos(gap_start), outer_cut_radius * math.sin(gap_start)))

    # Build the cutting solid - start exactly at gear_z_bottom, no overcut below
    gap_cutter = (
        cq.Workplane("XY")
        .workplane(offset=gear_z_bottom)
        .polyline(gap_pts)
        .close()
        .extrude(gear_face_width + 0.1)  # tiny overcut on top only to ensure clean boolean
    )

    gear = gear.cut(gap_cutter)

# Cut inner bore through gear to fit over lower post (radius=10mm)
gear_inner_bore = (
    cq.Workplane("XY")
    .workplane(offset=gear_z_bottom)
    .cylinder(gear_face_width + 0.1, lower_post_radius, centered=(True, True, False))
)
gear = gear.cut(gear_inner_bore)

# === Union All Solid Components ===
assembly = base_plate.union(lower_post).union(retaining_shoulder).union(gear)

# === Subtract Central Bore (8mm diameter, through entire assembly Z=0 to Z=40) ===
central_bore_cyl = (
    cq.Workplane("XY")
    .workplane(offset=-1.0)
    .cylinder(42.0, central_bore_radius, centered=(True, True, False))
)
assembly = assembly.cut(central_bore_cyl)

# === Subtract Four Mounting Holes through Base Plate ===
mounting_positions = [
    ( mounting_hole_offset_x,  mounting_hole_offset_y),
    (-mounting_hole_offset_x,  mounting_hole_offset_y),
    ( mounting_hole_offset_x, -mounting_hole_offset_y),
    (-mounting_hole_offset_x, -mounting_hole_offset_y),
]

for (mx, my) in mounting_positions:
    hole_cyl = (
        cq.Workplane("XY")
        .workplane(offset=-1.0)
        .center(mx, my)
        .cylinder(base_plate_z + 2.0, mounting_hole_diameter / 2.0, centered=(True, True, False))
    )
    assembly = assembly.cut(hole_cyl)

# === Final Result ===
result = assembly