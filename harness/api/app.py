"""
harness/api/app.py
==================
FastAPI Product API for the Geometry Agent Harness.

PRD §10: The external API wraps Temporal workflow operations and artifact
access.  Starting a design creates a workflow; iteration and approval become
signals; status and previews are queries; large geometry evidence is read from
the artifact store by reference.

Phase 1 endpoints implemented:
  POST   /api/v1/designs                → start workflow
  GET    /api/v1/designs/{id}/status    → Temporal Query
  GET    /api/v1/designs/{id}/code      → ForgeCAD artifact read
  GET    /api/v1/designs/{id}/evidence  → geometry evidence artifact read
  POST   /api/v1/designs/{id}/approve   → Temporal Signal
  POST   /api/v1/designs/{id}/iterate   → Temporal Signal
  GET    /api/v1/designs/{id}/trace     → trace artifact read

Phase 2 deferred:
  SIGNAL /api/v1/designs/{id}/params    (update_params_signal)
  POST   /api/v1/designs/{id}/export    (explicit export trigger)
  WS     /ws/v1/designs/{id}/stream     (streaming stage changes)
"""

from __future__ import annotations

import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import pathlib
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel
from temporalio.client import Client

load_dotenv()

from harness.artifacts.store import get_store
from harness.workflows.design_workflow import DesignWorkflowInput, DesignWorkflow

app = FastAPI(
    title="Geometry Agent Harness API",
    description=(
        "Product API for the Geometry Agent Harness — RLM + Temporal + "
        "CadQuery + ForgeCAD.  PRD §10."
    ),
    version="0.1.0",
)

_STATIC = pathlib.Path(__file__).parent / "static"
if _STATIC.exists():
    app.mount("/ui", StaticFiles(directory=str(_STATIC), html=True), name="static")

@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/ui/index.html")

# ---------------------------------------------------------------------------
# Temporal client (lazy singleton)
# ---------------------------------------------------------------------------

_temporal_client: Optional[Client] = None


async def get_temporal_client() -> Client:
    global _temporal_client
    if _temporal_client is None:
        host = os.getenv("TEMPORAL_HOST", "localhost:7233")
        namespace = os.getenv("TEMPORAL_NAMESPACE", "default")
        _temporal_client = await Client.connect(host, namespace=namespace)
    return _temporal_client


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------


class StartDesignRequest(BaseModel):
    prompt: str
    name: str = "part"
    project_context: Optional[str] = None
    rubric: Optional[str] = None
    max_error_retries: int = 3
    max_refinement_iterations: int = 5
    require_approval: bool = True


class StartDesignResponse(BaseModel):
    workflow_id: str
    run_id: str
    message: str


class ApproveRequest(BaseModel):
    decision: str  # 'approved' | 'rejected'
    notes: str = ""


class IterateRequest(BaseModel):
    instructions: str
    updated_constraints: str = ""


# ---------------------------------------------------------------------------
# POST /api/v1/designs — start a new design workflow
# ---------------------------------------------------------------------------


@app.post("/api/v1/designs", response_model=StartDesignResponse, status_code=201)
async def start_design(req: StartDesignRequest):
    """
    Start a new CAD design workflow from a natural-language prompt.

    PRD §10.2: POST /api/v1/designs
    """
    client = await get_temporal_client()

    wf_input = DesignWorkflowInput(
        prompt=req.prompt,
        name=req.name,
        project_context=req.project_context,
        rubric=req.rubric,
        max_error_retries=req.max_error_retries,
        max_refinement_iterations=req.max_refinement_iterations,
        require_approval=req.require_approval,
    )

    handle = await client.start_workflow(
        DesignWorkflow.run,
        wf_input,
        id=f"design-{req.name}-{_short_id()}",
        task_queue="design",
    )

    return StartDesignResponse(
        workflow_id=handle.id,
        run_id=handle.result_run_id or "",
        message=f"Design workflow started. Poll /api/v1/designs/{handle.id}/status for progress.",
    )


# ---------------------------------------------------------------------------
# GET /api/v1/designs/{id}/status
# ---------------------------------------------------------------------------


@app.get("/api/v1/designs/{workflow_id}/status")
async def get_status(workflow_id: str):
    """
    Read current phase, verifier score, failure reason, and artifact URIs.

    PRD §10.2: QUERY /api/v1/designs/:id/status
    """
    client = await get_temporal_client()
    handle = client.get_workflow_handle(workflow_id)
    try:
        status = await handle.query(DesignWorkflow.status)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return JSONResponse(content=status)


# ---------------------------------------------------------------------------
# GET /api/v1/designs/{id}/code — editable ForgeCAD source
# ---------------------------------------------------------------------------


