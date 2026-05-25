import cadquery as cq

# Parameter definitions
tube_length = 200.0             # Total length of the part along Z-axis (mm)
inner_diameter = 50.0          # Diameter of the central continuous through hole (mm)
tube_outer_diameter = 70.0     # Outer diameter of the main tube section (mm)
flange_outer_diameter = 100.0  # Outer diameter of the end flange (mm)
flange_thickness = 15.0        # Thickness of the flange (mm)

# Step 1: Create the flange at the base (Z = 0 to Z = flange_thickness)
flange = (
    cq.Workplane("XY")
    .circle(flange_outer_diameter / 2.0)
    .extrude(flange_thickness)
)

# Step 2: Create the main tube body starting from the top of the flange
# (from Z = flange_thickness to Z = tube_length)
tube = (
    cq.Workplane("XY")
    .workplane(offset=flange_thickness)
    .circle(tube_outer_diameter / 2.0)
    .extrude(tube_length - flange_thickness)
)

# Step 3: Combine the flange and the tube body into a single solid
combined_body = flange.union(tube)

# Step 4: Cut the continuous inner hole through the entire combined solid.
# We select the bottom face (<Z) to center the hole and cut all the way through.
result = combined_body.faces("<Z").workplane().hole(inner_diameter)