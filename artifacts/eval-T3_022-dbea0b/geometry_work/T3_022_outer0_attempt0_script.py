import cadquery as cq

# Define parametric variables
hub_diameter = 30.0
hub_radius = hub_diameter / 2.0
hub_height = 12.0

rim_outer_diameter = 100.0
rim_outer_radius = rim_outer_diameter / 2.0
rim_inner_diameter = 88.0
rim_inner_radius = rim_inner_diameter / 2.0
rim_height = 8.0

spoke_width = 8.0
spoke_height = 8.0
# The spokes span from the inner edge of the rim on one side to the other
spoke_length = rim_inner_radius * 2

bore_diameter = 14.0
bore_radius = bore_diameter / 2.0

# 1. Create the central hub lying on the XY plane (Z from 0 to 12)
hub = cq.Workplane("XY").cylinder(
    height=hub_height, 
    radius=hub_radius, 
    centered=(True, True, False)
)

# 2. Create the outer rim ring (Z from 0 to 8)
rim = (
    cq.Workplane("XY")
    .circle(rim_outer_radius)
    .circle(rim_inner_radius)
    .extrude(rim_height)
)

# 3. Create the X-aligned spokes (Z from 0 to 8)
spokes_x = cq.Workplane("XY").box(
    spoke_length, 
    spoke_width, 
    spoke_height, 
    centered=(True, True, False)
)

# 4. Create the Y-aligned spokes (Z from 0 to 8)
spokes_y = cq.Workplane("XY").box(
    spoke_width, 
    spoke_length, 
    spoke_height, 
    centered=(True, True, False)
)

# 5. Union all components together
handwheel_solid = hub.union(rim).union(spokes_x).union(spokes_y)

# 6. Cut the center bore through the full height of the hub
# We make the cutting cylinder slightly taller and shift it down to ensure a clean cut
bore_height = hub_height + 4.0
bore_tool = (
    cq.Workplane("XY")
    .cylinder(height=bore_height, radius=bore_radius, centered=(True, True, False))
    .translate((0, 0, -2.0))
)

# Assign the final shape to result
result = handwheel_solid.cut(bore_tool)