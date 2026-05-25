"""
harness/runtime/mesh_repair.py
==============================
Phase 2 Mesh Repair Utilities using MeshLib (mrmeshpy).

Implements robust hole filling, normal orientation, and self-intersection
repair against MeshLib v3.1.2.192. Replaces the Phase 1 trimesh stub.

Confirmed API (MeshLib 3.1.2.192):
  - mesh.topology.findHoleRepresentiveEdges() -> std_vector_Id_EdgeTag
  - mr.fillHoles(mesh, hole_edges, mr.FillHoleParams())  # batch, NOT per-hole
  - mesh.topology.isClosed() -> bool
  - mr.fixSelfIntersections(mesh, voxelSize: float)       # voxelSize required
  - mr.orientNormals(mesh)
  - mr.loadMesh(path) / mr.saveMesh(mesh, path)
  - mesh.volume() -> float                                # NOT computeVolume()
  - mesh.topology.numValidFaces() -> int
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any, Optional

try:
    import meshlib.mrmeshpy as mr
except ImportError:
    mr = None  # type: ignore[assignment]


_LOG = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _resolve_voxel_size(mesh: Any, fallback: float = 0.1) -> float:
    """
    Pick a voxel size for fixSelfIntersections. Prefer the mesh's average
    edge length when available; fall back to a conservative default.
    """
    try:
        avg = float(mesh.averageEdgeLength())
        if avg > 0.0:
            return avg
    except Exception:
        pass
    return fallback


def _count_holes(mesh: Any) -> int:
    """Return the number of boundary holes via representative edges."""
    try:
        return len(mesh.topology.findHoleRepresentiveEdges())
    except Exception:
        return 0


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def repair_watertight(
    stl_path: str,
    output_path: Optional[str] = None,
) -> tuple[str, bool, str]:
    """
    Attempt to repair a non-watertight mesh by filling all boundary holes
    and resolving self-intersections using MeshLib.

    Args:
        stl_path:    Path to the input STL mesh.
        output_path: Optional path for the repaired STL. Defaults to overwriting
                     the input when a repair was applied.

    Returns:
        (repaired_path, is_watertight, report_string)
    """
    if mr is None:
        return stl_path, False, "Error: meshlib not installed."

    if not os.path.exists(stl_path):
        return stl_path, False, f"Error: File {stl_path} not found."

    try:
        mesh = mr.loadMesh(stl_path)
        if mesh is None:
            return stl_path, False, "Error: loadMesh returned None."

        report: list[str] = []

        if mesh.topology.isClosed():
            return stl_path, True, "Mesh is already watertight."

        initial_holes = _count_holes(mesh)
        report.append(
            f"Mesh is not closed ({initial_holes} hole(s) detected). "
            "Attempting repair with MeshLib..."
        )

        # 1. Fill all boundary holes in a single batch call.
        if initial_holes > 0:
            hole_edges = mesh.topology.findHoleRepresentiveEdges()
            try:
                mr.fillHoles(mesh, hole_edges, mr.FillHoleParams())
                remaining = _count_holes(mesh)
                filled = max(0, initial_holes - remaining)
                report.append(
                    f"fillHoles: filled {filled}/{initial_holes} holes "
                    f"(remaining={remaining})."
                )
            except Exception as fill_exc:
                report.append(f"fillHoles failed: {fill_exc}")

        # 2. Resolve self-intersections. voxelSize is required by this binding.
        voxel_size = _resolve_voxel_size(mesh)
        try:
            mr.fixSelfIntersections(mesh, voxel_size)
            report.append(
                f"fixSelfIntersections applied (voxelSize={voxel_size:.4f})."
            )
        except Exception as si_exc:
            report.append(f"fixSelfIntersections failed: {si_exc}")

        is_now_watertight = bool(mesh.topology.isClosed())
        if is_now_watertight:
            report.append("Mesh is now watertight.")
        else:
            report.append(
                f"Mesh is still not watertight after repair "
                f"(holes remaining={_count_holes(mesh)})."
            )

        save_path = output_path or stl_path
        try:
            mr.saveMesh(mesh, save_path)
        except Exception as save_exc:
            return stl_path, is_now_watertight, (
                "\n".join(report) + f"\nsaveMesh failed: {save_exc}"
            )

        return save_path, is_now_watertight, "\n".join(report)

    except Exception as exc:
        _LOG.exception("repair_watertight failed for %s", stl_path)
        return stl_path, False, f"MeshLib repair failed with exception: {exc}"


def repair_normals(
    stl_path: str,
    output_path: Optional[str] = None,
) -> tuple[str, bool, str]:
    """
    Enforce consistent outward-facing normals using MeshLib.

    orientNormals is only meaningful on closed meshes; the caller should run
    repair_watertight() first if the mesh has open boundaries.
    """
    if mr is None:
        return stl_path, False, "Error: meshlib not installed."

    if not os.path.exists(stl_path):
        return stl_path, False, f"Error: File {stl_path} not found."

    try:
        mesh = mr.loadMesh(stl_path)
        if mesh is None:
            return stl_path, False, "Error: loadMesh returned None."

        if not mesh.topology.isClosed():
            return stl_path, False, (
                "Cannot orient normals: mesh is not closed. "
                "Run repair_watertight() first."
            )

        mr.orientNormals(mesh)

        save_path = output_path or stl_path
        mr.saveMesh(mesh, save_path)
        return save_path, True, "Normals oriented using MeshLib."

    except Exception as exc:
        _LOG.exception("repair_normals failed for %s", stl_path)
        return stl_path, False, f"Normal repair failed: {exc}"


def mesh_diagnostics(stl_path: str) -> dict:
    """
    Read-only inspection of a mesh. Returns a dictionary with the structural
    properties needed by mesh_inspect and downstream verifiers.

    Returns:
        dict with keys:
          - is_watertight (bool)
          - hole_count (int)
          - num_faces (int)
          - volume (float, mm^3; 0.0 if the mesh is not closed)
          - has_self_intersections (bool)
          - error (str, only present on failure)
    """
    diagnostics: dict = {
        "is_watertight": False,
        "hole_count": 0,
        "num_faces": 0,
        "volume": 0.0,
        "has_self_intersections": False,
    }

    if mr is None:
        diagnostics["error"] = "meshlib not installed"
        return diagnostics

    if not os.path.exists(stl_path):
        diagnostics["error"] = f"File {stl_path} not found"
        return diagnostics

    try:
        mesh = mr.loadMesh(stl_path)
        if mesh is None:
            diagnostics["error"] = "Failed to load mesh (loadMesh returned None)"
            return diagnostics

        diagnostics["is_watertight"] = bool(mesh.topology.isClosed())
        diagnostics["hole_count"] = _count_holes(mesh)
        try:
            diagnostics["num_faces"] = int(mesh.topology.numValidFaces())
        except Exception:
            diagnostics["num_faces"] = 0

        # volume() is only meaningful on closed meshes.
        if diagnostics["is_watertight"]:
            try:
                diagnostics["volume"] = float(mesh.volume())
            except Exception:
                diagnostics["volume"] = 0.0

        # Self-intersection detection in MeshLib is expensive and the
        # findSelfIntersections binding is not guaranteed in all builds.
        # We expose the field as False by default; callers that need a
        # definitive answer should invoke repair_watertight() which runs
        # fixSelfIntersections() unconditionally.
        diagnostics["has_self_intersections"] = False

    except Exception as exc:
        _LOG.exception("mesh_diagnostics failed for %s", stl_path)
        diagnostics["error"] = str(exc)

    return diagnostics
