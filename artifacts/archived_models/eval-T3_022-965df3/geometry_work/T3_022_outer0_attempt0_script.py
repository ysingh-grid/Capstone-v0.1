import cadquery as cq

# --- Parameters ---
hub_diameter = 30.0
hub_height = 12.0
center_bore_diameter = 14.0

rim_outer_diameter = 100.0
rim_inner_diameter = 88.0
rim_height = 8.0

spoke_width = 8.0
spoke_height = 8.0
# The spoke span (92mm) ensures the spokes overlap into the rim (radius 44 to 50)
# and into the hub (radius 15) to ensure a clean union without gaps.
spoke_span = 92.0

# --- Construction ---

# 1. Create the central solid hub standing on the XY plane (Z=0 to Z=12)
hub = cq.Workplane("XY").circle(hub_diameter / 2).extrude(hub_height)

# 2. Create the outer rim ring on the XY plane (Z=0 to Z=8)
rim = (
    cq.Workplane("XY")
    .circle(rim_outer_diameter / 2)
    .circle(rim_inner_diameter / 2)
    .extrude(rim_height)
)

# 3. Create the spokes along the X and Y axes (Z=0 to Z=8)
spoke_x = cq.Workplane("XY").rect(spoke_span, spoke_width).extrude(spoke_height)
spoke_y = cq.Workplane("XY").rect(spoke_width, spoke_span).extrude(spoke_height)

# 4. Union the hub, rim, and spokes into a single solid body
handwheel = hub.union(rim).union(spoke_x).union(spoke_y)

# 5. Drill the center bore through the entire height of the hub.
# Since the hub is the tallest element (12mm), faces(">Z") uniquely selects the top of the hub.
result = (
    handwheel.faces(">Z")
    .workplane()
    .hole(center_bore_diameter)
)