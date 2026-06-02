# CADSmith + Capstone Architecture Guide

## System Overview

**Goal:** Text-to-CAD generation. User describes part → system generates CadQuery code → validates geometry → outputs 3D model.

**Stack:**
- Python 3.11+
- FastAPI (port 8000)
- Temporal (port 7233) — durable workflow orchestration
- CadQuery + OCCT kernel — CAD geometry
- MeshLib — mesh repair + watertightness validation
- Claude/Gemini LLM — code generation + validation

---

## The 6 LLM Agents

### 1. PLANNER
**Role:** Intent → Specification  
**Input:** Natural language user prompt  
**Output:** JSON spec (dimensions, components, constraints, acceptance criteria)

**Process:**
```
parse prompt → extract features → validate against schema → return plan dict
```

**Libraries:** LLM (Claude Sonnet)  
**KB Used:** None  
**Why separate?** Abstract layer; doesn't need API knowledge

---

### 2. CODER
**Role:** Specification → Executable Code  
**Input:** JSON spec + original prompt  
**Output:** CadQuery Python script (runnable, produces STL/STEP)

**Process:**
```
retrieve_api_context(spec, prompt)  # KB1 retrieval
↓
build_prompt(spec + prompt + KB1_context)
↓
call_llm(CODER_SYSTEM + prompt)
↓
extract_python_code(response)
```

**Libraries:** LLM (Claude Sonnet), KB1 (API docs)  
**KB1 Contents:** 155 CadQuery methods, 28 examples, selector reference  
**Why separate?** Needs specialized KB; high-token context

---

### 3. ERROR REFINER (Inner Loop)
**Role:** Execution Error Diagnosis + Fix  
**Trigger:** Code execution fails (exception/traceback)  
**Input:** Broken code + error traceback + design_plan  
**Output:** Fixed code

**Process:**
```
retrieve_error_context(traceback)  # KB2 matching
retrieve_api_context(plan, "")     # KB1 for context
↓
build_prompt(code + error + KB2_patterns + KB1_docs + plan)
↓
call_llm(ERROR_REFINER_SYSTEM + prompt)
↓
extract_python_code(response) → re-execute
```

**Libraries:** LLM (Claude Sonnet), KB1 + KB2  
**KB2 Contents:** 25 error-solution patterns (fillet radius, boolean crashes, wire closure, etc.)  
**Max Retries:** 3  
**Why separate?** Different problem space (error diagnosis); needs error patterns (KB2)

---

### 4. REFINER (Outer Loop)
**Role:** Geometric Feedback → Code Improvement  
**Trigger:** Code executes OK but geometry is wrong (validator feedback)  
**Input:** Code + geometric feedback + design_plan + original prompt + iteration count + history  
**Output:** Improved code

**Process:**
```
retrieve_api_context(plan, prompt)  # KB1 only
build_history_context(prior_attempts)
build_escalation_guidance(if iteration >= 3)
↓
build_prompt(code + feedback + history + escalation + KB1 + plan)
↓
call_llm(REFINER_SYSTEM + prompt)
↓
extract_python_code(response) → re-validate
```

**Libraries:** LLM (Claude Sonnet), KB1 only  
**Max Iterations:** 5  
**Special Feature:** Escalation guidance if stuck (iteration ≥ 3)  
**Why separate from ErrorRefiner?** Different feedback signal (geometry vs execution); different history tracking

---

### 5. VALIDATOR / JUDGE
**Role:** Visual + Metric Evaluation  
**Input:**
- Original user prompt
- Generated code
- OCCT measurements (volume, bbox, face/edge counts)
- Rendered 3-view image (isometric + rear overhead + front profile)
- Prior feedback history (if any)

**Output:** `{passed: bool, feedback: str}`

**Process:**
```
measure_occt_kernel(geometry_json)
↓
render_three_views(stl_path)  # VTK render
↓
build_prompt(prompt + code + metrics + render + history)
↓
call_llm(VALIDATOR_SYSTEM + prompt)
↓
parse_json({passed, feedback})
```

