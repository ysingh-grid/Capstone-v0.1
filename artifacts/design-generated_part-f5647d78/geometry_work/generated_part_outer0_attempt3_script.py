import cadquery as cq

# Create the shaft segments
s1 = cq.Workplane("YZ").workplane(offset=0.0).circle(25.0).extrude(100.0)
s2 = cq.Workplane("YZ").workplane(offset=100.0).circle(27.5).extrude(80.0)
s3 = cq.Workplane("YZ").workplane(offset=180.0).circle(32.5).extrude(940.0)
s4 = cq.Workplane("YZ").workplane(offset=1120.0).circle(27.5).extrude(80.0)
s5 = cq.Workplane("YZ").workplane(offset=1200.0).circle(25.0).extrude(300.0)

# Union the shaft parts
shaft = s1.union(s2).union(s3).union(s4).union(s5)

# Apply safe shoulder fillets
try:
    shaft = shaft.edges("%Circle").fillet(2.0)
except Exception:
    pass

# Drive section keyway
keyway1 = cq.Workplane("XY").workplane(offset=19.5).box(80, 14, 20, centered=(False, True, False)).translate((10, 0, 0))

# Mixer section keyway
keyway2 = cq.Workplane("XY").workplane(offset=19.5).box(30, 14, 20, centered=(False, True, False)).translate((1205, 0, 0))

# Cut keyways from shaft
shaft = shaft.cut(keyway1).cut(keyway2)

# UCP 211 Bearing generator
def make_bearing():
    # Base plate: 220 mm along Y, 60 mm along X, 25 mm thick
    # Shaft center is at Z=0. Base plate is from Z = -64 to Z = -39.
    base = cq.Workplane("XY").workplane(offset=-51.5).box(60, 220, 25, centered=(True, True, True))
    
    # Mount holes: 20 mm dia, spaced 171 mm along Y
    base = base.faces(">Z").workplane().rect(0, 171, extremes=True).vertices().hole(20)
    
    # Housing cylinder: along X axis (YZ plane)
    housing = cq.Workplane("YZ").workplane(offset=-30.0).circle(70.0).extrude(60.0)
    
    # Combine housing and base
    bearing_body = base.union(housing)
    
    # Bore hole: radius 27.5 (dia 55)
    bore = cq.Workplane("YZ").workplane(offset=-31.0).circle(27.5).extrude(62.0)
    
    return bearing_body.cut(bore)

bearing_l = make_bearing().translate((140.0, 0, 0))
bearing_r = make_bearing().translate((1160.0, 0, 0))

# Rigid Mixer Attachment Hub
hub_body = cq.Workplane("YZ").workplane(offset=1200.0).circle(60.0).extrude(40.0)
hub_bore = cq.Workplane("YZ").workplane(offset=1199.0).circle(25.0).extrude(42.0)
hub = hub_body.cut(hub_bore).cut(keyway2)

# Create compound of all parts to avoid boolean errors
compound = cq.Compound.makeCompound([
    shaft.val(),
    bearing_l.val(),
    bearing_r.val(),
    hub.val()
])

# Final result
result = cq.Workplane("XY").newObject([compound])