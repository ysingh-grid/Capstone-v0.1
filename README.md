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

## 🚀 Usage

### 1. Start the Temporal Worker
The worker must be running in the background to execute workflow activities.
```bash
source .venv/bin/activate
python -m harness.workflows.worker
```

### 2. Option A: Command Line Interface (CLI)
Submit a design directly from the terminal:
```bash
harness submit "A 60x40x10mm plate with four M5 corner holes" --name corner_plate --no-approval
```
Check status: `harness status design-corner_plate-<id>`

### 3. Option B: ForgeCAD Web UI (API)
Start the FastAPI server to access the visual ForgeCAD dashboard.
```bash
source .venv/bin/activate
uvicorn harness.api.app:app --reload --port 8000
```
Then navigate to **http://localhost:8000** in your browser. 
From the Web UI, you can:
* Submit natural language prompts.
* Watch live progress across the agent pipeline.
* Inspect the generated CadQuery code.
* Review evidence (IoU, Volume, Watertightness).
* Approve/Reject designs or submit human-in-the-loop revision instructions.
* Download `.step`, `.stl`, and `.png` render artifacts.

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