**Libraries:** LLM (Claude **Opus** — different model!), OCCT kernel, MeshLib, VTK  
**Why different model?** Independent judgment; prevents feedback loops; Opus more capable at visual reasoning  
**Decision Gate:** Pass → handoff; Fail + retries left → refiner loop; Fail + no retries → escalation

---

### 6. FORGE CAD
**Role:** CAD System Handoff  
**Input:** STL + STEP files, geometry evidence, rendered images  
**Output:** 3D viewer link, export bundle

**Process:**
```
emit_forgecad_code(step_path, design_plan)
↓
upload_to_3d_viewer()
↓
return_artifact_uris()
```

**Libraries:** ForgeCAD API, artifact store  
**Why separate?** Final output layer; independent of generation quality

---

## The Executor (Non-Agent)

**Role:** Sandboxed Code Execution  
**Input:** CadQuery Python code  
**Output:** STL path, STEP path, geometry_json (OCCT measurements)

**Process:**
```
write_code_to_temp_file()
↓
spawn_subprocess(python code)
↓
capture_stdout / geometry object
↓
export_stl() via trimesh
export_step() via CadQuery
extract_occt_measurements(volume, bbox, faces, edges)
↓
return ExecutionResult{success, stl_path, step_path, geometry_json, error}
```

**Libraries:** CadQuery, OCCT kernel (embedded), subprocess  
**Timeout:** 60s (configurable)  
**Location:** `CADSmith/autofab/executor.py`

---

## The Two Loops

### Inner Loop: Error Handling
**Trigger:** Executor returns `success=False`  
**Agent:** ErrorRefiner  
**Max Retries:** 3

**Flow:**
```
Executor fails with traceback
↓
ErrorRefiner diagnoses + fixes
↓
Executor re-runs
↓
If success: exit loop, continue to mesh inspect
If fail: retry (≤ 3 total attempts)
If all fail: escalate
```

**Tracking:** `RepairAction(loop='inner', attempt_number, error_type, fix_applied)`

---

### Outer Loop: Geometric Refinement
**Trigger:** Validator returns `passed=False`  
**Agent:** Refiner  
**Max Iterations:** 5

**Flow:**
```
Validator evaluates geometry
↓
If passed: → Forge CAD handoff
If failed: Refiner improves code
↓
Coder generates from improved spec
↓
Executor runs, Validator re-evaluates
↓
If passed: → handoff
If failed: retry (≤ 5 iterations)
If all fail: escalate
```

**Tracking:** `RefinementHistory(iteration, feedback, approach, prior_feedback)`  
**Escalation:** If iteration ≥ 3, suggest different construction approach

---

## Library Layer Mapping

### CadQuery (Code Execution)
- Used by: Executor
- What: Python API for OCCT CAD kernel
- Output: Solid object → STL/STEP export + OCCT measurements

### OCCT Kernel (Geometry Measurement)
- Used by: Executor → mesh_inspect()
- What: Industry CAD kernel (embedded in CadQuery)
- Measurements: volume_mm3, bbox_xlen/ylen/zlen, num_faces, num_edges, etc.

### MeshLib (Mesh Validation + Repair)
- Used by: mesh_inspect() → mesh_repair()
- What: 3D mesh library (v3.1.2.192)
- Functions:
  ```python
  mr.loadMesh(path)                           # Load STL
  mesh.topology.isClosed()                    # Watertight check
  mesh.topology.findHoleRepresentiveEdges()   # Boundary edge list
  mr.fillHoles(mesh, edges, params)           # Batch hole fill
  mr.fixSelfIntersections(mesh, voxel_size)   # Self-intersection repair
  mesh.volume()                               # Volume compute
  ```

