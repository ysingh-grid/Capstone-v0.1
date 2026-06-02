import cadquery as cq

# ==========================================
# PARAMETERS
# ==========================================
# Wall dimensions
wall_width = 400.0
wall_thickness = 100.0
wall_height = 300.0

# Indoor unit dimensions
indoor_width = 260.0
indoor_depth = 60.0
indoor_height = 80.0
indoor_z_pos = 210.0  # Bottom of indoor unit

# Outdoor unit dimensions
outdoor_width = 200.0
outdoor_depth = 100.0
outdoor_height = 160.0
outdoor_z_pos = 70.0  # Bottom of outdoor unit

# Fan dimensions
fan_cavity_diameter = 110.0
fan_cavity_depth = 15.0

# ==========================================
# 1. DIVIDING WALL
# ==========================================
# Center the wall on the origin, extending from Y = -50 to Y = +50, Z from 0 to 300
wall = cq.Workplane("XY").box(wall_width, wall_thickness, wall_height, centered=(True, True, False))

# ==========================================
# 2. INDOOR UNIT (Evaporator)
# ==========================================
# Positioned at Y < -50 (negative Y side