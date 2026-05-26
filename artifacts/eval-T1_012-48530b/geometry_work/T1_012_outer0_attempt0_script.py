import cadquery as cq

# --- Parametric Variables ---
# Circumscribed circle diameter of the equilateral triangle cross-section (mm)
circumscribed_diameter = 30.0
# Extrusion length along the Z-axis (mm)
extrusion_length = 50.0

# --- Construction ---
# Create an equilateral triangle sketch on the XY plane with its centroid at the origin.
# The polygon method uses the circumscribed circle diameter.
# Then, extrude the sketch along the Z-axis to create the prism.
result = (
    cq.Workplane("XY")
    .polygon(3, circumscribed_diameter)
    .extrude(extrusion_length)
)