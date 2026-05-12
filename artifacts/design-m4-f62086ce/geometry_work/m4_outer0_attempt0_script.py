import cadquery as cq

# Parametric dimensions (all in millimetres)
head_diameter_mm = 6.0          # Circumscribed diameter of hex head
head_height_mm   = 3.0           # Height of the hex head
shank_diameter_mm = 4.0          # Diameter of the cylindrical shank
total_length_mm   = 20.0         # Total length of the screw

# Derived dimensions
shank_length_mm = total_length_mm - head_height_mm   # Length of the shank

# Build the screw
result = (
    # Create the hex head on the XY plane, centred at the origin
    cq.Workplane("XY")
        .polygon(6, head_diameter_mm)   # Regular hexagon with circumscribed diameter
        .extrude(head_height_mm)        # Extrude to form the head

    # Create the shank directly below the head
    .workplane(offset=-head_height_mm)  # Move down to start of shank
        .cylinder(
            height=shank_length_mm,
            radius=shank_diameter_mm / 2.0,
            center=True
        )
)