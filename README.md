# ⚙️ Geometry Agent Harness (ForgeCAD)

The Geometry Agent Harness is a multi-agent system designed to autonomously generate, refine, and verify 3D parametric CAD models from natural language descriptions. It orchestrates a suite of AI agents using **Temporal** for resilient workflows, **CadQuery** for geometric execution, and **VTK/OCCT** for visual and mathematical verification.

## 🏗️ Architecture

The system implements a Resilient Language Model (RLM) pipeline:
1. **Planner Agent:** Converts natural language into a structured JSON design schema.
2. **Coder Agent:** Writes the procedural CadQuery Python script.
3. **Executor (Sandbox):** Safely runs the generated CadQuery script, extracting volume, watertightness, and STL/STEP exports.
4. **ErrorRefiner Loop:** Automatically feeds traceback errors back to the LLM for immediate code repair.
5. **Verifier Agent:** Evaluates the generated geometry against the original constraints (using textual metrics and optional multimodal VTK rendering).
6. **Refiner Loop:** Adjusts the code iteratively if geometric constraints (e.g., bounding box, volume) fail validation.

## 🛠️ Prerequisites

* Python 3.11+
* [Temporal Server](https://docs.temporal.io/cli) running locally (`temporal server start-dev`)
* (Optional) [LMStudio](https://lmstudio.ai/) for running local models.

## 📦 Installation

```bash
# Clone and enter the repository
cd Capstone-v0.1

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -e .
pip install google-genai uvicorn fastapi temporalio cadquery vtk
```

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure your LLM provider. The harness supports both the **Gemini API** and **Anthropic API** (or OpenAI-compatible local endpoints like LMStudio).

```ini
# --- Example .env ---

# LLM Provider: 'gemini' or 'anthropic'
LLM_PROVIDER=gemini

# Gemini Configuration (Two-tier model routing)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_GENERATION_MODEL=gemini-3.5-flash
GEMINI_JUDGE_MODEL=gemini-3.1-pro-preview

# Observability: Langfuse v4 (Local instance on port 3000)
LANGFUSE_PUBLIC_KEY=pk-lf-your-public-key
LANGFUSE_SECRET_KEY=sk-lf-your-secret-key
LANGFUSE_HOST=http://localhost:3000

# Anthropic / Local Configuration (LMStudio)
ANTHROPIC_API_KEY=lm-studio
ANTHROPIC_BASE_URL=http://localhost:1234/v1

# Multi-Agent Iteration Limits
MAX_ERROR_RETRIES=3
MAX_REFINEMENT_ITERATIONS=5

# Visual Verification (Requires vision-capable Judge model)
USE_VISION=true
```

## 🚀 Running the Full Stack

Each component runs in its own terminal tab. Start them in order.

---

### Component 1 — Langfuse (Observability) ✅ Docker

```bash
cd ~/langfuse && docker compose up -d
```

Dashboard → **http://localhost:3000**

> Already running if Docker Desktop is open. No action needed after first boot.

---

### Component 2 — Temporal Server (Workflow Engine)

```bash
temporal server start-dev
```

Web UI → **http://localhost:8233** — shows live workflow execution history.

---

### Component 3 — Temporal Worker (Agent Pipeline) ⚡ Start this first

Open a **dedicated terminal tab** and keep it running:

```bash
cd /path/to/Capstone-v0.1
source .venv/bin/activate
python -m harness.workflows.worker
```

You should see:
```
[worker] Connecting to Temporal at localhost:7233 namespace=default
[worker] Worker started on queue 'design'. Press Ctrl+C to stop.
```

> This process runs all 6 agents (Planner → Coder → ErrorRefiner → VisualJudge → GeometryRefiner → Handoff). Keep it alive for the duration of your session.

---

### Component 4 — Harness API + Prompt UI

```bash
cd /path/to/Capstone-v0.1
source .venv/bin/activate
uvicorn harness.api.app:app --reload --port 8000
```

Submit UI → **http://localhost:8000** — type your natural language prompt here.

From the Web UI you can:
* Submit natural language prompts
* Watch the live pipeline (Planner → Coder → Verifier → ForgeCAD)
* Inspect generated CadQuery code and ForgeCAD `.forge.js`
* Review geometry evidence (Volume, IoU, Watertightness)
* Approve/Reject designs or send revision instructions
* Download `.step`, `.stl`, `.png`, and `.forge.js` artifacts

---

### Component 5 — ForgeCAD Studio (Post-Handoff Editor)

After a workflow completes, the UI shows the studio launch command. Or run manually:

```bash
forgecad studio ./artifacts/<workflow_id>/forgecad/
```

Studio → **http://localhost:3000** (ForgeCAD's own port, separate from Langfuse)

> First-time setup: `npm install -g forgecad`

---

## 🔁 End-to-End Flow

```
You type a prompt          →  localhost:8000  (Prompt UI)
         │
         ▼
Temporal workflow runs     →  localhost:8233  (Temporal Web UI — observe)
  Planner → Coder → Executor → Judge → Refiner → Handoff
         │
         ▼
Langfuse captures traces   →  localhost:3000  (Langfuse Dashboard)
  Per-agent latency, token cost, full prompt/response tree
         │
         ▼
ForgeCAD .forge.js emitted →  ./artifacts/<id>/forgecad/
         │
         ▼
Engineer opens in Studio   →  forgecad studio ./artifacts/<id>/forgecad/
  Live sliders, 3D viewport, STEP/STL/3MF export
```

## 🩺 Quick Health Check

```bash
# Langfuse
curl http://localhost:3000/api/public/health

# Temporal Web UI
curl -o /dev/null -w "%{http_code}" http://localhost:8233

# Harness API
curl http://localhost:8000/health
```

## 📁 Artifact Store
All generated outputs (Code, STEP files, STL meshes, PNG renders, and execution trace logs) are automatically saved to `./artifacts/` with deterministic IDs for traceability.

## 🔩 ForgeCAD Studio — Live Parametric Editor

After a design is approved and the handoff step completes, the harness generates a **ForgeCAD project** containing a parametric `.forge.js` model.  
Engineers open it in the [ForgeCAD Studio](https://forgecad.io) — a live browser workbench with sliders for every dimension.

### Setup (one-time)
```bash
# Requires Node.js
npm install -g forgecad
```

### Open a completed design
When a workflow reaches the `DONE` stage, the **ForgeCAD .forge.js** tab in the Web UI displays the studio launch command:

```bash
forgecad studio ./artifacts/<workflow_id>/forgecad/<part_name>
```

This opens your browser at `http://localhost:3000` with:
- **Live parameter sliders** — drag to resize any dimension in real time
- **3D viewport** — powered by the Manifold WASM geometry kernel
- **Export** — STEP, STL, 3MF, G-code directly from the studio

### Architecture note
The `.forge.js` file is generated in parallel with the CadQuery Python pipeline.  
CadQuery / OCCT remains the **verified geometry authority** (volume, bounding-box, watertightness checks).  
The `.forge.js` is the **engineer-facing editable surface** — same design intent, live interactable parameters.

