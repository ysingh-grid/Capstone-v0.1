import cadquery as cq
import math

# -----------------------------------------------------------------------------
# Parametric Dimensions
# -----------------------------------------------------------------------------
# Hub
HUB_DIAMETER = 14.0
HUB_LENGTH = 55.0

# Central Bore & Keyway
BORE_DIAMETER = 6.0
KEYWAY_WIDTH = 3.0  # Along Y
KEYWAY_DEPTH = 2.0  # Radial depth from bore (3mm to 5mm along X)

# Gear 1 (24-tooth)
GEAR1_TEETH = 24
GEAR1_TIP_RAD = 54.0 / 2.0   # 27.0 mm
GEAR1_ROOT_RAD = 44.0 / 2.0  # 22.0 mm
GEAR1_Z_START = 2.0
GEAR1_WIDTH = 8.0            # Z=2 to Z=10

# Gear 2 (18-tooth)
GEAR2_TEETH = 18
GEAR2_TIP_RAD = 42.0 / 2.0   # 21.0 mm
GEAR2_ROOT_RAD = 34.0 / 2.0  # 17.0 mm
GEAR2_Z_START = 18.0
GEAR2_WIDTH = 8.0            # Z=18 to Z=26

# Gear 3 (12-tooth)
GEAR3_TEETH = 12
GEAR3_TIP_RAD = 30.0 / 2.0   # 15.0 mm
GEAR3_ROOT_RAD = 24.0 / 2.0  # 12.0 mm
GEAR3_Z_START = 34.0
GEAR3_WIDTH = 8.0            # Z=34 to Z=42


# -----------------------------------------------------------------------------
# Helper Function for Star-Polygon Profile
# -----------------------------------------------------------------------------
def get_star_polygon_points(teeth, r_tip, r_root):
    """
    Generates a list of 2D points representing a star-polygon tooth profile.
    Alternates between tip and root radii to form sharp, triangular teeth.
    """
    pts = []
    num_points = teeth * 2
    for i in range(num_points):
        angle = i * (2.0 * math.pi / num_points)
        r = r_tip if i % 2 == 0 else r_root
        x = r * math.cos(angle)
        y = r * math.sin(angle)
        pts.append((x, y))
    return pts


# -----------------------------------------------------------------------------
# Geometry Construction
# -----------------------------------------------------------------------------

# 1. Base Hub (standing upright on XY plane, from Z=0 to Z=55)
hub = (
    cq.Workplane("XY")
    .cylinder(HUB_LENGTH, HUB_DIAMETER / 2.0)
    .translate((0, 0, HUB_LENGTH / 2.0))
)

# 2. Construct Gear 1 (Z=2 to Z=10)
pts1 = get_star_polygon_points(GEAR1_TEETH, GEAR1_TIP_RAD, GEAR1_ROOT_RAD)
gear1 = (
    cq.Workplane("XY")
    .workplane(offset=GEAR1_Z_START)
    .moveTo(pts1[0][0], pts1[0][1])
    .polyline(pts1[1:])
    .close()
    .extrude(GEAR1_WIDTH)
)

# 3. Construct Gear 2 (Z=18 to Z=26)
pts2 = get_star_polygon_points(GEAR2_TEETH, GEAR2_TIP_RAD, GEAR2_ROOT_RAD)
gear2 = (
    cq.Workplane("XY")
    .workplane(offset=GEAR2_Z_START)
    .moveTo(pts2[0][0], pts2[0][1])
    .polyline(pts2[1:])
    .close()
    .extrude(GEAR2_WIDTH)
)

# 4. Construct Gear 3 (Z=34 to Z=42)
pts3 = get_star_polygon_points(GEAR3_TEETH, GEAR3_TIP_RAD, GEAR3_ROOT_RAD)
gear3 = (
    cq.Workplane("XY")
    .workplane(offset=GEAR3_Z_START)
    .moveTo(pts3[0][0], pts3[0][1])
    .polyline(pts3[1:])
    .close()
    .extrude(GEAR3_WIDTH)
)

# 5. Union Hub and Gears to form the solid blank
blank = hub.union(gear1).union(gear2).union(gear3)

# 6. Create the Cut Tools (Bore and Keyway)
# Central cylindrical bore running full length
bore = (
    cq.Workplane("XY")
    .cylinder(HUB_LENGTH, BORE_DIAMETER / 2.0)
    .translate((0, 0, HUB_LENGTH / 2.0))
)

# Keyway slot on the +X side.
# Starts at X=0, goes to X=5.0 (bore radius 3mm + keyway depth 2mm).
# Centered in Y with width 3mm.
keyway_width_x = (BORE_DIAMETER / 2.0) + KEYWAY_DEPTH
keyway = (
    cq.Workplane("XY")
    .box(keyway_width_x, KEYWAY_WIDTH, HUB_LENGTH)
    .translate((keyway_width_x / 2.0, 0, HUB_LENGTH / 2.0))
)

# Combine the bore and keyway into a single cut profile
internal_cuts = bore.union(keyway)

# 7. Perform the cut on the blank to finalize the part
result = blank.cut(internal_cuts)