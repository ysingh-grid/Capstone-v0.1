import cadquery as cq

# --- PARAMETERS ---
# Overall dimensions
overall_height = 920.0
seat_width = 480.0
seat_depth = 450.0
seat_height = 460.0
seat_thickness = 20.0
backrest_height = 460.0  # From seat to top of backrest (tilted)
backrest_thickness = 20.0
backrest_recline = 12.0  # 12 degrees tilt back (102 degrees total recline)

# Legs and Bracing
leg_dia = 25.0
leg_rad = leg_dia / 2.0
brace_dia = 16.0
brace_rad = brace_dia / 2.0

# Z positions
z_floor = 0.0
z_seat_bottom = seat_height - seat_thickness  # 440.0
z_seat_top = seat_height  # 460.0
z_brace = 180.0

# --- FUNCTIONS ---
def point_at_z(p_top, p_bot, z_val):
    """Calculates coordinates of a point along a line between p_top and p_bot at a given Z level."""
    t = (z_val - p_bot[2]) / (p_top[2] - p_