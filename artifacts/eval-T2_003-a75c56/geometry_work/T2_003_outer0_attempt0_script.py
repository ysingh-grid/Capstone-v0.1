import cadquery as cq

# ================== PARAMETERS ==================
shaft_diameter = 10.0  # Diameter of the cylindrical shaft (mm)
shaft_length = 30.0    # Length of the cylindrical shaft (mm)
head_diameter = 19.6   # Circumscribed circle diameter of the hex head (mm) (~17mm flat-to-flat)
head_height = 7.0      # Height of the hex head (mm)

# ================== SOLID GENERATION ==================

# 1. Create the cylindrical shaft starting at Z=0 and extruding up to Z=30
result = (
    cq.Workplane("XY")
    .circle(shaft_diameter / 2.0)
    .extrude(shaft_length)
)

# 2. Select the top face of the shaft (at Z=30) to define the base for the hex head
result = result.faces(">Z").workplane()

# 3. Draw and extrude the hexagonal head (6-sided polygon) on top of the shaft
result = result.polygon(6, head_diameter).extrude(head_height)