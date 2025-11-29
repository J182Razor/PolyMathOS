"""
Workflows API Endpoints
Provides REST API for Zero workflow automation
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/workflows", tags=["Workflows"])

# Request Models
class CreateWorkflowRequest(BaseModel):
    workflow_def: Dict[str, Any] = Field(..., description="Workflow definition")

class ExecuteWorkflowRequest(BaseModel):
    workflow_id: str = Field(..., description="Workflow ID")
    trigger_data: Optional[Dict[str, Any]] = Field(None, description="Optional trigger data")

# Endpoints
@router.post("/zero/create")
async def create_workflow(request: CreateWorkflowRequest):
    """Create a new workflow using Zero"""
    try:
        from app.modules.zero_integration import get_zero_integration
        
        zero = get_zero_integration()
        workflow_id = zero.create_workflow(request.workflow_def)
        
        if workflow_id is None:
            raise HTTPException(status_code=500, detail="Failed to create workflow")
        
        return {
            "status": "success",
            "workflow_id": workflow_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Workflow creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/zero/execute")
async def execute_workflow(request: ExecuteWorkflowRequest):
    """Execute a workflow using Zero"""
    try:
        from app.modules.zero_integration import get_zero_integration
        
        zero = get_zero_integration()
        result = zero.execute_workflow(request.workflow_id, request.trigger_data)
        
        return result
    except Exception as e:
        logger.error(f"Workflow execution error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/zero/list")
async def list_workflows():
    """List all workflows"""
    try:
        from app.modules.zero_integration import get_zero_integration
        
        zero = get_zero_integration()
        workflows = zero.list_workflows()
        
        return {
            "status": "success",
            "workflows": workflows,
            "count": len(workflows)
        }
    except Exception as e:
        logger.error(f"List workflows error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/zero/status")
async def get_workflow_status():
    """Get Zero workflow system status"""
    try:
        from app.modules.zero_integration import get_zero_integration
        
        zero = get_zero_integration()
        health = zero.health_check()
        
        return health
    except Exception as e:
        logger.error(f"Get workflow status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


