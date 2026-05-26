import cadquery as cq

# Parameter definitions
outer_radius = 25.0
inner_radius = 22.0
length = 70.0

# Create the profile on the XZ plane and extrude it symmetrically along Y
result = (
    cq.Workplane("XZ")
    .moveTo(-outer_radius, 0)
    # Outer semicircular arc curving downwards
    .radiusArc((outer_radius, 0), -outer_radius)
    # Flat top edge on the right
    .lineTo(inner_radius, 0)
    # Inner semicircular arc curving downwards
    .radiusArc((-inner_radius, 0), inner_radius)
    # Close the profile (creates the flat top edge on the left)
    .close()
    # Extrude symmetrically in both directions along the Y-axis
    .extrude(length / 2.0, both=True)
)