@app.get("/api/v1/designs/{workflow_id}/code", response_class=PlainTextResponse)
async def get_code(workflow_id: str):
    """
    Return the current editable ForgeCAD (annotated CadQuery) source.

    PRD §10.2: QUERY /api/v1/designs/:id/code
    """
    client = await get_temporal_client()
    handle = client.get_workflow_handle(workflow_id)
    try:
        status = await handle.query(DesignWorkflow.status)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    forgecad_uri = status.get("forgecad_artifact_uri")
    if not forgecad_uri:
        raise HTTPException(status_code=202, detail="ForgeCAD code not yet available.")

    store = get_store()
    if not store.exists(forgecad_uri):
        raise HTTPException(status_code=404, detail="ForgeCAD artifact not found in store.")

    return store.get_text(forgecad_uri)


# ---------------------------------------------------------------------------
# GET /api/v1/designs/{id}/evidence — geometry evidence artifact
# ---------------------------------------------------------------------------


@app.get("/api/v1/designs/{workflow_id}/evidence")
async def get_evidence(workflow_id: str):
    """
    Return OCCT kernel measurements, MeshLib diagnostics (Phase 2), and artifact links.

    PRD §10.2: QUERY /api/v1/designs/:id/evidence
    """
    client = await get_temporal_client()
    handle = client.get_workflow_handle(workflow_id)
    try:
        status = await handle.query(DesignWorkflow.status)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    trace_uri = status.get("trace_artifact_uri")
    if not trace_uri:
        raise HTTPException(status_code=202, detail="Evidence not yet available.")

    store = get_store()
    if not store.exists(trace_uri):
        raise HTTPException(status_code=404, detail="Trace artifact not found.")

    trace_data = store.get_json(trace_uri)
    # Return the final geometry evidence section
    return JSONResponse(content={
        "workflow_id": workflow_id,
        "final_geometry_evidence": trace_data.get("final_geometry_evidence"),
        "final_verifier_score": trace_data.get("final_verifier_score"),
        "render_artifact_uri": status.get("render_artifact_uri"),
        "step_artifact_uri": status.get("step_artifact_uri"),
        "stl_artifact_uri": status.get("stl_artifact_uri"),
    })


# ---------------------------------------------------------------------------
# POST /api/v1/designs/{id}/approve — human approval gate signal
# ---------------------------------------------------------------------------


@app.post("/api/v1/designs/{workflow_id}/approve", status_code=200)
async def approve_design(workflow_id: str, req: ApproveRequest):
    """
    Send an approval or rejection signal to the human-review gate.

    PRD §10.2: SIGNAL /api/v1/designs/:id/approve
    Valid decisions: 'approved', 'rejected'
    """
    if req.decision not in ("approved", "rejected"):
        raise HTTPException(
            status_code=400,
            detail="decision must be 'approved' or 'rejected'",
        )
    client = await get_temporal_client()
    handle = client.get_workflow_handle(workflow_id)
    try:
        if req.decision == "rejected":
            await handle.signal(DesignWorkflow.reject_signal, req.notes)
        else:
            await handle.signal(DesignWorkflow.approve_signal, req.decision, req.notes)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"workflow_id": workflow_id, "decision": req.decision, "notes": req.notes}


# ---------------------------------------------------------------------------
# POST /api/v1/designs/{id}/iterate — send revision instructions
# ---------------------------------------------------------------------------


@app.post("/api/v1/designs/{workflow_id}/iterate", status_code=200)
async def iterate_design(workflow_id: str, req: IterateRequest):
    """
    Send revision instructions into a running workflow.

    PRD §10.2: SIGNAL /api/v1/designs/:id/iterate
    """
    client = await get_temporal_client()
    handle = client.get_workflow_handle(workflow_id)
    try:
        await handle.signal(
            DesignWorkflow.iterate_signal,
            req.instructions,
            req.updated_constraints,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"workflow_id": workflow_id, "instructions": req.instructions}


# ---------------------------------------------------------------------------
# GET /api/v1/designs/{id}/trace — fetch primitive trace artifact
# ---------------------------------------------------------------------------


@app.get("/api/v1/designs/{workflow_id}/trace")
async def get_trace(workflow_id: str):
    """
    Fetch the full primitive trace artifact.

    PRD §10.2: GET /api/v1/designs/:id/trace
    """
    client = await get_temporal_client()
    handle = client.get_workflow_handle(workflow_id)
    try:
        status = await handle.query(DesignWorkflow.status)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    trace_uri = status.get("trace_artifact_uri")
    if not trace_uri:
        raise HTTPException(status_code=202, detail="Trace not yet available.")

    store = get_store()
    if not store.exists(trace_uri):
        raise HTTPException(status_code=404, detail="Trace artifact not found.")

    return JSONResponse(content=store.get_json(trace_uri))




def _short_id(length: int = 8) -> str:
    import uuid
    return uuid.uuid4().hex[:length]


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/health")
async def health():
    return {"status": "ok", "service": "geometry-agent-harness"}


# ---------------------------------------------------------------------------
# POST /api/v1/designs/{id}/export — artifact download links (GAP-5)
# ---------------------------------------------------------------------------


