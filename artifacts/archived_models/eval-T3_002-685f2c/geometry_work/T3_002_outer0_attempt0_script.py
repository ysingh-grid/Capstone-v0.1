import cadquery as cq

# ================== PARAMETERS ==================
# Outer dimensions of the enclosure
length_x = 80.0
width_y = 50.0
height_z = 25.0

# Shell and fillet properties
wall_thickness = 2.0
corner_fillet_radius = 8.0

# Mounting hole parameters
hole_diameter = 3.2
hole_pitch_x = 64.0
hole_pitch_y = 34.0

# ================== MODEL GENERATION ==================

# 1. Create the outer box centered on the XY plane, sitting on Z=0 (Z ranges from 0 to height_z)
result = cq.Workplane("XY").box(
    length_x, 
    width_y, 
    height_z, 
    centered=(True, True, False)
)

# 2. Fillet the four vertical edges to give a smooth rounded-rectangle cross-section
result = result.edges("|Z").fillet(corner_fillet_radius)

# 3. Shell the body inward, removing the top face (+Z) to create the hollow cavity
# Negative thickness shells inward, preserving the specified outer dimensions
result = result.faces(">Z").shell(-wall_thickness)

# 4. Define the 4 mounting hole locations relative to the origin
hole_points = [
    (-hole_pitch_x / 2.0, -hole_pitch_y / 2.0),
    (-hole_pitch_x / 2.0,  hole_pitch_y / 2.0),
    ( hole_pitch_x / 2.0, -hole_pitch_y / 2.0),
    ( hole_pitch_x / 2.0,  hole_pitch_y / 2.0)
]

# 5. Drill the mounting holes through the bottom face
result = (
    result.faces("<Z")
    .workplane()
    .pushPoints(hole_points)
    .hole(hole_diameter)
)