import cadquery as cq

# Parametric dimensions
outer_diameter = 20.0
inner_diameter = 16.0
outer_radius = outer_diameter / 2.0  # 10mm
inner_radius = inner_diameter / 2.0  # 8mm
bend_radius = 40.0                   # centerline bend radius

# Build the sweep path: quarter-circle arc in the XZ plane
# Starting at origin (0,0) in XZ coords = (0,0,0) in world,
# curving to (40,40) in XZ coords = (40,0,40) in world,
# with radius=40, making a quarter-circle arc
path = (
    cq.Workplane("XZ")
    .radiusArc((bend_radius, bend_radius), bend_radius)
)

# Sweep outer cylinder along the path
# The cross-section is drawn on XY plane (perpendicular to Z = path start tangent)
outer_solid = (
    cq.Workplane("XY")
    .circle(outer_radius)
    .sweep(path, isFrenet=True)
)

# Sweep inner cylinder along the same path (to subtract and create hollow pipe)
inner_solid = (
    cq.Workplane("XY")
    .circle(inner_radius)
    .sweep(path, isFrenet=True)
)

# Subtract inner from outer to create the hollow pipe elbow
result = outer_solid.cut(inner_solid)