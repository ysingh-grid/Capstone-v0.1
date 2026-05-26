import math
import cadquery as cq

# Parameters
num_teeth = 16
tip_diameter = 40.0
root_diameter = 32.0
thickness = 8.0
bore_diameter = 10.0

# Calculated values
num_vertices = 2 * num_teeth
tip_radius = tip_diameter / 2.0
root_radius = root_diameter / 2.0
bore_radius = bore_diameter / 2.0

# Generate the star polygon vertices
points = []
for j in range(num_vertices):
    angle = j * (2 * math.pi / num_vertices)
    r = tip_radius if j % 2 == 0 else root_radius
    x = r * math.cos(angle)
    y = r * math.sin(angle)
    points.append((x, y))

# Create the gear shape: start at first point, draw polyline through remaining points, close and extrude
gear = (
    cq.Workplane("XY")
    .moveTo(points[0][0], points[0][1])
    .polyline(points[1:])
    .close()
    .extrude(thickness)
)

# Cut the center bore
result = (
    gear
    .faces(">Z")
    .workplane()
    .circle(bore_radius)
    .cutThruAll()
)