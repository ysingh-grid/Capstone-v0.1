# Capstone-v0.1 Knowledge Base

> Last updated: 2026-05-25 | Covers the full session from project understanding through Langfuse integration

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack & Dependencies](#3-tech-stack--dependencies)
4. [Agent Pipeline](#4-agent-pipeline)
5. [Model Routing](#5-model-routing)
6. [ForgeCAD Integration](#6-forgecad-integration)
7. [Observability — Langfuse](#7-observability--langfuse)
8. [Bug Fixes Applied](#8-bug-fixes-applied)
9. [Environment Configuration](#9-environment-configuration)
10. [Infrastructure](#10-infrastructure)
11. [Known Issues & Workarounds](#11-known-issues--workarounds)
12. [Git & Repo Structure](#12-git--repo-structure)

---

## 1. Project Overview

**Capstone-v0.1** is a multi-agent CAD generation system. It takes a natural language description of a mechanical part and automatically produces:

- Verified CadQuery (OCCT-backed) geometry
- A ForgeCAD `.forge.js` editable model for real-time studio preview
- A full trace artifact (JSON) recording every agent decision

The system is based on the **CADSmith** paper which describes a Planner → Coder → Executor → Validator → Refiner loop with two tiers of LLMs.

**Repo:** `https://github.com/ysingh-grid/Capstone-v0.1.git`
**Structure:** Monorepo with CADSmith as a Git submodule

---

## 2. Architecture

```
User Prompt
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  Harness (Temporal Workflow)                        │
│                                                     │
│  planning_activity    ─►  Planner Agent             │
│       │                   gemini-3.5-flash          │
│       ▼                                             │
│  geometry_activity    ─►  Coder Agent               │
│       │                   gemini-3.5-flash          │
│       │               ─►  Executor (CadQuery subprocess)
│       │               ─►  Error Refiner (inner loop)│
│       │                   gemini-3.5-flash          │
│       ▼                                             │
│  verifier_activity    ─►  Visual Judge              │
│       │                   gemini-3.1-pro-preview    │
│       │                   (vision-capable, stronger)│
│       ▼                                             │
│  refiner_activity     ─►  Geometry Refiner          │
│  (outer loop ≤5x)         gemini-3.5-flash          │
│       │                                             │
│       ▼                                             │
│  handoff_activity     ─►  ForgeCAD Emitter          │
│                       ─►  TraceArtifact writer      │
│                       ─►  Langfuse flush            │
└─────────────────────────────────────────────────────┘
    │
    ▼
ForgeCAD Studio (localhost / self-hosted)
    └── .forge.js  ← engineer edits live parameters here
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| Temporal for orchestration | Durable execution, automatic retries, workflow history, UI at localhost:8233 |
| Two-tier LLM split | Mirrors original paper's Sonnet/Opus split — fast model generates, strong model judges |
| CadQuery as geometry authority | OCCT kernel gives exact volume/face/dimension measurements for the Judge |
| ForgeCAD for handoff | Engineer-editable parametric JS — live sliders in browser, no CAD software needed |
| Langfuse for observability | Full prompt/response capture, per-agent latency, token cost breakdown, trace tree |

---

## 3. Tech Stack & Dependencies

### Core

| Component | Technology |
|---|---|
| Workflow engine | Temporal (localhost:7233, UI at localhost:8233) |
| CAD kernel | CadQuery >= 2.4 (wraps OCCT) |
| Geometry export | STEP + STL via CadQuery exporters |
| Rendering | VTK three-view render → PNG (for Judge vision input) |
| ForgeCAD studio | KoStard/ForgeCAD — self-hosted, JS-based parametric CAD viewer |

### LLM SDKs

| Provider | SDK | Notes |
|---|---|---|
| Google Gemini | google-genai | Primary provider (LLM_PROVIDER=gemini) |
| Anthropic | anthropic >= 0.40.0 | Fallback / local LMStudio support |

### Observability

| Component | Technology |
|---|---|
| LLM tracing | Langfuse v4 SDK (langfuse >= 4.0.0) |
| Server | Self-hosted Langfuse v3 (langfuse/langfuse:3 Docker, localhost:3000) |

### Python packages (CADSmith/requirements.txt)

```
cadquery>=2.4
numpy, numpy-stl, trimesh
anthropic>=0.40.0
google-genai
langfuse>=4.0.0      # added this session
python-dotenv
pandas, matplotlib
```

---

## 4. Agent Pipeline

All agents live in CADSmith/autofab/agents.py.

### _call_llm() — Central Dispatcher

Single function called by every agent. Switches between Gemini and Anthropic based on LLM_PROVIDER env var.

**Gemini branch (active):**
- Builds `types.Content(role="user", parts=[...])` — text parts first, image parts second (Gemini convention)
- Uses `types.Part.from_text()` and `types.Part.from_bytes()` for proper typed Parts
- Guards `candidates_token_count` for None (thinking models return None)
- Guards `response.text` for empty/blocked responses — raises descriptive RuntimeError
- Calls `record_generation()` → Langfuse after every successful response

### Agent Roster

| Agent | Function | Model | Span Name | Input | Output |
|---|---|---|---|---|---|
| Planner | `plan()` | gemini-3.5-flash | Planner | Prompt text | JSON design plan |
| Coder | `generate_code()` | gemini-3.5-flash | Coder | Design plan + KB1 docs | CadQuery Python |
| ForgeCAD Coder | `generate_forgecad_code()` | gemini-3.5-flash | ForgeCAD-Coder | Design plan | .forge.js |
| Error Refiner | `fix_error()` | gemini-3.5-flash | ErrorRefiner | Failed code + traceback + KB2 patterns | Fixed CadQuery |
| Visual Judge | `evaluate_geometry()` | gemini-3.1-pro-preview | VisualJudge | Code + metrics + rendered PNG | {passed, feedback} JSON |
| Geometry Refiner | `refine_geometry()` | gemini-3.5-flash | GeometryRefiner | Code + Judge feedback | Improved CadQuery |

### RAG Knowledge Bases

- **KB1** (rag_kb1.py): CadQuery API documentation — injected into Coder + Refiner prompts
- **KB2** (rag_kb2.py): Error-solution patterns — injected into Error Refiner prompt

### Inner Loop (Error Repair)

- Runs inside geometry_activity
- Max iterations: MAX_ERROR_RETRIES (default: 3)
- Triggered when CadQuery subprocess fails to execute

### Outer Loop (Geometry Refinement)

- Runs in design_workflow.py across verifier_activity → refiner_activity
- Max iterations: MAX_REFINEMENT_ITERATIONS (default: 5)
- Triggered when Judge returns `passed: false`

---

## 5. Model Routing

### The Two-Tier Split (mirrors original paper's Sonnet/Opus)

```
Generation agents   →  gemini-3.5-flash          (fast, cost-efficient)
Visual Judge        →  gemini-3.1-pro-preview     (stronger, vision-capable)
```

### Environment Variables

```env
GEMINI_GENERATION_MODEL=gemini-3.5-flash
GEMINI_JUDGE_MODEL=gemini-3.1-pro-preview
```

### API Model String Names (confirmed May 2026)

| User-referred name | Actual API string | Status |
|---|---|---|
| "Gemini 3.5 Flash" | gemini-3.5-flash | GA since May 19, 2026 |
| "Gemini 3.1 Pro" | gemini-3.1-pro-preview | Preview |

### Helper Functions in agents.py

```python
def _generation_model() -> str:
    return os.getenv("GEMINI_GENERATION_MODEL", "gemini-3.5-flash")

def _judge_model() -> str:
    return os.getenv("GEMINI_JUDGE_MODEL", "gemini-3.1-pro-preview")
```

---

## 6. ForgeCAD Integration

### What is ForgeCAD?

KoStard/ForgeCAD — a self-hosted browser-based parametric CAD studio.
Takes .forge.js files as input; engineers get live parameter sliders without installing CAD software.

> ForgeCAD is NOT the geometry authority. CadQuery/OCCT is. ForgeCAD is the presentation and editing surface after handoff.

### ForgeCAD .forge.js API

```javascript
// Parameters — become live sliders in studio
const width  = Param.number("Width",  60, { min: 10, max: 500, unit: "mm" });
const height = Param.number("Height", 10, { min: 1,  max: 200, unit: "mm" });

// Primitives
box(width, depth, height)     // centered on XY, extends in +Z
cylinder(height, radius)      // axis along Z

// Booleans (chainable)
shapeA.subtract(shapeB)
shapeA.union(shapeB)
shapeA.intersect(shapeB)

// Transforms
shape.translate(x, y, z)
shape.rotate(axis_vec, angle_deg)

// Required return format
return { "part-name": finalShape };
```

**Rules the ForgeCAD-Coder agent follows:**
1. All numeric values as `Param.number()` for live sliders
2. No `import` or `require` — runtime provides all primitives globally
3. End with `return { "part-name": shape }`
4. One-line comments on each construction step

### Artifact Structure After Handoff

```
artifacts/<workflow_id>/
├── plan/      plan_<hash>.json
├── step/      <name>.step
├── stl/       <name>.stl
├── render/    iter_<n>_<name>.png
├── forgecad/  <name>.forge.js   ← open in ForgeCAD studio
└── trace/     trace_<hash>.json
```

---

## 7. Observability — Langfuse

### Infrastructure

| Container | Image | Port | Role |
|---|---|---|---|
| langfuse-langfuse-web-1 | langfuse/langfuse:3 | localhost:3000 | **Active dashboard** |
| langfuse-langfuse-worker-1 | langfuse/langfuse-worker:3 | localhost:3030 | Background worker |
| langfuse-clickhouse-1 | ClickHouse | localhost:8123 | Trace storage |
| langfuse-redis-1 | Redis 7 | — | Queue |
| langfuse-minio-1 | MinIO | localhost:9090 | Object store |
| langfuse-postgres-1 | Postgres 17 | localhost:5454 | Config DB |
| rag_advanced-langfuse-server-1 | langfuse/langfuse:2 | localhost:3001 | Old v2 instance (different project) |

> WARNING: Two separate Langfuse instances run simultaneously. Port 3000 = v3 (use this project). Port 3001 = v2 (old RAG project). Keys are NOT shared between instances.

### SDK Version Requirement

| Langfuse server | Required SDK |
|---|---|
| v3.x (port 3000) | langfuse >= 4.0.0 |
| v2.x (port 3001) | langfuse < 3 |

Currently installed: langfuse 4.6.1 — correct for the v3 server.

### What Gets Traced Per Workflow Run

```
Trace  (id = workflow_id, input = "user prompt")
├── Span: Planner
│   └── Generation: llm/gemini-3.5-flash
│         tokens: input/output | latency: ms
├── Span: Coder
│   └── Generation: llm/gemini-3.5-flash
├── Span: ErrorRefiner        ← only if inner loop fires
│   └── Generation: llm/gemini-3.5-flash
├── Span: VisualJudge
│   └── Generation: llm/gemini-3.1-pro-preview
│         input: [text evidence] + [<base64 image>]
│         output: {passed, feedback}
└── Span: GeometryRefiner     ← one per outer loop iteration
    └── Generation: llm/gemini-3.5-flash
```

### Module: CADSmith/autofab/langfuse_tracing.py

| Function | Called From | Purpose |
|---|---|---|
| `init_workflow_trace()` | planning_activity | Opens root trace span keyed to workflow_id |
| `update_workflow_trace()` | handoff_activity | Records final convergence outcome |
| `flush_trace()` | handoff_activity | Sends all buffered events to Langfuse API |
| `agent_span` | Each agent function | Context manager — wraps agent as a Langfuse Span |
| `record_generation()` | _call_llm() | Records one LLM call as a Langfuse Generation |

All functions are zero-cost no-ops when LANGFUSE_PUBLIC_KEY or LANGFUSE_SECRET_KEY are absent.

### Getting Keys

1. Open http://localhost:3000
2. Go to Settings → API Keys
3. Create new key pair
4. Add to .env:

```env
LANGFUSE_PUBLIC_KEY=pk-lf-<from-localhost:3000>
LANGFUSE_SECRET_KEY=sk-lf-<from-localhost:3000>
LANGFUSE_HOST=http://localhost:3000
```

---

## 8. Bug Fixes Applied

### Claude → Gemini API Migration (5 bugs in _call_llm)

| # | Location | Bug | Fix |
|---|---|---|---|
| 1 | _call_llm L91 | Fallback read stale `GEMINI_MODEL` env var (removed) | Replace with `_generation_model()` |
| 2 | _call_llm L96-109 | Flat `list[str\|Part]` — Claude format. Gemini needs `types.Content` | Build `types.Content(role="user", parts=[...])` with typed Parts |
| 3 | _call_llm L122-123 | `candidates_token_count` is None for thinking models → crash | Guard with `or 0` |
| 4 | _call_llm L129 | `response.text` raises on blocked response | Explicit `if not response.candidates:` guard |
| 5 | evaluate_geometry | Image appended before text — wrong order for Gemini | Reorder: text first, image second |

### Stale Claude docstrings
evaluate_geometry still said "Uses Claude Opus" — updated to gemini-3.1-pro-preview.

---

## 9. Environment Configuration

```env
# LLM Provider
LLM_PROVIDER=gemini

# Gemini
GEMINI_API_KEY=<your-key>
GEMINI_GENERATION_MODEL=gemini-3.5-flash
GEMINI_JUDGE_MODEL=gemini-3.1-pro-preview

# Observability
LANGFUSE_PUBLIC_KEY=pk-lf-<from-localhost:3000-settings>
LANGFUSE_SECRET_KEY=sk-lf-<from-localhost:3000-settings>
LANGFUSE_HOST=http://localhost:3000

# Anthropic fallback / LMStudio
ANTHROPIC_API_KEY="lm-studio"
ANTHROPIC_BASE_URL="http://localhost:1234"

# Temporal
TEMPORAL_HOST=localhost:7233
TEMPORAL_NAMESPACE=default

# Artifacts
ARTIFACT_STORE_PATH=./artifacts

# Loop limits
MAX_ERROR_RETRIES=3
MAX_REFINEMENT_ITERATIONS=5

# Execution
EXECUTOR_TIMEOUT_SECONDS=60
MAX_TOKENS=8192
USE_VISION=true

# Local model (LMStudio/Qwen3 only)
THINKING_MODE=off
```

---

## 10. Infrastructure

### Start Everything

```bash
# 1. Temporal workflow engine
temporal server start-dev
# UI → http://localhost:8233

# 2. Temporal worker
cd harness && python -m workflows.worker

# 3. Harness REST API
cd harness/api && python app.py
# API → http://localhost:8000

# 4. Langfuse (already running via Docker)
# Dashboard → http://localhost:3000

# 5. ForgeCAD (after handoff)
forgecad studio ./artifacts/<workflow_id>/forgecad/
```

### Submit a Design Job

```bash
curl -X POST http://localhost:8000/design \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A 40x30x5mm mounting bracket with 4 corner holes"}'

# Check status / trace
curl http://localhost:8000/trace/<workflow_id>
```

---

## 11. Known Issues & Workarounds

### Langfuse auth_check Timeout

- **Symptom:** `auth_check FAILED: timed out`
- **Cause A:** Keys from cloud.langfuse.com used with localhost:3000 (different key spaces)
- **Cause B:** langfuse SDK v2 installed, server runs v3 — incompatible APIs
- **Fix:** `pip install 'langfuse>=4.0.0'` + get keys from http://localhost:3000/settings

### Two Langfuse Instances Running

- Port 3000 → `langfuse/langfuse:3` — this project's instance
- Port 3001 → `langfuse/langfuse:2` — `rag_advanced` project
- Keys are completely separate — do not mix them

### rag-system pip conflict

```
rag-system 0.1.0 requires langfuse<3, but you have langfuse 4.6.1
```

This conflict is benign — rag-system is a separate unrelated package in the environment.

### USE_VISION=true requires display / VTK

- On a headless server, VTK rendering will fail
- The code wraps render in try/except — failure is a logged warning, not fatal
- Judge falls back to text-only validation

### candidates_token_count is None

- Affects gemini-3.1-pro-preview (extended thinking mode)
- Fixed in _call_llm with `or 0` guard
- No action needed

---

## 12. Git & Repo Structure

### Layout

```
Capstone-v0.1/                      ← parent repo
├── .env                            ← all environment config
├── CADSmith/                       ← Git submodule
│   ├── autofab/
│   │   ├── agents.py               ← all 6 agents + _call_llm dispatcher
│   │   ├── langfuse_tracing.py     ← Langfuse v4 observability module
│   │   ├── rag_kb1.py              ← CadQuery API docs RAG
│   │   ├── rag_kb2.py              ← error-solution patterns RAG
│   │   ├── render.py               ← VTK STL → PNG renderer
│   │   └── executor.py             ← CadQuery subprocess sandbox
│   └── requirements.txt
├── harness/
│   ├── api/app.py                  ← FastAPI REST API
│   ├── artifacts/store.py          ← artifact store
│   ├── runtime/primitives.py       ← solid_generate, execute_with_retries, visual_verify
│   ├── schema/
│   │   ├── primitives.py           ← PrimitivePlan Pydantic model
│   │   └── trace.py                ← TraceArtifact Pydantic model
│   └── workflows/
│       ├── activities.py           ← 5 Temporal activities
│       ├── design_workflow.py      ← main Temporal workflow + outer loop
│       └── worker.py               ← Temporal worker process
├── knowledge_base.md               ← this file
└── README.md
```

### Key Commits This Session

| Commit | Description |
|---|---|
| `feat: integrate ForgeCAD .forge.js emitter` | Replaced stub with real ForgeCAD code generation |
| `feat: restore two-tier model split` | gemini-3.5-flash for generation, gemini-3.1-pro-preview for judge |
| `fix: full Claude→Gemini API compatibility audit` | 5 bugs fixed in _call_llm and evaluate_geometry |
| `feat: add Langfuse observability` | New langfuse_tracing.py, all 6 agents wrapped with spans |
| `feat: wire Langfuse lifecycle into Temporal activities` | init at planning, flush at handoff |
