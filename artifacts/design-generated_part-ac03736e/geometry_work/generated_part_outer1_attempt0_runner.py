
import json
import sys
import os

# Redirect the user code's output
_autofab_output = {"success": False}

try:
    # Execute the generated CadQuery code
    _autofab_user_globals = {}
    exec(open("/Users/ysingh/PycharmProjects/Capstone-v0.1/artifacts/design-generated_part-ac03736e/geometry_work/generated_part_outer1_attempt0_script.py").read(), _autofab_user_globals)

    # Find the CadQuery result object - look for common variable names
    import cadquery as cq
    _autofab_result = None

    # Priority order for finding the result shape
    _autofab_candidate_names = ["result", "model", "part", "shape", "assembly",
                                 "drone", "chassis", "bracket", "plate", "body"]

    for name in _autofab_candidate_names:
        obj = _autofab_user_globals.get(name)
        if obj is not None and isinstance(obj, (cq.Workplane, cq.Shape, cq.Assembly)):
            _autofab_result = obj
            break

    # Fallback: find the last Workplane assigned
    if _autofab_result is None:
        for name, obj in reversed(list(_autofab_user_globals.items())):
            if name.startswith("_"):
                continue
            if isinstance(obj, (cq.Workplane, cq.Shape, cq.Assembly)):
                _autofab_result = obj
                break

    if _autofab_result is None:
        _autofab_output = {"success": False, "error": "No CadQuery object found in script output. Assign your final shape to a variable named 'result'.", "error_type": "NoResultError"}
    else:
        # Extract geometry info
        if isinstance(_autofab_result, cq.Workplane):
            solid = _autofab_result.val()
        elif isinstance(_autofab_result, cq.Assembly):
            solid = _autofab_result.toCompound()
        else:
            solid = _autofab_result

        # For Compounds (multi-body assemblies via makeCompound), CadQuery's
        # BoundingBox() and Volume() only reflect the first accessible child.
        # Aggregate manually across all solids so metrics cover the full assembly.
        children = solid.Solids() if isinstance(solid, cq.Compound) else []
        if len(children) > 1:
            child_bbs = [s.BoundingBox() for s in children]
            class _BB:
                xmin = min(b.xmin for b in child_bbs)
                xmax = max(b.xmax for b in child_bbs)
                ymin = min(b.ymin for b in child_bbs)
                ymax = max(b.ymax for b in child_bbs)
                zmin = min(b.zmin for b in child_bbs)
                zmax = max(b.zmax for b in child_bbs)
                xlen = xmax - xmin
                ylen = ymax - ymin
                zlen = zmax - zmin
            bb = _BB()
            total_volume = sum(s.Volume() for s in children)
            total_faces = sum(len(s.Faces()) for s in children)
            total_edges = sum(len(s.Edges()) for s in children)
            total_verts = sum(len(s.Vertices()) for s in children)
            cx = sum((s.Center().x * s.Volume()) for s in children) / max(total_volume, 1e-9)
            cy = sum((s.Center().y * s.Volume()) for s in children) / max(total_volume, 1e-9)
            cz = sum((s.Center().z * s.Volume()) for s in children) / max(total_volume, 1e-9)
        else:
            bb = solid.BoundingBox()
            total_volume = solid.Volume()
            total_faces = len(solid.Faces())
            total_edges = len(solid.Edges())
            total_verts = len(solid.Vertices())
            com = solid.Center()
            cx, cy, cz = com.x, com.y, com.z

        _autofab_geometry = {
            "volume": total_volume,
            "center_of_mass": (cx, cy, cz),
            "bounding_box": {
                "xmin": bb.xmin, "xmax": bb.xmax, "xlen": bb.xlen,
                "ymin": bb.ymin, "ymax": bb.ymax, "ylen": bb.ylen,
                "zmin": bb.zmin, "zmax": bb.zmax, "zlen": bb.zlen,
            },
            "is_valid": solid.isValid(),
            "num_faces": total_faces,
            "num_edges": total_edges,
            "num_vertices": total_verts,
        }

        # Export STEP and STL
        cq.exporters.export(_autofab_result, "/Users/ysingh/PycharmProjects/Capstone-v0.1/artifacts/design-generated_part-ac03736e/geometry_work/generated_part_outer1_attempt0.step")
        cq.exporters.export(_autofab_result, "/Users/ysingh/PycharmProjects/Capstone-v0.1/artifacts/design-generated_part-ac03736e/geometry_work/generated_part_outer1_attempt0.stl")

        _autofab_output = {
            "success": True,
            "geometry": _autofab_geometry,
        }

except Exception as e:
    import traceback
    _autofab_output = {
        "success": False,
        "error": traceback.format_exc(),
        "error_type": type(e).__name__,
    }

# Write result to stdout as JSON
print("__AUTOFAB_RESULT__")
print(json.dumps(_autofab_output))
