```python
import math
import cadquery as cq

# Helper function to create hollow or solid tubes between two points
def make_tube(start, end, outer_r, inner_r=None):
    start = cq.Vector(start)
    end = cq.Vector(end)
    v = end - start
    length = v.Length
    if length < 1e-5:
        return None
    direction = v.normalized()
    plane = cq.Plane(origin=start, normal=direction)
    wp = cq.Workplane(plane).circle(outer_r)
    if inner_r and inner_r < outer_r:
        wp = wp.circle(inner_r)
    return wp.extrude(length)

# Define key positions and parameters based on standard frame geometry
# Origin (0,0,0) is at the rear axle

# 1. Bottom Bracket (BB)
# Center offset from axle: horizontal -435mm, vertical -300mm
bb_center = cq.Vector(-435.0, 0.0, -300.0)
bb_length = 73.0
bb_outer_r = 45.0 / 2.0
bb_inner_r = 38.0 / 2.0
start_bb = bb_center + cq.Vector(0, -bb_length/2.0, 0)
end