### VTK (3-View Rendering)
- Used by: render_views() → Validator
- What: Visualization toolkit
- Output: 3-view PNG (isometric + rear overhead + front profile)
- Why: Validator needs visual confirmation beyond metrics

### KB1 (CadQuery API Reference)
- Used by: Coder, ErrorRefiner, Refiner
- Contents: 155 Workplane methods + 28 examples + selector reference
- Retrieval: Keyword matching on (design_plan + prompt)
- Return: Top 8 docs + top 2 examples (~1-2 KB text)

### KB2 (Error-Solution Patterns)
- Used by: ErrorRefiner only
- Contents: 25 patterns (fillet radius violations, boolean crashes, wire closure failures, etc.)
- Retrieval: Error message pattern matching
- Return: Matching patterns formatted as examples

---

## Data Flow (End-to-End)

```
User: "Design a 20mm cube with a 5mm hole"
        ↓
[PLANNER] → JSON: {
  "features": [{"type": "box", "dimensions": {"x": 20, "y": 20, "z": 20}}],
  "constraints": [{"hole": {"diameter": 5, "location": "center"}}],
  "acceptance_criteria": {"volume_target": 7875}  # 20³ - hole volume
}
        ↓
[CODER] + KB1 → Python:
  result = cq.Workplane("XY").box(20, 20, 20).hole(5)
        ↓
[EXECUTOR] → CadQuery runs:
  STL file: /tmp/cube_attempt0.stl
  STEP file: /tmp/cube_attempt0.step
  geometry_json: {
    "volume_mm3": 7875.0,
    "bbox_xlen": 20.0,
    "bbox_ylen": 20.0,
    "bbox_zlen": 20.0,
    "num_faces": 15,  # 6 outer + 9 hole walls
    "num_edges": 36
  }
        ↓
[MESH INSPECT] + MeshLib → GeometryEvidence:
  is_watertight: true
  mesh_defect_count: 0
  volume_drift_pct: 0.01
        ↓
[RENDER] + VTK → 3-view PNG
        ↓
[VALIDATOR] + Claude Opus → {
  "passed": true,
  "feedback": "All constraints met."
}
        ↓
[FORGE CAD] → 3D viewer link
        ↓
User: "✅ Done. Geometry matches spec."
```

---

## Workflow State Machine (Temporal)

```
START
  ↓
PLANNING
  ├─→ (schema invalid) → FAILED
  └─→ (valid) → GENERATING
        ↓
      GENERATING
        ├─→ (execution fail, retries exhausted) → ESCALATED
        └─→ (success) → VERIFYING
              ↓
            VERIFYING
              ├─→ (passed) → AWAITING_APPROVAL
              ├─→ (failed, retries left) → REFINING
              │     ↓
              │   [REFINER updates code]
              │     ↓
              │   (back to GENERATING)
              └─→ (failed, no retries) → ESCALATED
                
            AWAITING_APPROVAL
              ├─→ (approve signal) → HANDOFF
              ├─→ (reject signal) → FAILED
              └─→ (iterate signal) → PLANNING
                
              HANDOFF
                ├─→ (success) → DONE
                └─→ (failure) → FAILED
                
END
```

---

## Files Map

| File | Purpose |
|------|---------|
| `CADSmith/autofab/agents.py` | 6 agent implementations + LLM calls |
| `CADSmith/autofab/executor.py` | Sandbox executor, OCCT measurement |
| `CADSmith/autofab/rag_kb1.py` | KB1 retrieval (API docs) |
| `CADSmith/autofab/rag_kb2.py` | KB2 retrieval (error patterns) |
| `CADSmith/autofab/validator.py` | Validator agent wrapper |
| `harness/workflows/design_workflow.py` | Temporal workflow (state machine) |
| `harness/workflows/activities.py` | Temporal activities (W.01–W.05) |
| `harness/runtime/primitives.py` | Runtime primitives (plan, generate, execute, inspect, repair, render, verify) |
| `harness/runtime/mesh_repair.py` | MeshLib Phase 2 repair logic |
| `harness/api/app.py` | FastAPI endpoints + WebSocket |
| `harness/api/static/index.html` | UI (ForgeCAD harness + chat) |

