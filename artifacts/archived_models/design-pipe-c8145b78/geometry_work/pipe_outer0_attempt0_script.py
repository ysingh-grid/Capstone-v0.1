import cadquery as cq

# Parametric dimensions
tube_length = 200.0          # Total length of the tube along Z-axis
inner_dia = 50.0             # Diameter of the inner through-hole
tube_outer_dia = 60.0        # Outer diameter of the tube body (5mm wall thickness)
flange_outer_dia = 100.0     # Outer diameter of the end flange
flange_thickness = 10.0      # Thickness of the flange at the end

# Step 1: Create the main tube body standing on the XY plane
tube_outer = cq.Workplane("XY").cylinder(
    height=tube_length, 
    radius=tube_outer_dia / 2.0, 
    centered=(True, True, False)
)

# Step 2: Create the coaxial flange at the bottom (Z=0)
flange = cq.Workplane("XY").cylinder(
    height=flange_thickness, 
    radius=flange_outer_dia / 2.0, 
    centered=(True, True, False)
)

# Step 3: Combine both outer shapes into a single solid
combined_outer = tube_outer.union(flange)

# Step 4: Cut the 50mm coaxial through-hole from the bottom face all the way through
result = combined_outer.faces("<Z").workplane().hole(inner_dia)