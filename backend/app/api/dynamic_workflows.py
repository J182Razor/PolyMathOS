"""
Dynamic Workflows API Endpoints
Provides REST API for dynamic workflow generation and execution
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/workflows/dynamic", tags=["Dynamic Workflows"])

# Request Models
class GenerateLessonPlanWorkflowRequest(BaseModel):
    topic: str = Field(..., description="Learning topic")
    user_id: str = Field(..., description="User ID")
    goals: Dict[str, Any] = Field(..., description="Learning goals")
    user_profile: Optional[Dict[str, Any]] = Field(None, description="Optional user profile")

class CreateAdaptiveWorkflowRequest(BaseModel):
    workflow_id: str = Field(..., description="Original workflow ID")
    progress_data: Dict[str, Any] = Field(..., description="Current progress data")

class ExecuteAdaptiveWorkflowRequest(BaseModel):
    workflow_id: str = Field(..., description="Workflow ID")
    trigger_data: Dict[str, Any] = Field(..., description="Trigger data")
    progress_data: Optional[Dict[str, Any]] = Field(None, description="Optional progress data for adaptation")

class GenerateMultiPhaseWorkflowRequest(BaseModel):
    phases: List[Dict[str, Any]] = Field(..., description="List of learning phases")
    user_id: str = Field(..., description="User ID")
    topic: str = Field(..., description="Learning topic")

class GenerateResourceWorkflowRequest(BaseModel):
    topic: str = Field(..., description="Topic for resource discovery")
    user_id: str = Field(..., description="User ID")

class GenerateAssessmentWorkflowRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    learning_plan_id: str = Field(..., description="Learning plan ID")
    frequency: str = Field("weekly", description="Assessment frequency: daily, weekly, biweekly, monthly")

# Endpoints
@router.post("/lesson-plan/generate")
async def generate_lesson_plan_workflow(request: GenerateLessonPlanWorkflowRequest):
    """Generate a dynamic lesson plan workflow"""
    try:
        from app.modules.dynamic_workflow_generator import get_dynamic_workflow_generator
        
        generator = get_dynamic_workflow_generator()
        workflow = generator.generate_lesson_plan_workflow(
            topic=request.topic,
            user_id=request.user_id,
            goals=request.goals,
            user_profile=request.user_profile
        )
        
        return {
            "status": "success",
            "workflow": workflow
        }
    except Exception as e:
        logger.error(f"Lesson plan workflow generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/adaptive/create")
async def create_adaptive_workflow(request: CreateAdaptiveWorkflowRequest):
    """Create an adaptive workflow based on progress"""
    try:
        from app.modules.dynamic_workflow_generator import get_dynamic_workflow_generator
        
        generator = get_dynamic_workflow_generator()
        adapted_workflow = generator.create_adaptive_workflow(
            workflow_id=request.workflow_id,
            progress_data=request.progress_data
        )
        
        return {
            "status": "success",
            "adapted_workflow": adapted_workflow
        }
    except Exception as e:
        logger.error(f"Adaptive workflow creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/adaptive/execute")
async def execute_adaptive_workflow(request: ExecuteAdaptiveWorkflowRequest):
    """Execute workflow with real-time adaptation"""
    try:
        from app.modules.dynamic_workflow_generator import get_dynamic_workflow_generator
        
        generator = get_dynamic_workflow_generator()
        result = generator.execute_workflow_with_adaptation(
            workflow_id=request.workflow_id,
            trigger_data=request.trigger_data,
            progress_data=request.progress_data
        )
        
        return result
    except Exception as e:
        logger.error(f"Adaptive workflow execution error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/multi-phase/generate")
async def generate_multi_phase_workflow(request: GenerateMultiPhaseWorkflowRequest):
    """Generate a multi-phase adaptive workflow"""
    try:
        from app.modules.dynamic_workflow_generator import get_dynamic_workflow_generator
        
        generator = get_dynamic_workflow_generator()
        workflow = generator.generate_multi_phase_workflow(
            phases=request.phases,
            user_id=request.user_id,
            topic=request.topic
        )
        
        return {
            "status": "success",
            "workflow": workflow
        }
    except Exception as e:
        logger.error(f"Multi-phase workflow generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resources/generate")
async def generate_resource_workflow(request: GenerateResourceWorkflowRequest):
    """Generate workflow for resource discovery and integration"""
    try:
        from app.modules.dynamic_workflow_generator import get_dynamic_workflow_generator
        
        generator = get_dynamic_workflow_generator()
        workflow = generator.generate_resource_integration_workflow(
            topic=request.topic,
            user_id=request.user_id
        )
        
        return {
            "status": "success",
            "workflow": workflow
        }
    except Exception as e:
        logger.error(f"Resource workflow generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assessment/generate")
async def generate_assessment_workflow(request: GenerateAssessmentWorkflowRequest):
    """Generate periodic assessment workflow"""
    try:
        from app.modules.dynamic_workflow_generator import get_dynamic_workflow_generator
        
        generator = get_dynamic_workflow_generator()
        workflow = generator.generate_assessment_workflow(
            user_id=request.user_id,
            learning_plan_id=request.learning_plan_id,
            frequency=request.frequency
        )
        
        return {
            "status": "success",
            "workflow": workflow
        }
    except Exception as e:
        logger.error(f"Assessment workflow generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/templates")
async def get_workflow_templates():
    """Get available workflow templates"""
    try:
        from app.modules.dynamic_workflow_generator import get_dynamic_workflow_generator
        
        generator = get_dynamic_workflow_generator()
        templates = list(generator.workflow_templates.keys())
        
        return {
            "status": "success",
            "templates": templates,
            "descriptions": {
                template_id: template["name"]
                for template_id, template in generator.workflow_templates.items()
            }
        }
    except Exception as e:
        logger.error(f"Get templates error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

