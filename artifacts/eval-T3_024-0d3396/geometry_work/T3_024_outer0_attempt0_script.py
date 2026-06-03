import cadquery as cq
import math

# --- Parametric Dimensions ---
main_disc_diameter = 120.0
main_disc_radius = 60.0
main_disc_thickness = 20.0

hub_boss_diameter = 40.0
hub_boss_radius = 20.0
hub_boss_height = 10.0

center_bore_diameter = 16.0
center_bore_radius = 8.0
total_height = 30.0  # disc + hub boss

lightening_hole_diameter = 22.0
lightening_hole_radius = 11.0
pitch_circle_radius = 35.0
num_lightening_holes = 6

# --- Step 1: Create main disc, bottom at Z=0, top at Z=20 ---
# centered=(True, True, False) centers X and Y but starts at Z=0
main_disc = (
    cq.Workplane("XY")
    .cylinder(main_disc_thickness, main_disc_radius, centered=(True, True, False))
)

# --- Step 2: Create hub boss, bottom at Z=20, top at Z=30 ---
# Shift origin to Z=20 so the boss sits on top of the disc
hub_boss = (
    cq.Workplane("XY").workplane(offset=main_disc_thickness)
    .cylinder(hub_boss_height, hub_boss_radius, centered=(True, True, False))
)

# --- Step 3: Union disc and hub boss ---
flywheel = main_disc.union(hub_boss)

# --- Step 4: Subtract central bore through entire height (Z=0 to Z=30) ---
center_bore = (
    cq.Workplane("XY")
    .cylinder(total_height, center_bore_radius, centered=(True, True, False))
)
flywheel = flywheel.cut(center_bore)

# --- Step 5: Subtract 6 lightening holes through the disc (Z=0 to Z=20) ---
# Compute hole centers on the pitch circle
hole_points = []
for i in range(num_lightening_holes):
    angle_deg = i * 60.0  # 0, 60, 120, 180, 240, 300 degrees
    angle_rad = math.radians(angle_deg)
    x = pitch_circle_radius * math.cos(angle_rad)
    y = pitch_circle_radius * math.sin(angle_rad)
    hole_points.append((x, y))

# Create all lightening holes using pushPoints for correct placement
lightening_holes = (
    cq.Workplane("XY")
    .pushPoints(hole_points)
    .circle(lightening_hole_radius)
    .extrude(main_disc_thickness)
)

flywheel = flywheel.cut(lightening_holes)

# --- Final result ---
result = flywheel