"""
harness/api/chatbot_agent.py
============================
Phase 2 — Persistent Measurement-Extraction Chatbot Agent.

Replaces the stateless harness/api/chat.py with a file-backed session store
and a smarter engineering assistant that:
  1. Identifies missing critical dimensions from the user's design prompt.
  2. Asks ONE clarifying question at a time.
  3. Extracts numerical measurements from responses into ``resolved_params``.
  4. Declares readiness once all critical dimensions are captured.

Session files: artifacts/.chat_sessions/{session_id}.json

LLM routing (first available wins):
  1. Google Gemini Flash  (GEMINI_API_KEY)
  2. Anthropic claude-haiku-4-5-20251001  (ANTHROPIC_API_KEY)
"""

from __future__ import annotations

import json
import logging
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/assistant", tags=["chatbot"])

# ---------------------------------------------------------------------------
# Session store — file-backed JSON
# ---------------------------------------------------------------------------

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_SESSIONS_DIR = _PROJECT_ROOT / "artifacts" / ".chat_sessions"


def _sessions_dir() -> Path:
    _SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
    return _SESSIONS_DIR


def _session_path(session_id: str) -> Path:
    return _sessions_dir() / f"{session_id}.json"


def _load_session(session_id: str) -> dict:
    """Load a session from disk. Returns a fresh session dict on failure."""
    path = _session_path(session_id)
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            logger.warning("Corrupt session %s — starting fresh: %s", session_id, exc)
    return _new_session(session_id)


def _save_session(session: dict) -> None:
    path = _session_path(session["session_id"])
    path.write_text(json.dumps(session, indent=2, ensure_ascii=False), encoding="utf-8")


def _new_session(session_id: Optional[str] = None) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    return {
        "session_id": session_id or str(uuid.uuid4()),
        "created_at": now,
        "updated_at": now,
        "messages": [],
        "resolved_params": {},
        "design_context": "",
        "is_ready": False,
    }


# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """\
You are an expert mechanical engineering assistant embedded inside ForgeCAD,
a parametric 3D CAD design platform. Your role is to help users define their
designs with precise, unambiguous measurements before an AI pipeline generates
the CAD model.

## Your behaviour
1. **Analyse the user's description** and identify which dimensions are missing,
   vague, or ambiguous (e.g. "small", "medium", "a few").
2. **Ask exactly ONE clarifying question per turn** — the most critical missing
   measurement first. Never ask multiple questions at once.
3. **Extract and remember** every measurement the user provides.
4. When you have gathered all critical dimensions needed to fully specify the
   part, state "I have all the measurements I need — ready to generate." and
   set `is_ready = true` in the JSON block below.
5. Keep responses short, friendly, and conversational. Use metric units (mm)
   unless the user specifies otherwise.

## Response format
Every reply MUST end with a JSON block (inside ```json ... ```) with this exact
schema:
```json
{
  "resolved_params": {
    "width_mm": 60,
    "height_mm": 40
  },
  "pending_questions": ["What wall thickness should the enclosure have?"],
  "is_ready": false
}
```
Include ALL resolved parameters collected so far (not just the new one).
Set `is_ready` to `true` only when no critical dimensions remain unknown.
Do NOT generate Python/CadQuery/ForgeCAD code. Your output is conversation only.
"""

# ---------------------------------------------------------------------------
# LLM helpers
# ---------------------------------------------------------------------------


def _call_gemini(messages: list[dict], system: str) -> str:
    """Call Google Gemini Flash via google-genai SDK (new API)."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set")
    try:
        from google import genai as google_genai          # type: ignore[import]
        from google.genai import types as genai_types     # type: ignore[import]
    except ImportError:
        raise RuntimeError("google-genai not installed (pip install google-genai)")

    client = google_genai.Client(api_key=api_key)
    model_name = os.getenv("GEMINI_CHAT_MODEL", "gemini-2.0-flash")

    # Convert to Gemini role format (user / model — no system role in contents)
    contents = []
    for m in messages:
        role = "model" if m["role"] == "assistant" else "user"
        contents.append(
            genai_types.Content(
                role=role,
                parts=[genai_types.Part(text=m["content"])],
            )
        )

    config = genai_types.GenerateContentConfig(
        system_instruction=system,
        max_output_tokens=int(os.getenv("CHAT_MAX_TOKENS", "2048")),
        temperature=0.7,
    )
    response = client.models.generate_content(
        model=model_name,
        contents=contents,
        config=config,
    )
    return response.text


