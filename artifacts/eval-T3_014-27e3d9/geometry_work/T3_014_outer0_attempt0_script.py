import cadquery as cq

# Parametric dimensions
outer_radius = 10.0       # pipe outer radius (OD=20mm)
inner_radius = 8.0        # pipe inner radius (ID=16mm)
bend_radius = 35.0        # centerline bend radius
leg_separation = 70.0     # distance between parallel legs in X

# --- Build the sweep path ---
# The path is a 180-degree arc in the XZ plane.
# Arc center is at (35, 0, 0), radius=35.
# Starts at (0, 0, 0), arcs up through apex at (35, 0, 35),
# ends at (70, 0, 0).
# On the XZ workplane, radiusArc with positive radius curves toward +Z (upward).
# radiusArc from (0,0) to (70,0) with radius=35 on XZ plane.

path = (
    cq.Workplane("XZ")
    .moveTo(0, 0)
    .radiusArc((leg_separation, 0), bend_radius)
)

# --- Sweep outer profile ---
# The cross-section profile is drawn on the XY workplane at origin.
# This plane is perpendicular to the +Z direction (start tangent of path).
outer_solid = (
    cq.Workplane("XY")
    .circle(outer_radius)
    .sweep(path, isFrenet=True)
)

# --- Sweep inner profile ---
inner_solid = (
    cq.Workplane("XY")
    .circle(inner_radius)
    .sweep(path, isFrenet=True)
)

# --- Cut inner from outer to create hollow pipe ---
result = outer_solid.cut(inner_solid)