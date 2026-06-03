result = shaft.union(bearing_l).union(bearing_r).union(hub)
except Exception:
    # Fallback to compounding them
    result = cq.Workplane("XY")
    result.objects = [shaft.val(), bearing_l.val(), bearing_r.val(), hub.val()]