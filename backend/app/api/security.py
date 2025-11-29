"""
Security API Endpoints
Provides REST API for SwarmShield security operations
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/security", tags=["Security"])

# Request Models
class ProtectMessageRequest(BaseModel):
    agent_name: str = Field(..., description="Name of the agent")
    message: str = Field(..., description="Message to protect")

class CreateConversationRequest(BaseModel):
    name: str = Field(..., description="Conversation name")

class AddMessageRequest(BaseModel):
    conversation_id: str = Field(..., description="Conversation ID")
    agent_name: str = Field(..., description="Agent name")
    message: str = Field(..., description="Message content")

class ExportConversationRequest(BaseModel):
    conversation_id: str = Field(..., description="Conversation ID")
    format: str = Field("json", description="Export format")
    path: Optional[str] = Field(None, description="Optional export path")

# Endpoints
@router.post("/shield/protect-message")
async def protect_message(request: ProtectMessageRequest):
    """Protect a message with SwarmShield encryption"""
    try:
        from app.modules.swarm_shield_integration import get_swarm_shield_integration
        
        shield = get_swarm_shield_integration()
        protected = shield.protect_message(request.agent_name, request.message)
        
        return {
            "status": "success",
            "protected_message": protected
        }
    except Exception as e:
        logger.error(f"Message protection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/shield/conversations")
async def create_conversation(request: CreateConversationRequest):
    """Create a new secure conversation"""
    try:
        from app.modules.swarm_shield_integration import get_swarm_shield_integration
        
        shield = get_swarm_shield_integration()
        conversation_id = shield.create_conversation(request.name)
        
        if conversation_id is None:
            raise HTTPException(status_code=500, detail="Failed to create conversation")
        
        return {
            "status": "success",
            "conversation_id": conversation_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Conversation creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/shield/conversations/{conversation_id}/messages")
async def add_message(conversation_id: str, request: AddMessageRequest):
    """Add a message to a conversation"""
    try:
        from app.modules.swarm_shield_integration import get_swarm_shield_integration
        
        shield = get_swarm_shield_integration()
        success = shield.add_message(conversation_id, request.agent_name, request.message)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to add message")
        
        return {
            "status": "success",
            "conversation_id": conversation_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Add message error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/shield/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Get messages from a conversation"""
    try:
        from app.modules.swarm_shield_integration import get_swarm_shield_integration
        
        shield = get_swarm_shield_integration()
        messages = shield.get_messages(conversation_id)
        summary = shield.get_conversation_summary(conversation_id)
        
        return {
            "status": "success",
            "conversation_id": conversation_id,
            "messages": messages,
            "summary": summary
        }
    except Exception as e:
        logger.error(f"Get conversation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/shield/conversations/{conversation_id}/export")
async def export_conversation(conversation_id: str, request: ExportConversationRequest):
    """Export a conversation"""
    try:
        from app.modules.swarm_shield_integration import get_swarm_shield_integration
        
        shield = get_swarm_shield_integration()
        export_path = shield.export_conversation(
            conversation_id,
            format=request.format,
            path=request.path
        )
        
        if export_path is None:
            raise HTTPException(status_code=500, detail="Failed to export conversation")
        
        return {
            "status": "success",
            "export_path": export_path
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Export conversation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/shield/agents/{agent_name}/stats")
async def get_agent_stats(agent_name: str):
    """Get statistics for an agent"""
    try:
        from app.modules.swarm_shield_integration import get_swarm_shield_integration
        
        shield = get_swarm_shield_integration()
        stats = shield.get_agent_stats(agent_name)
        
        if stats is None:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        return {
            "status": "success",
            "agent_name": agent_name,
            "stats": stats
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get agent stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/shield/status")
async def get_security_status():
    """Get SwarmShield security status"""
    try:
        from app.modules.swarm_shield_integration import get_swarm_shield_integration
        
        shield = get_swarm_shield_integration()
        health = shield.health_check()
        
        return health
    except Exception as e:
        logger.error(f"Get security status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


