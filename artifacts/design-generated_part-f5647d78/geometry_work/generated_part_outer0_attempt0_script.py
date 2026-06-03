import math
import cadquery as cq

# ==================== PARAMETERS ====================
# Shaft Dimensions (along Z-axis)
SHAFT_TOTAL_LENGTH = 1500.0

# Section lengths and diameters
SEC1_L = 100.0
SEC1_D = 50.0

SEC2_L = 80.0
SEC2_D = 55.0

SEC3_L = 940.0
SEC3_D = 65.0

SEC4_L = 80.0
SEC4_D = 55.0

SEC5_L = 300.0
SEC5_D = 50.0

# Transition Fillet Radius
SHOULDER_FILLET_R = 3.0

# Keyway Dimensions
KEYWAY_W = 14.0
KEYWAY_H = 5.5
KEYWAY_L = 80.0

# Mixer Hub Dimensions
HUB_OD = 120.0
HUB_THICK = 40.0
HUB_BORE = 50.0
HUB_BCD = 90.0
HUB_BOLT_D = 12.0

# Bearing (UCP 211) Dimensions
BEARING_HEIGHT = 63.5  # Shaft center to base bottom
BEARING_OD = 110.0
BEARING_WIDTH =