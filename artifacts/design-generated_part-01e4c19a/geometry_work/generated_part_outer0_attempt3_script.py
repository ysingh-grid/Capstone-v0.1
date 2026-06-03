0 to X=1500.
- The width and depth of the keyway will be along Z and Y.
Let's perform this rotation to ensure IOU is maximum with the expected bounding box!
`result = result.rotate((0, 0, 0), (0, 1, 0), 90)`
This is clean, robust, and matches the orientation in the Design Plan perfectly.

Let's write down the clean python code now.```python
import cadquery as cq

# Define the points for the 2D profile of the stepped shaft
# The shaft axis is initially along the Z-axis.
points = [
    (0.0, 0.0),
    (28.0, 0.0),       # start of bottom chamfer (2mm)
    (30.0, 2.0),       # end of bottom chamfer
    (30.0, 150.0),     # end of Left Input Section
    (22.5, 300.0),     # end of Transition Section
    (22.5, 1198.0),    # start of shoulder chamfer
    (20.5, 1200.0),    # end of shoulder chamfer
    (20.0, 1200.0),    # inner corner of shoulder
    (20.0, 1498.0),