---

## Configuration

Environment variables (`.env`):

```
GEMINI_API_KEY=...              # Gemini Flash — primary LLM
ANTHROPIC_API_KEY=...           # Claude Haiku — fallback LLM
TEMPORAL_HOST=localhost:7233
TEMPORAL_NAMESPACE=default
LANGFUSE_PUBLIC_KEY=...         # Observability
LANGFUSE_SECRET_KEY=...
LANGFUSE_HOST=http://localhost:3000
GENERATION_MODEL=claude-sonnet-4-6   # Override
JUDGE_MODEL=claude-opus-4-6          # Override
EXECUTOR_TIMEOUT_SECONDS=60
MAX_TOKENS=4096
USE_VISION=true                 # Enable VTK render for Validator
```

---

## Running the Stack

```bash
# 1. Start Langfuse (observability)
cd /path/to/langfuse && docker compose up -d

# 2. Start Temporal server
temporal server start-dev

# 3. Start Temporal worker
source .venv/bin/activate
python -m harness.workflows.worker

# 4. Start FastAPI
uvicorn harness.api.app:app --port 8000 --reload

# Then open: http://localhost:8000
```

---

## Quality Gates

1. **Schema Validation** (Planner output) — must pass typed PrimitivePlan validation
2. **Code Execution** (Executor) — max 3 inner-loop retries
3. **Mesh Watertightness** (mesh_inspect) — auto-repair via MeshLib, max 1 repair attempt
4. **Geometric Validation** (Validator) — pass/fail based on metrics + visual check
5. **Refinement Exhaustion** (Refiner) — max 5 outer-loop iterations
6. **Escalation** — human review if inner or outer loop exhausted

All gates are hard stops; no silent failures.

---

## Key Metrics (Validation)

**OCCT Kernel:**
- `volume_mm3` — computed by CAD kernel
- `bbox_xlen / bbox_ylen / bbox_zlen` — bounding box dimensions
- `num_faces` — facet count
- `num_edges` — edge count

**MeshLib (Phase 2):**
- `is_watertight` — closed manifold?
- `mesh_defect_count` — number of boundary holes
- `volume_drift_pct` — |mesh_volume - occt_volume| / occt_volume × 100
- `normals_consistent` — true if watertight

**Validator Feedback:**
- Text describing exact discrepancies
- References both metrics AND visual evidence (3-view render)
- Prior feedback history to avoid repeating failed suggestions

---

## Summary

| Component | Role | Input | Output | Libs |
|-----------|------|-------|--------|------|
| Planner | Intent → Spec | Prompt | JSON plan | LLM |
| Coder | Spec → Code | Plan + prompt | CadQuery code | LLM + KB1 |
| ErrorRefiner | Error → Fix | Code + error | Fixed code | LLM + KB1 + KB2 |
| Executor | Code → Geometry | Python | STL, STEP, metrics | CadQuery, OCCT |
| Mesh Inspect | Mesh validate | STL | Watertightness evidence | MeshLib |
| Mesh Repair | Repair non-watertight | STL | Repaired STL | MeshLib |
| Render | Visualize | STL | 3-view PNG | VTK |
| Validator | Geometry check | Code + metrics + render | Pass/fail + feedback | LLM (Opus) + OCCT + MeshLib |
| Refiner | Feedback → Code | Code + feedback | Improved code | LLM + KB1 |
| Forge CAD | Handoff | STL + STEP | Viewer link | ForgeCAD API |

**Agents:** 6 (Planner, Coder, ErrorRefiner, Refiner, Validator, ForgeCAD)  
**Loops:** 2 (inner error-fix max 3, outer geometric refinement max 5)  
**Gate:** Workflow state machine (Temporal durable)
