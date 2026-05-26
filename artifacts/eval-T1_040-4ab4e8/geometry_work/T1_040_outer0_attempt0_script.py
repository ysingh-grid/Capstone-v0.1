import cadquery as cq

# Parametric dimensions
diameter = 38.0
thickness = 3.0
fillet_radius = 0.5

# Calculate radius from diameter
radius = diameter / 2.0

# Create the coin-shaped disc
# By default, cylinder is centered on the origin (XY plane, centered in Z)
coin = cq.Workplane("XY").cylinder(height=thickness, radius=radius)

# Select the top and bottom circular faces, then grab their outer edges to apply the fillet
result = coin.faces(">Z or <Z").edges().fillet(fillet_radius)