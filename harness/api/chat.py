"""
harness/api/chat.py
===================
Interactive Clarification Chat Agent for ForgeCAD UI.

Provides a conversational side-panel agent to disambiguate
measurements, materials, and constraints before generation.
Uses Gemini API (google-genai).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])

# In-memory session store (Phase 2 MVP persistence)
# Format: { "session_id": [{"role": "user"|"model", "parts": [{"text": "..."}]}] }
_sessions: Dict[str, List[Dict]] = {}

# System prompt for the Clarification Agent
CLARIFICATION_SYSTEM_PROMPT = """
You are an expert mechanical engineering assistant and CAD modeler.
Your job is to help the user refine their 3D design idea into a highly precise, unambiguous prompt for an automated CAD generation system (AutoFab).

Follow these rules:
1. Identify missing critical dimensions (e.g., width, height, thickness).
2. Identify missing constraints (e.g., hole diameters, corner radii).
3. Ask clarifying questions ONE AT A TIME. Do not overwhelm the user.
4. Keep your responses short and conversational.
5. Once you have enough precise engineering details to generate a parametric CAD model without ambiguity, explicitly state the final refined prompt in a clear block, and say "I am ready to generate."

Do not generate Python or CadQuery code yourself. Your only output should be the conversation and the final refined prompt.
"""


class ChatMessageReq(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatMessageRes(BaseModel):
    response: str
    session_id: str
    is_ready: bool = False


def _get_gemini_client():
    """Return a configured Gemini genai client."""
    from google import genai
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
    return genai.Client(api_key=api_key)


def _chat_model() -> str:
    """Fast Gemini model for interactive chat responses."""
    return os.getenv("CHAT_MODEL", "gemini-2.0-flash")


@router.post("", response_model=ChatMessageRes)
async def chat_endpoint(req: ChatMessageReq):
    from google.genai import types

    session_id = req.session_id or str(uuid.uuid4())

    if session_id not in _sessions:
        _sessions[session_id] = []

    history = _sessions[session_id]

    # Append new user turn in Gemini format
    history.append({
        "role": "user",
        "parts": [{"text": req.message}],
    })

    try:
        client = _get_gemini_client()
        model = _chat_model()

        # Build history as types.Content list (excluding the last user message,
        # which we pass as the current input)
        gemini_history = []
        for turn in history[:-1]:
            role = turn["role"]
            text = turn["parts"][0]["text"]
            gemini_history.append(
                types.Content(role=role, parts=[types.Part.from_text(text=text)])
            )

        current_msg = req.message

        response = client.models.generate_content(
            model=model,
            contents=gemini_history + [
                types.Content(role="user", parts=[types.Part.from_text(text=current_msg)])
            ],
            config=types.GenerateContentConfig(
                system_instruction=CLARIFICATION_SYSTEM_PROMPT,
                max_output_tokens=1000,
                temperature=0.7,
            ),
        )

        reply_text = response.text
        history.append({
            "role": "model",
            "parts": [{"text": reply_text}],
        })

        is_ready = (
            "ready to generate" in reply_text.lower()
            or "final refined prompt" in reply_text.lower()
        )

        return ChatMessageRes(
            response=reply_text,
            session_id=session_id,
            is_ready=is_ready,
        )

    except Exception as e:
        logger.error(f"Chat agent error: {e}")
        # Pop the user message so they can retry
        if history and history[-1]["role"] == "user":
            history.pop()
        raise HTTPException(status_code=500, detail=str(e))


class FinalizeReq(BaseModel):
    session_id: str


class FinalizeRes(BaseModel):
    refined_prompt: str


@router.post("/finalize", response_model=FinalizeRes)
async def finalize_chat(req: FinalizeReq):
    """Extracts the final unified prompt from the conversation history."""
    from google.genai import types

    if req.session_id not in _sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    history = _sessions[req.session_id]
    if not history:
        raise HTTPException(status_code=400, detail="Empty session")

    try:
        client = _get_gemini_client()
        model = _chat_model()

        # Build full history + extraction request
        gemini_history = [
            types.Content(
                role=turn["role"],
                parts=[types.Part.from_text(text=turn["parts"][0]["text"])],
            )
            for turn in history
        ]
        extraction_msg = (
            "Based on the conversation history, extract the final refined engineering "
            "design prompt. Return ONLY the prompt text, nothing else."
        )
        gemini_history.append(
            types.Content(role="user", parts=[types.Part.from_text(text=extraction_msg)])
        )

        response = client.models.generate_content(
            model=model,
            contents=gemini_history,
            config=types.GenerateContentConfig(
                max_output_tokens=1000,
                temperature=0.1,
            ),
        )

        final_text = response.text.strip()
        return FinalizeRes(refined_prompt=final_text)

    except Exception as e:
        logger.error(f"Chat finalize error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
