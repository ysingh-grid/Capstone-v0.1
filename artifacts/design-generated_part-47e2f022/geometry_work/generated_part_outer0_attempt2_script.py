import cadquery as cq
import math

# Parametric dimensions
hub_base_diam = 100.0
hub_top_diam = 30.0
hub_height = 60.0
bore_diam = 15.0
num_blades = 7
blade_thickness = 2.0
blade_twist = 60.0

# Create the truncated cone hub and cut the central bore hole
hub = (
    cq.Workplane("XY")
    .circle(hub_base_diam / 2.0)
    .workplane(offset=hub_height)
    .circle(hub_top_diam / 2.0)
    .loft(clean=True)
    .faces("<Z")
    .workplane()
    .hole(bore_diam)
)

# Build a single twisted, tapered blade using a loft of multiple 2D cross-sections
steps = 15  # Number of Z-sections to define the smooth twisted shape
wires = []
penetration = 2.0  # Extra depth into the hub to guarantee clean union without gaps

for i in range(steps):
    # Normalized height parameter (0.0 at base to 1.0 at top)
    t = i / (steps - 1)
    z = t * hub_height
    
    # Calculate radius of hub at this height
    r_hub = (hub_base_diam / 2.0) - t * ((hub_base_diam - hub_top_diam) / 2.0)
    
    # Protrusion at this height (tapers from 15.0 to 5.0)
    prot = 15.0 - t * 10.0
    
    r_in = r_hub - penetration
    r_out = r_hub + prot
    
    # Twist angle in radians
    angle = math.radians(t * blade_twist)
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)
    
    w = blade_thickness
    
    # Calculate the 4 points of the blade profile
    p1_x = r_in * cos_a - (w / 2.0) * sin_a
    p1_y = r_in * sin_a + (w / 2.0) * cos_a
    
    p2_x = r_in * cos_a + (w / 2.0) * sin_a
    p2_y = r_in * sin_a - (w / 2.0) * cos_a
    
    p3_x = r_out * cos_a + (w / 2.0) * sin_a
    p3_y = r_out * sin_a - (w / 2.0) * cos_a
    
    p4_x = r_out * cos_a - (w / 2.0) * sin_a
    p4_y = r_out * sin_a + (w / 2.0) * cos_a
    
    # Create a 2D wire on a workplane offset by z
    wp = (
        cq.Workplane("XY", origin=(0, 0, z))
        .moveTo(p1_x, p1_y)
        .lineTo(p2_x, p2_y)
        .lineTo(p3_x, p3_y)
        .lineTo(p4_x, p4_y)
        .close()
        .wire()
    )
    wires.append(wp.val())

# Loft the wires to create a single solid blade
blade_solid = cq.Solid.makeLoft(wires)

# Rotate and union the blades with the hub
result = hub
for i in range(num_blades):
    angle = i * (360.0 / num_blades)
    rotated_blade = blade_solid.rotate((0, 0, 0), (0, 0, 1), angle)
    result = result.union(rotated_blade)