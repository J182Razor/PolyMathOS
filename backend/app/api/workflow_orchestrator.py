"""
Workflow Orchestrator API Endpoints
Provides REST API for workflow orchestration and progress-based adaptation
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/workflows/orchestrator", tags=["Workflow Orchestrator"])

# Request Models
class InitializeWorkflowRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    learning_plan_id: str = Field(..., description="Learning plan ID")
    topic: str = Field(..., description="Learning topic")
    goals: Dict[str, Any] = Field(..., description="Learning goals")

class UpdateProgressRequest(BaseModel):
    learning_plan_id: str = Field(..., description="Learning plan ID")
    activity_id: str = Field(..., description="Activity ID")
    score: float = Field(..., description="Performance score (0-100)")
    activity_type: str = Field("assessment", description="Type of activity")

class TriggerResourceDiscoveryRequest(BaseModel):
    learning_plan_id: str = Field(..., description="Learning plan ID")
    topic: str = Field(..., description="Topic for resource discovery")

# Endpoints
@router.post("/initialize")
async def initialize_workflow(request: InitializeWorkflowRequest):
    """Initialize a complete learning workflow system"""
    try:
        from app.modules.workflow_orchestrator import get_workflow_orchestrator
        
        orchestrator = get_workflow_orchestrator()
        workflow_system = await orchestrator.initialize_learning_workflow(
            user_id=request.user_id,
            learning_plan_id=request.learning_plan_id,
            topic=request.topic,
            goals=request.goals
        )
        
        return {
            "status": "success",
            "workflow_system": workflow_system
        }
    except Exception as e:
        logger.error(f"Workflow initialization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/progress/update")
async def update_progress(request: UpdateProgressRequest):
    """Update progress and adapt workflows in real-time"""
    try:
        from app.modules.workflow_orchestrator import get_workflow_orchestrator
        
        orchestrator = get_workflow_orchestrator()
        result = await orchestrator.update_progress_and_adapt(
            learning_plan_id=request.learning_plan_id,
            activity_id=request.activity_id,
            score=request.score,
            activity_type=request.activity_type
        )
        
        return result
    except Exception as e:
        logger.error(f"Progress update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resources/trigger")
async def trigger_resource_discovery(request: TriggerResourceDiscoveryRequest):
    """Trigger resource discovery workflow"""
    try:
        from app.modules.workflow_orchestrator import get_workflow_orchestrator
        
        orchestrator = get_workflow_orchestrator()
        result = await orchestrator.trigger_resource_discovery(
            learning_plan_id=request.learning_plan_id,
            topic=request.topic
        )
        
        return result
    except Exception as e:
        logger.error(f"Resource discovery trigger error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assessment/trigger")
async def trigger_assessment(learning_plan_id: str):
    """Trigger periodic assessment workflow"""
    try:
        from app.modules.workflow_orchestrator import get_workflow_orchestrator
        
        orchestrator = get_workflow_orchestrator()
        result = await orchestrator.trigger_periodic_assessment(learning_plan_id)
        
        return result
    except Exception as e:
        logger.error(f"Assessment trigger error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{learning_plan_id}")
async def get_workflow_status(learning_plan_id: str):
    """Get current workflow status and progress"""
    try:
        from app.modules.workflow_orchestrator import get_workflow_orchestrator
        
        orchestrator = get_workflow_orchestrator()
        status = orchestrator.get_workflow_status(learning_plan_id)
        
        return status
    except Exception as e:
        logger.error(f"Get workflow status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

