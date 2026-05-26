import cadquery as cq

# Define parametric dimensions for the flat washer
outer_diameter = 20.0
inner_diameter = 10.5
thickness = 2.0

# Calculate outer radius
outer_radius = outer_diameter / 2.0

# Build the washer:
# 1. Create a circular disk of the outer radius on the XY plane.
# 2. Extrude it in the +Z direction by the specified thickness.
# 3. Create a workplane on the top face (at Z = thickness).
# 4. Drill a concentric hole of the inner diameter through the entire part.
result = (
    cq.Workplane("XY")
    .circle(outer_radius)
    .extrude(thickness)
    .faces(">Z")
    .workplane()
    .hole(inner_diameter)
)