import cadquery as cq

# --- PARAMETERS ---
length = 24.0          # Dimension along X (mm)
width = 24.0           # Dimension along Y (mm)
thickness = 3.0        # Thickness along Z (mm)
hole_diameter = 10.5   # Central through-hole diameter (mm)

# --- CONSTRUCTION ---
# Create the square plate on the XY plane.
# Setting centered=(True, True, False) ensures the part is centered on X and Y,
# but starts at Z=0 and extends to Z=thickness (3.0mm).
result = (
    cq.Workplane("XY")
    .box(length, width, thickness, centered=(True, True, False))
    # Select the top face (>Z) to locate the center of the hole
    .faces(">Z")
    .workplane()
    # Create the central through-hole
    .hole(hole_diameter)
)