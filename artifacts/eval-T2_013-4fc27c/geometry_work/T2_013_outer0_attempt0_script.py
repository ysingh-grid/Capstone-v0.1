import cadquery as cq
import math

# Parametric dimensions
outer_diameter = 60.0
thickness = 8.0
center_bore_diameter = 20.0
pitch_circle_diameter = 45.0
bolt_hole_diameter = 5.5

# Compute bolt hole positions on the pitch circle
r = pitch_circle_diameter / 2.0
angles = [0, 60, 120, 180, 240, 300]
points = [(r * math.cos(math.radians(a)), r * math.sin(math.radians(a))) for a in angles]

# Create the main cylindrical flange disc
# Standing on XY plane, extending +Z
base = cq.Workplane("XY").circle(outer_diameter / 2.0).extrude(thickness)

# Cut the center bore through the full thickness
result = base.faces(">Z").workplane().hole(center_bore_diameter)

# Cut the 6 bolt holes on the pitch circle diameter
result = result.faces(">Z").workplane().pushPoints(points).hole(bolt_hole_diameter)