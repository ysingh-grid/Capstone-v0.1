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

# === Build Spur Gear with Proper Tooth Profile ===
# Strategy: Build the gear profile as a closed polygon with proper arc-like teeth.
# Each tooth: root arc -> flank up to tip -> tip arc -> flank down to root
# We'll approximate arcs with multiple points for a smooth look.
# 
# For each of 16 teeth, the angular span is 360/16 = 22.5 degrees.
# Each tooth occupies half the pitch angle (11.25 deg), gap (root) occupies the other half.
# We'll use: root arc (5.625 deg each side of gap center), then tooth flanks, tip arc (5.625 deg at tip)

tooth_angle = 2 * math.pi / gear_num_teeth  # 22.5 degrees per tooth
half_tooth = tooth_angle / 2.0  # 11.25 degrees
# Each tooth: tip arc spans half_tooth (centered on tooth), root arc spans half_tooth (centered on gap)
# Approximate each arc with sub-points for smoothness
arc_pts = 4  # points per arc segment (including endpoints)

gear_profile_pts = []

for i in range(gear_num_teeth):
    # Center angle of this tooth tip
    tooth_center = i * tooth_angle
    
    # Root arc: from (tooth_center - half_tooth) to (tooth_center), at root_radius
    # (The root between previous tooth and this tooth)
    root_start_angle = tooth_center - half_tooth
    root_end_angle = tooth_center - half_tooth * 0.3  # root arc ends before flank start
    
    # Actually, let's use a clear angular layout:
    # For tooth i centered at angle = i * tooth_angle:
    #   root_left:  angle = i*tooth_angle - half_tooth          (root circle)
    #   flank_left: angle = i*tooth_angle - half_tooth*0.4      (tip circle)  
    #   tip_left:   angle = i*tooth_angle - half_tooth*0.35     (tip circle)
    #   tip_right:  angle = i*tooth_angle + half_tooth*0.35     (tip circle)
    #   flank_right:angle = i*tooth_angle + half_tooth*0.4      (tip circle -- wait this isn't right)
    
    # Simpler approach: define tooth profile with 5 key points per tooth:
    # 1. Root left (root_radius, tooth_center - half_tooth/2 - quarter_tooth)  
    # Let me use a clean parametric approach:
    
    # Angular positions:
    # a0: start of root (between previous tooth and this one) 
    # a1: start of left flank (root circle, left side of tooth)
    # a2: top left of tooth (tip circle)
    # a3: top right of tooth (tip circle)  
    # a4: end of right flank (root circle, right side of tooth)
    # a5: end of root (between this tooth and next one) -- same as next tooth's a0
    
    # Tooth occupies fraction f of the pitch angle (centered)
    tooth_fraction = 0.5  # tooth width = 50% of pitch, gap = 50%
    
    half_tooth_width = half_tooth * tooth_fraction  # angular half-width of tooth at root
    
    a1 = tooth_center - half_tooth_width  # left root point
    a2 = tooth_center - half_tooth_width  # left tip point (same angle, different radius)
    a3 = tooth_center + half_tooth_width  # right tip point
    a4 = tooth_center + half_tooth_width  # right root point
    
    # Add left root point
    gear_profile_pts.append((gear_root_radius * math.cos(a1), gear_root_radius * math.sin(a1)))
    # Add left tip point (flank goes radially outward)
    gear_profile_pts.append((gear_tip_radius * math.cos(a2), gear_tip_radius * math.sin(a2)))
    # Add right tip point
    gear_profile_pts.append((gear_tip_radius * math.cos(a3), gear_tip_radius * math.sin(a3)))
    # Add right root point
    gear_profile_pts.append((gear_root_radius * math.cos(a4), gear_root_radius * math.sin(a4)))
    
    # Add root arc to next tooth: from a4 to next tooth's a1
    # next tooth's a1 = (i+1)*tooth_angle - half_tooth_width
    next_a1 = (i + 1) * tooth_angle - half_tooth_width
    # Interpolate root arc with multiple points
    n_root_pts = 3
    for j in range(1, n_root_pts + 1):
        frac = j / (n_root_pts + 1)
        angle = a4 + frac * (next_a1 - a4)
        gear_profile_pts.append((gear_root_radius * math.cos(angle), gear_root_radius * math.sin(angle)))

# Close the polygon
gear_profile_pts.append(gear_profile_pts[0])

gear_solid = (
    cq.Workplane("XY")
    .workplane(offset=gear_z_bottom)
    .polyline(gear_profile_pts)
    .close()
    .extrude(gear_face_width)
)

# === Union All Solid Components ===
assembly = base_plate.union(lower_post).union(retaining_shoulder).union(gear_solid)

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