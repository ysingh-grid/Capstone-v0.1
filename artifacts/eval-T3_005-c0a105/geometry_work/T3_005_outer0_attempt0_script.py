import cadquery as cq
import math

# --- Parametric dimensions ---
flange_od = 50.0          # Flange outer diameter
flange_r = flange_od / 2  # Flange outer radius = 25mm
flange_t = 5.0            # Flange thickness
pipe_od = 30.0            # Pipe wall outer diameter
pipe_r = pipe_od / 2      # Pipe outer radius = 15mm
pipe_h = 50.0             # Total pipe height
bore_d = 20.0             # Central bore diameter
bore_r = bore_d / 2       # Central bore radius = 10mm
bolt_circle_d = 40.0      # Bolt circle diameter
bolt_circle_r = bolt_circle_d / 2  # Bolt circle radius = 20mm
bolt_hole_d = 6.0         # Bolt hole diameter
num_bolts = 4             # Number of bolt holes

# Bottom flange Z range: 0 to 5
bottom_flange_z_start = 0.0
bottom_flange_z_end = 5.0

# Top flange Z range: 45 to 50
top_flange_z_start = 45.0
top_flange_z_end = 50.0

# --- Step 1: Build bottom flange disc (Z=0 to Z=5) ---
# Centered in XY, bottom at Z=0
bottom_flange = (
    cq.Workplane("XY")
    .workplane(offset=bottom_flange_z_start)
    .cylinder(flange_t, flange_r, centered=(True, True, False))
)

# --- Step 2: Build pipe wall cylinder (Z=0 to Z=50) ---
pipe_wall = (
    cq.Workplane("XY")
    .workplane(offset=0.0)
    .cylinder(pipe_h, pipe_r, centered=(True, True, False))
)

# --- Step 3: Build top flange disc (Z=45 to Z=50) ---
top_flange = (
    cq.Workplane("XY")
    .workplane(offset=top_flange_z_start)
    .cylinder(flange_t, flange_r, centered=(True, True, False))
)

# --- Step 4: Union all three solid cylinders ---
solid = bottom_flange.union(pipe_wall).union(top_flange)

# --- Step 5: Cut central bore (D=20mm, full Z=0 to Z=50, with epsilon overcut) ---
epsilon = 1.0  # small overcut to ensure clean through-bore
bore_cutter = (
    cq.Workplane("XY")
    .workplane(offset=-epsilon)
    .cylinder(pipe_h + 2 * epsilon, bore_r, centered=(True, True, False))
)
solid = solid.cut(bore_cutter)

# --- Step 6: Drill four bolt holes through bottom flange (Z=0 to Z=5) ---
# Compute bolt hole XY positions at 0, 90, 180, 270 degrees
bolt_positions = [
    (bolt_circle_r * math.cos(math.radians(a)),
     bolt_circle_r * math.sin(math.radians(a)))
    for a in [0, 90, 180, 270]
]

# Bottom flange bolt holes: drill from below with overcut epsilon
bottom_bolt_cutter = (
    cq.Workplane("XY")
    .workplane(offset=-epsilon)
    .pushPoints(bolt_positions)
    .circle(bolt_hole_d / 2)
    .extrude(flange_t + 2 * epsilon)
)
solid = solid.cut(bottom_bolt_cutter)

# --- Step 7: Drill four bolt holes through top flange (Z=45 to Z=50) ---
top_bolt_cutter = (
    cq.Workplane("XY")
    .workplane(offset=top_flange_z_start - epsilon)
    .pushPoints(bolt_positions)
    .circle(bolt_hole_d / 2)
    .extrude(flange_t + 2 * epsilon)
)
solid = solid.cut(top_bolt_cutter)

# --- Final result ---
result = solid