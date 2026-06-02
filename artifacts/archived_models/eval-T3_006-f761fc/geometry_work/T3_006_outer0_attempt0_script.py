import cadquery as cq

# Define parametric variables
base_radius = 25.0
base_height = 5.0
belly_radius = 28.0
belly_height = 25.0
shoulder_radius = 22.0
shoulder_height = 45.0
neck_radius = 10.0
neck_start_height = 55.0
neck_end_height = 65.0
wall_thickness = 2.0

# Create the 2D profile of the bottle on the XZ plane.
# The X-axis represents the radial distance, and the Z-axis represents the height.
# In CQ, the local coordinates of the XZ plane are (X, Z).
profile = (
    cq.Workplane("XZ")
    .lineTo(base_radius, 0)                        # Base bottom edge
    .lineTo(base_radius, base_height)              # Vertical base wall
    .lineTo(belly_radius, belly_height)            # Outward flare to belly
    .lineTo(shoulder_radius, shoulder_height)      # Inward slope to shoulder
    .lineTo(neck_radius, neck_start_height)        # Inward slope to neck start
    .lineTo(neck_radius, neck_end_height)          # Vertical neck wall
    .lineTo(0, neck_end_height)                    # Top surface to center axis
    .close()                                       # Close the profile along the Z-axis
)

# Revolve the profile 360 degrees around the Z-axis to create a solid bottle.
# The Z-axis is defined by the vector from (0,0,0) to (0,0,1).
bottle_solid = profile.revolve(360, (0, 0, 0), (0, 0, 1))

# Hollow out the bottle by removing the top face (at Z = 65) 
# and shelling inward with the specified wall thickness.
result = bottle_solid.faces(">Z").shell(-wall_thickness)