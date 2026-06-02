import cadquery as cq

# Parametric dimensions
base_length_x = 60.0
base_width_y = 40.0
base_thickness_z = 3.0

fin_height_z = 15.0
fin_thickness_x = 2.0
fin_width_y = 40.0
fin_positions_x = [-24.0, -12.0, 0.0, 12.0, 24.0]

# Create the base plate centered in XY, sitting on Z=0
base_plate = cq.Workplane("XY").box(
    base_length_x, 
    base_width_y, 
    base_thickness_z, 
    centered=(True, True, False)
)

# Select the top face of the base plate to define the workplane for the fins
# Create and extrude the 5 cooling fins using pushed points
result = (
    base_plate.faces(">Z")
    .workplane()
    .pushPoints([(x, 0.0) for x in fin_positions_x])
    .rect(fin_thickness_x, fin_width_y)
    .extrude(fin_height_z)
)