import cadquery as cq
import math

# --- Parameters ---
hub_diameter = 16.0
hub_radius = hub_diameter / 2.0
hub_length = 40.0
hub_z_start = 0.0
hub_z_end = 40.0

bore_diameter = 8.0
bore_radius = bore_diameter / 2.0

# Large gear parameters
large_num_teeth = 24
large_tip_radius = 27.0
large_root_radius = 22.0
large_z_start = 3.0
large_z_end = 13.0
large_face_width = large_z_end - large_z_start  # 10mm

# Small gear parameters
small_num_teeth = 14
small_tip_radius = 16.0
small_root_radius = 13.0
small_z_start = 20.0
small_z_end = 30.0
small_face_width = small_z_end - small_z_start  # 10mm

# --- Helper: generate star-polygon points for gear profile ---
def gear_polygon_points(num_teeth, tip_radius, root_radius):
    """
    Generate star-polygon points for a spur gear profile.
    Each tooth has one tip point and one root valley point.
    Total points = 2 * num_teeth, alternating tip and root.
    Angular spacing = 360 / (2 * num_teeth) degrees per point.
    """
    num_points = 2 * num_teeth
    angle_step = 360.0 / num_points  # degrees per point
    points = []
    for i in range(num_points):
        angle_deg = i * angle_step
        angle_rad = math.radians(angle_deg)
        # Even index = tip (tooth), odd index = root (valley)
        if i % 2 == 0:
            r = tip_radius
        else:
            r = root_radius
        x = r * math.cos(angle_rad)
        y = r * math.sin(angle_rad)
        points.append((x, y))
    return points

# --- Build hub cylinder (Z=0 to Z=40) ---
# Hub centered at origin in XY, standing along Z
hub = (
    cq.Workplane("XY")
    .workplane(offset=hub_z_start)
    .circle(hub_radius)
    .extrude(hub_length)
)

# --- Build large gear body (Z=3 to Z=13) ---
large_gear_pts = gear_polygon_points(large_num_teeth, large_tip_radius, large_root_radius)

large_gear = (
    cq.Workplane("XY")
    .workplane(offset=large_z_start)
    .polyline(large_gear_pts)
    .close()
    .extrude(large_face_width)
)

# --- Build small gear body (Z=20 to Z=30) ---
small_gear_pts = gear_polygon_points(small_num_teeth, small_tip_radius, small_root_radius)

small_gear = (
    cq.Workplane("XY")
    .workplane(offset=small_z_start)
    .polyline(small_gear_pts)
    .close()
    .extrude(small_face_width)
)

# --- Union hub + large gear + small gear ---
compound = hub.union(large_gear).union(small_gear)

# --- Subtract central bore (8mm diameter, full length Z=0 to Z=40) ---
# Create bore cylinder slightly longer to ensure clean cut
bore_cutter = (
    cq.Workplane("XY")
    .workplane(offset=-1.0)  # start 1mm below Z=0
    .circle(bore_radius)
    .extrude(hub_length + 2.0)  # extend 1mm beyond Z=40
)

result = compound.cut(bore_cutter)