def _call_anthropic(messages: list[dict], system: str) -> str:
    """Call Anthropic claude-haiku-4-5-20251001."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not set")
    try:
        import anthropic  # type: ignore[import]
    except ImportError:
        raise RuntimeError("anthropic SDK not installed")

    base_url = os.getenv("ANTHROPIC_BASE_URL")
    client = anthropic.Anthropic(
        api_key=api_key,
        **({"base_url": base_url} if base_url else {}),
    )
    resp = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=int(os.getenv("CHAT_MAX_TOKENS", "2048")),
        system=system,
        messages=messages,
        temperature=0.7,
    )
    # Guard against empty content list
    if not resp.content:
        raise RuntimeError(f"Anthropic returned empty content (stop_reason={resp.stop_reason})")
    block = resp.content[0]
    if not hasattr(block, "text"):
        raise RuntimeError(f"Unexpected content block type: {type(block)}")
    return block.text


def _chat(messages: list[dict]) -> str:
    """Route to first available LLM. Tries Gemini then Anthropic."""
    errors: list[str] = []
    for fn in (_call_gemini, _call_anthropic):
        try:
            return fn(messages, _SYSTEM_PROMPT)
        except Exception as exc:
            errors.append(f"{fn.__name__}: {exc}")
    raise HTTPException(
        status_code=503,
        detail=f"No LLM available. Errors: {'; '.join(errors)}",
    )


# ---------------------------------------------------------------------------
# Response parser — extract JSON block from LLM reply
# ---------------------------------------------------------------------------

_JSON_BLOCK_RE = re.compile(r"```json\s*(\{.*?\})\s*```", re.DOTALL)


def _parse_agent_json(text: str) -> tuple[dict, list[str], bool]:
    """
    Extract (resolved_params, pending_questions, is_ready) from the LLM reply.
    Returns safe defaults if parsing fails.
    """
    m = _JSON_BLOCK_RE.search(text)
    if not m:
        return {}, [], False
    try:
        data = json.loads(m.group(1))
        resolved = data.get("resolved_params") or {}
        pending = data.get("pending_questions") or []
        is_ready = bool(data.get("is_ready", False))
        return resolved, pending, is_ready
    except Exception as exc:
        logger.warning("Failed to parse agent JSON block: %s", exc)
        return {}, [], False


def _strip_json_block(text: str) -> str:
    """Remove the trailing ```json ... ``` block from the visible reply."""
    return _JSON_BLOCK_RE.sub("", text).strip()


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    design_context: Optional[str] = None  # current prompt text in the UI


class ChatResponse(BaseModel):
    response: str
    session_id: str
    is_ready: bool = False
    resolved_params: dict = {}
    pending_questions: list[str] = []


class FinalizeRequest(BaseModel):
    session_id: str


class FinalizeResponse(BaseModel):
    refined_prompt: str
    resolved_params: dict = {}


class SessionResponse(BaseModel):
    session_id: str
    messages: list[dict]
    resolved_params: dict
    is_ready: bool
    created_at: str
    updated_at: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post("", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest) -> ChatResponse:
    """
    Send a user message to the measurement clarification agent.

    Creates a new session if ``session_id`` is absent or unknown.
    """
    # Load or create session
    if req.session_id:
        session = _load_session(req.session_id)
    else:
        session = _new_session()

    # Bootstrap context on first message
    if not session["messages"] and req.design_context:
        session["design_context"] = req.design_context
        # Inject design context as silent system message
        session["messages"].append({
            "role": "user",
            "content": (
                f"I want to design this part: {req.design_context}\n\n"
                f"{req.message}"
            ),
        })
    else:
        session["messages"].append({"role": "user", "content": req.message})

    try:
        raw_reply = _chat(session["messages"])
    except HTTPException:
        # Pop the last user message so the client can retry
        session["messages"].pop()
        raise

    resolved, pending, is_ready = _parse_agent_json(raw_reply)
    visible_reply = _strip_json_block(raw_reply)

    # Merge newly resolved params into session
    session["resolved_params"].update(resolved)
    session["is_ready"] = is_ready
    session["updated_at"] = datetime.now(timezone.utc).isoformat()
    session["messages"].append({"role": "assistant", "content": raw_reply})

    _save_session(session)

    return ChatResponse(
        response=visible_reply,
        session_id=session["session_id"],
        is_ready=is_ready,
        resolved_params=session["resolved_params"],
        pending_questions=pending,
    )


@router.post("/finalize", response_model=FinalizeResponse)
async def finalize_chat(req: FinalizeRequest) -> FinalizeResponse:
    """
    Extract a final refined prompt from the conversation history.
    Injects resolved_params as confirmed measurements.
    """
    session = _load_session(req.session_id)
    if not session["messages"]:
        raise HTTPException(status_code=400, detail="Empty session — nothing to finalize.")

    # Build extraction prompt
    params_str = json.dumps(session["resolved_params"], indent=2) if session["resolved_params"] else "{}"
    extraction_msg = (
        "Based on our conversation, please write a single, complete, "
        "unambiguous engineering design prompt that includes ALL confirmed "
        f"measurements:\n\n{params_str}\n\n"
        "Return ONLY the final prompt text — no preamble, no JSON block."
    )
    messages = list(session["messages"]) + [{"role": "user", "content": extraction_msg}]

    try:
        raw = _chat(messages)
    except HTTPException:
        raise

    refined = _strip_json_block(raw).strip()

    return FinalizeResponse(
        refined_prompt=refined,
        resolved_params=session["resolved_params"],
    )


@router.get("/session/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str) -> SessionResponse:
    """Resume a previous session (e.g. on page reload)."""
    session = _load_session(session_id)
    # Only return the visible (non-raw) messages
    visible_messages = [
        m for m in session["messages"]
        if m["role"] == "user"
        or (m["role"] == "assistant" and _strip_json_block(m["content"]))
    ]
    # Strip JSON blocks from assistant messages before returning
    cleaned = []
    for m in visible_messages:
        if m["role"] == "assistant":
            cleaned.append({**m, "content": _strip_json_block(m["content"])})
        else:
            cleaned.append(m)

    return SessionResponse(
        session_id=session["session_id"],
        messages=cleaned,
        resolved_params=session.get("resolved_params", {}),
        is_ready=session.get("is_ready", False),
        created_at=session.get("created_at", ""),
        updated_at=session.get("updated_at", ""),
    )


@router.delete("/session/{session_id}")
async def delete_session(session_id: str) -> dict:
    """Clear a session (start fresh)."""
    path = _session_path(session_id)
    if path.exists():
        path.unlink(missing_ok=True)
    return {"deleted": True, "session_id": session_id}
