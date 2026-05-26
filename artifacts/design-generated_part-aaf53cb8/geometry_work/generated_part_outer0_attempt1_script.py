```python
import cadquery as cq
import math

# --- Parameters ---
bb_center = cq.Vector(-435.0, 0.0, -300.0)
bb_length = 73.0
bb_od = 45.0
bb_id = 38.0

st_angle = 75.0  # degrees
st_length = 430.0
st_od = 34.9
st_id = 31.6

ht_angle = 66.0  # degrees
ht_length = 110.0
ht_od = 50.0
ht_id = 44.0
ht_center = cq.Vector(-850.0, 0.0, 200.0)

# Dropouts
dropout_y = 74.0
dropout_thick = 12.0
dropout_outer_r = 25.0
axle_hole_r = 6.0

# Tubes
dt_od = 50.0
dt_id = 44.0

# Helper function to create straight cylinders
def make_cyl(start, end, radius):
    direction = (end - start).normalized()
    plane = cq.Plane(start, direction)
    return cq.Workplane(plane).circle(radius).extrude((end - start).Length)

# ---