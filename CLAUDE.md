# Capstone-v0.1 — Claude Code Guide

## Project overview

Geometry Agent Harness — an AI-powered parametric CAD generation pipeline.

**Stack:** Python 3.11+, FastAPI (port 8000), Temporal (port 7233), CadQuery/OCCT, MeshLib, ForgeCAD, Langfuse.

---

## How to start the full stack

```bash
# 1. Langfuse (observability) — Docker
cd /path/to/langfuse && docker compose up -d

# 2. Temporal server
temporal server start-dev

# 3. Temporal worker (in project root with venv activated)
source .venv/bin/activate
python -m harness.workflows.worker

# 4. FastAPI product API
uvicorn harness.api.app:app --port 8000 --reload
```

Then open http://localhost:8000 — the ForgeCAD Agent Harness UI.

---

## Key entry points

| File | Purpose |
|------|---------|
| `harness/api/app.py` | FastAPI app, REST + WebSocket endpoints |
| `harness/api/chatbot_agent.py` | Phase 2 — measurement chatbot agent (`/api/v1/assistant`) |
| `harness/api/static/index.html` | Single-page UI — ForgeCAD harness + sliding chat panel |
| `harness/workflows/design_workflow.py` | Temporal workflow state machine |
| `harness/workflows/activities.py` | 5 Temporal activities (plan, geometry, verify, refine, handoff) |
| `harness/runtime/primitives.py` | Execution primitives (mesh_inspect, mesh_repair, forgecad_emit, …) |
| `harness/runtime/mesh_repair.py` | MeshLib Phase 2 mesh repair utilities |
| `CADSmith/autofab/agents.py` | 6 LLM agents (Planner, Coder, Judge, Refiner, ForgeCAD, ErrorRefiner) |

---

## Phase 2 features (this release)

- **MeshLib integration** — `mesh_repair.py` fully wired; `geometry_activity` auto-repairs non-watertight meshes after every generation
- **Measurement chatbot** — sliding panel on the ForgeCAD UI; sessions persisted to `artifacts/.chat_sessions/`; endpoint prefix `/api/v1/assistant`
- **Evidence UI** — watertightness badge, hole count, normals, volume drift displayed in the Evidence tab

## Deprecated / removed

- `harness/api/chat.py` — replaced by `chatbot_agent.py`
- `test_plan.py`, `latest_wf.txt`, `meshlib_dir.txt` — dev artefacts removed

---

## Environment variables (`.env`)

```
GEMINI_API_KEY=...        # Gemini Flash — primary LLM
ANTHROPIC_API_KEY=...     # Claude Haiku — fallback LLM
TEMPORAL_HOST=localhost:7233
TEMPORAL_NAMESPACE=default
LANGFUSE_PUBLIC_KEY=...
LANGFUSE_SECRET_KEY=...
LANGFUSE_HOST=http://localhost:3000
```

---

## Running tests

```bash
source .venv/bin/activate
pytest harness/tests/ -v
```

---

## MeshLib API notes (v3.1.2.192)

```python
import meshlib.mrmeshpy as mr
mesh = mr.loadMesh(path)
mesh.topology.isClosed()                           # bool — watertight?
mesh.topology.findHoleRepresentiveEdges()          # list of boundary edges
mr.fillHoles(mesh, hole_edges, mr.FillHoleParams()) # batch fill (NOT per-hole)
mr.fixSelfIntersections(mesh, voxel_size)          # voxelSize required!
mesh.volume()                                      # float (NOT computeVolume)
mr.saveMesh(mesh, path)
```
