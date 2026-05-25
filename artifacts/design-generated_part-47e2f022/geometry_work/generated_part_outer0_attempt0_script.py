```python
import cadquery as cq

# Parametric dimensions
hub_base_diam = 100.0
hub_top_diam = 30.0
hub_height = 60.0
bore_diam = 15.0
num_blades = 7
blade_thickness = 2.0
blade_prot_base = 15.0
blade_prot_top = 5.0
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