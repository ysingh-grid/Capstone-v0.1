def make_cyl(start, end, radius):
        direction = (end - start).normalized()
        plane = cq.Plane(start, direction)
        return cq.Workplane(plane).circle(radius).extrude((end - start).Length)