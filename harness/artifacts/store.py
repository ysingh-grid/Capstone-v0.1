"""
harness/artifacts/store.py
==========================
Local filesystem artifact store for the Geometry Agent Harness.

PRD §3.4: A persistent Artifact Store holding canonical solids, OCCT
measurements, mesh evidence, rendered views, primitive traces, and
verifier labels.  Temporal workflow history must reference artifacts
by URI only — no embedding of large geometry data in history.

PRD §9.2: Temporal records artifact references; the store owns the data.
PRD §9.5: Primitive traces attached to workflow history by reference only.

Phase 1 implementation: local filesystem keyed by workflow_id / artifact_type.
Phase 3: swap to object storage (S3 / GCS) by changing only this module.
"""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import uuid
from pathlib import Path
from typing import Optional


# ---------------------------------------------------------------------------
# URI helpers
# ---------------------------------------------------------------------------

_SCHEME = "artifact://"


def make_uri(workflow_id: str, artifact_type: str, filename: str) -> str:
    """Construct a canonical artifact URI."""
    return f"{_SCHEME}{workflow_id}/{artifact_type}/{filename}"


def parse_uri(uri: str) -> tuple[str, str, str]:
    """Parse a URI into (workflow_id, artifact_type, filename)."""
    if not uri.startswith(_SCHEME):
        raise ValueError(f"Invalid artifact URI: {uri!r}")
    rest = uri[len(_SCHEME):]
    parts = rest.split("/", 2)
    if len(parts) != 3:
        raise ValueError(f"Malformed artifact URI: {uri!r}")
    return parts[0], parts[1], parts[2]


# ---------------------------------------------------------------------------
# ArtifactStore
# ---------------------------------------------------------------------------


class ArtifactStore:
    """
    Filesystem-backed artifact store.

    Layout::

        <base_path>/
          <workflow_id>/
            step/          → STEP files
            stl/           → STL files
            render/        → PNG renders
            trace/         → JSON trace artifacts
            forgecad/      → Annotated CadQuery (ForgeCAD stub) sources
            plan/          → Primitive plan JSON
            misc/          → Any other artifact

    All heavy geometry evidence is stored here.  Temporal history only
    ever holds the ``artifact://`` URI string (PRD §9.5).
    """

    ARTIFACT_TYPES = {
        "step", "stl", "render", "trace", "forgecad", "plan", "misc",
    }

    def __init__(self, base_path: str | Path):
        self.base_path = Path(base_path).resolve()
        self.base_path.mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------
    # Write operations
    # ------------------------------------------------------------------

    def put(
        self,
        workflow_id: str,
        artifact_type: str,
        data: bytes | str,
        filename: Optional[str] = None,
    ) -> str:
        """
        Store raw bytes or a string under the given type bucket.

        Returns the canonical ``artifact://`` URI for use in Temporal history.
        """
        self._validate_type(artifact_type)
        bucket = self._bucket(workflow_id, artifact_type)

        if filename is None:
            ext = _default_extension(artifact_type)
            filename = f"{uuid.uuid4().hex}{ext}"

        dest = bucket / filename
        if isinstance(data, str):
            dest.write_text(data, encoding="utf-8")
        else:
            dest.write_bytes(data)

        return make_uri(workflow_id, artifact_type, filename)

    def put_json(
        self,
        workflow_id: str,
        artifact_type: str,
        obj: dict | list,
        filename: Optional[str] = None,
    ) -> str:
        """Serialize ``obj`` to JSON and store it."""
        return self.put(
            workflow_id,
            artifact_type,
            json.dumps(obj, indent=2),
            filename=filename or f"{uuid.uuid4().hex}.json",
        )

    def put_file(
        self,
        workflow_id: str,
        artifact_type: str,
        src_path: str | Path,
        filename: Optional[str] = None,
    ) -> str:
        """
        Copy an existing file (STEP, STL, PNG …) into the store.

        Returns the canonical URI.
        """
        self._validate_type(artifact_type)
        src = Path(src_path)
        if not src.exists():
            raise FileNotFoundError(f"Source file not found: {src}")

        bucket = self._bucket(workflow_id, artifact_type)
        dest_name = filename or src.name
        dest = bucket / dest_name
        shutil.copy2(src, dest)
        return make_uri(workflow_id, artifact_type, dest_name)

    # ------------------------------------------------------------------
    # Read operations
    # ------------------------------------------------------------------

    def get_bytes(self, uri: str) -> bytes:
        """Retrieve raw bytes for a stored artifact."""
        return self._resolve(uri).read_bytes()

    def get_text(self, uri: str) -> str:
        """Retrieve text content for a stored artifact."""
        return self._resolve(uri).read_text(encoding="utf-8")

    def get_json(self, uri: str) -> dict | list:
        """Retrieve and parse a JSON artifact."""
        return json.loads(self.get_text(uri))

    def exists(self, uri: str) -> bool:
        try:
            return self._resolve(uri).exists()
        except (ValueError, OSError):
            return False

    def local_path(self, uri: str) -> Path:
        """Return the absolute local filesystem path for a URI (e.g. for VTK rendering)."""
        return self._resolve(uri)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _bucket(self, workflow_id: str, artifact_type: str) -> Path:
        bucket = self.base_path / _safe(workflow_id) / artifact_type
        bucket.mkdir(parents=True, exist_ok=True)
        return bucket

    def _resolve(self, uri: str) -> Path:
        wf_id, artifact_type, filename = parse_uri(uri)
        return self.base_path / _safe(wf_id) / artifact_type / filename

    @staticmethod
    def _validate_type(artifact_type: str) -> None:
        if artifact_type not in ArtifactStore.ARTIFACT_TYPES:
            raise ValueError(
                f"Unknown artifact type {artifact_type!r}. "
                f"Valid types: {sorted(ArtifactStore.ARTIFACT_TYPES)}"
            )


# ---------------------------------------------------------------------------
# Module-level singleton factory
# ---------------------------------------------------------------------------

_default_store: Optional[ArtifactStore] = None


def get_store() -> ArtifactStore:
    """
    Return the process-wide default ArtifactStore, initialised from the
    ``ARTIFACT_STORE_PATH`` environment variable (defaults to ``./artifacts``).
    """
    global _default_store
    if _default_store is None:
        base = os.getenv("ARTIFACT_STORE_PATH", "./artifacts")
        _default_store = ArtifactStore(base)
    return _default_store


# ---------------------------------------------------------------------------
# Private utilities
# ---------------------------------------------------------------------------

def _safe(name: str) -> str:
    """Sanitise a workflow ID for use as a directory component."""
    return "".join(c if c.isalnum() or c in "-_." else "_" for c in name)


def _default_extension(artifact_type: str) -> str:
    return {
        "step": ".step",
        "stl": ".stl",
        "render": ".png",
        "trace": ".json",
        "forgecad": ".py",
        "plan": ".json",
        "misc": ".bin",
    }.get(artifact_type, ".bin")
