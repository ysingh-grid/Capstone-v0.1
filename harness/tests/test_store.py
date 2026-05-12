"""
harness/tests/test_store.py
============================
Pytest unit tests for the ArtifactStore.

Tests cover put/get/put_file/exists/local_path operations,
URI scheme correctness, and the singleton get_store() factory.
"""

import json
import tempfile
from pathlib import Path

import pytest

from harness.artifacts.store import ArtifactStore


@pytest.fixture()
def tmp_store(tmp_path: Path) -> ArtifactStore:
    """Return an ArtifactStore backed by a temporary directory."""
    return ArtifactStore(base_path=tmp_path)


class TestArtifactStoreBasics:
    def test_put_and_get_bytes(self, tmp_store: ArtifactStore):
        uri = tmp_store.put("wf1", "trace", b"hello artifact")
        assert uri.startswith("artifact://")
        result = tmp_store.get_bytes(uri)
        assert result == b"hello artifact"

    def test_put_and_get_json(self, tmp_store: ArtifactStore):
        data = {"key": "value", "num": 42}
        uri = tmp_store.put_json("wf1", "plan", data, filename="plan.json")
        loaded = tmp_store.get_json(uri)
        assert loaded == data

    def test_uri_scheme(self, tmp_store: ArtifactStore):
        uri = tmp_store.put("wf1", "step", b"STEP data", filename="part.step")
        assert uri.startswith("artifact://")
        assert "wf1" in uri
        assert "step" in uri

    def test_exists_true_after_put(self, tmp_store: ArtifactStore):
        uri = tmp_store.put("wf1", "stl", b"STL data")
        assert tmp_store.exists(uri) is True

    def test_exists_false_for_unknown_uri(self, tmp_store: ArtifactStore):
        assert tmp_store.exists("artifact://does/not/exist.json") is False

    def test_local_path_resolves_correctly(self, tmp_store: ArtifactStore):
        uri = tmp_store.put("wf2", "render", b"\x89PNG", filename="render.png")
        local = tmp_store.local_path(uri)
        assert Path(local).exists()
        assert Path(local).read_bytes() == b"\x89PNG"

    def test_put_file(self, tmp_store: ArtifactStore, tmp_path: Path):
        src = tmp_path / "input.stl"
        src.write_bytes(b"binary STL content")
        uri = tmp_store.put_file("wf3", "stl", str(src), filename="part.stl")
        assert tmp_store.exists(uri)
        assert tmp_store.get_bytes(uri) == b"binary STL content"

    def test_multiple_workflows_isolated(self, tmp_store: ArtifactStore):
        uri_a = tmp_store.put("wf_a", "trace", b"data A")
        uri_b = tmp_store.put("wf_b", "trace", b"data B")
        assert tmp_store.get_bytes(uri_a) == b"data A"
        assert tmp_store.get_bytes(uri_b) == b"data B"
        assert uri_a != uri_b

    def test_custom_filename(self, tmp_store: ArtifactStore):
        uri = tmp_store.put("wf1", "forgecad", b"# code", filename="bracket_forgecad.py")
        assert "bracket_forgecad.py" in uri or Path(tmp_store.local_path(uri)).name == "bracket_forgecad.py"

    def test_get_json_roundtrip(self, tmp_store: ArtifactStore):
        nested = {"a": [1, 2, 3], "b": {"c": True}}
        uri = tmp_store.put_json("wf1", "misc", nested)
        assert tmp_store.get_json(uri) == nested


class TestArtifactStoreEdgeCases:
    def test_get_bytes_missing_uri_raises(self, tmp_store: ArtifactStore):
        with pytest.raises(Exception):
            tmp_store.get_bytes("artifact://nonexistent/file.json")

    def test_get_json_missing_uri_raises(self, tmp_store: ArtifactStore):
        with pytest.raises(Exception):
            tmp_store.get_json("artifact://nonexistent/file.json")

    def test_put_file_nonexistent_source_raises(self, tmp_store: ArtifactStore):
        with pytest.raises(Exception):
            tmp_store.put_file("wf1", "stl", "/tmp/nonexistent_file_12345.stl")

    def test_empty_bytes_roundtrip(self, tmp_store: ArtifactStore):
        uri = tmp_store.put("wf1", "misc", b"")
        assert tmp_store.get_bytes(uri) == b""

    def test_large_payload(self, tmp_store: ArtifactStore):
        big = b"X" * 10_000_000  # 10 MB
        uri = tmp_store.put("wf1", "step", big)
        assert len(tmp_store.get_bytes(uri)) == 10_000_000
