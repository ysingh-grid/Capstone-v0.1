"""
harness/api/chat.py
===================
Interactive Clarification Chat Agent for ForgeCAD UI.

Provides a conversational side-panel agent to disambiguate 
measurements, materials, and constraints before generation.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import uuid
import anthropic
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])

# In-memory session store (Phase 2 MVP persistence)
# Format: { "session_id": [{"role": "user"|"assistant", "content": "..."}] }
_sessions: Dict[str, List[Dict[str, str]]] = {}

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

def _get_anthropic_client() -> anthropic.Anthropic:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")
    return anthropic.Anthropic(api_key=api_key)

@router.post("", response_model=ChatMessageRes)
async def chat_endpoint(req: ChatMessageReq):
    session_id = req.session_id or str(uuid.uuid4())
    
    if session_id not in _sessions:
        _sessions[session_id] = []
        
    history = _sessions[session_id]
    history.append({"role": "user", "content": req.message})
    
    try:
        client = _get_anthropic_client()
        
        # Anthropic messages API
        response = client.messages.create(
            model="claude-3-haiku-20240307", # Fast model for interactive chat
            max_tokens=1000,
            system=CLARIFICATION_SYSTEM_PROMPT,
            messages=history,
            temperature=0.7
        )
        
        reply_text = response.content[0].text
        history.append({"role": "assistant", "content": reply_text})
        
        # Determine if the agent thinks the prompt is fully refined
        is_ready = "ready to generate" in reply_text.lower() or "final refined prompt" in reply_text.lower()
        
        return ChatMessageRes(
            response=reply_text,
            session_id=session_id,
            is_ready=is_ready
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
    """
    Extracts the final unified prompt from the conversation history.
    """
    if req.session_id not in _sessions:
        raise HTTPException(status_code=404, detail="Session not found")
        
    history = _sessions[req.session_id]
    if not history:
        raise HTTPException(status_code=400, detail="Empty session")
        
    try:
        client = _get_anthropic_client()
        
        extraction_prompt = "Based on the conversation history, extract the final refined engineering design prompt. Return ONLY the prompt text, nothing else."
        
        messages = list(history)
        messages.append({"role": "user", "content": extraction_prompt})
        
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            messages=messages,
            temperature=0.1
        )
        
        final_text = response.content[0].text.strip()
        return FinalizeRes(refined_prompt=final_text)
        
    except Exception as e:
        logger.error(f"Chat finalize error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