@app.post("/api/v1/designs/{workflow_id}/export", status_code=200)
async def export_design(workflow_id: str):
    """
    Return download-ready artifact links for STEP, STL, render, and ForgeCAD.

    PRD §10.2: POST /api/v1/designs/:id/export
    """
    client = await get_temporal_client()
    handle = client.get_workflow_handle(workflow_id)
    try:
        status = await handle.query(DesignWorkflow.status)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    store = get_store()
    artifacts = {}
    for key in ("step_artifact_uri", "stl_artifact_uri", "render_artifact_uri",
                "forgecad_artifact_uri", "trace_artifact_uri"):
        uri = status.get(key)
        if uri and store.exists(uri):
            artifacts[key] = {
                "uri": uri,
                "available": True,
                "download_path": f"/api/v1/artifacts/{workflow_id}/{key.replace('_artifact_uri', '')}",
            }
        else:
            artifacts[key] = {"uri": uri, "available": False}

    return JSONResponse(content={"workflow_id": workflow_id, "artifacts": artifacts})


# ---------------------------------------------------------------------------
# GET /api/v1/artifacts/{id}/{type} — raw artifact download
# ---------------------------------------------------------------------------


@app.get("/api/v1/artifacts/{workflow_id}/{artifact_type}")
async def download_artifact(workflow_id: str, artifact_type: str):
    """Download a specific artifact by type (step, stl, render, forgecad, trace)."""
    from fastapi.responses import Response

    type_map = {
        "step": ("step_artifact_uri", "application/octet-stream"),
        "stl": ("stl_artifact_uri", "application/octet-stream"),
        "render": ("render_artifact_uri", "image/png"),
        "forgecad": ("forgecad_artifact_uri", "text/x-python"),
        "trace": ("trace_artifact_uri", "application/json"),
    }
    if artifact_type not in type_map:
        raise HTTPException(status_code=400, detail=f"Unknown artifact type: {artifact_type}")

    client = await get_temporal_client()
    handle = client.get_workflow_handle(workflow_id)
    try:
        status = await handle.query(DesignWorkflow.status)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    uri_key, media_type = type_map[artifact_type]
    uri = status.get(uri_key)
    if not uri:
        raise HTTPException(status_code=202, detail=f"{artifact_type} not yet available")

    store = get_store()
    if not store.exists(uri):
        raise HTTPException(status_code=404, detail=f"Artifact not found in store: {uri}")

    content = store.get_bytes(uri)
    return Response(content=content, media_type=media_type)


# ---------------------------------------------------------------------------
# POST /api/v1/designs/{id}/params — update_params signal (GAP-6)
# ---------------------------------------------------------------------------


class ParamsRequest(BaseModel):
    params: dict


@app.post("/api/v1/designs/{workflow_id}/params", status_code=200)
async def update_params(workflow_id: str, req: ParamsRequest):
    """
    Send parameter updates into a running workflow.

    PRD §10.2: SIGNAL /api/v1/designs/:id/params
    """
    client = await get_temporal_client()
    handle = client.get_workflow_handle(workflow_id)
    try:
        await handle.signal(DesignWorkflow.update_params_signal, req.params)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"workflow_id": workflow_id, "params_updated": req.params}


# ---------------------------------------------------------------------------
# WS /ws/v1/designs/{id}/stream — live stage updates (GAP-7)
# ---------------------------------------------------------------------------

from fastapi import WebSocket, WebSocketDisconnect  # noqa: E402 (after app definition)
import asyncio  # noqa: E402
import json as _json  # noqa: E402


@app.websocket("/ws/v1/designs/{workflow_id}/stream")
async def stream_design_status(websocket: WebSocket, workflow_id: str):
    """
    WebSocket endpoint that streams status updates every 2 seconds until
    the workflow reaches a terminal state (DONE, FAILED, ESCALATED).

    PRD §10.2: WS /ws/v1/designs/:id/stream
    """
    await websocket.accept()
    client = await get_temporal_client()
    handle = client.get_workflow_handle(workflow_id)

    terminal_stages = {"DONE", "FAILED", "ESCALATED"}
    last_stage = None

    try:
        while True:
            try:
                status = await handle.query(DesignWorkflow.status)
                stage = status.get("stage", "UNKNOWN")

                # Send update on every tick (client can debounce if needed)
                await websocket.send_text(_json.dumps({
                    "type": "status",
                    "workflow_id": workflow_id,
                    **status,
                }))

                if stage in terminal_stages:
                    await websocket.send_text(_json.dumps({
                        "type": "terminal",
                        "workflow_id": workflow_id,
                        "stage": stage,
                    }))
                    break

            except WebSocketDisconnect:
                break
            except Exception as exc:
                await websocket.send_text(_json.dumps({
                    "type": "error",
                    "detail": str(exc),
                }))
                break

            await asyncio.sleep(2)

    except WebSocketDisconnect:
        pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass

