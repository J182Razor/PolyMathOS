"""
Swarms API Endpoints
Provides REST API for MonteCarloSwarm, Education Swarm, and custom swarm management
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Callable
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/swarms", tags=["Swarms"])

# Request Models
class MonteCarloRunRequest(BaseModel):
    task: str = Field(..., description="Task for the swarm to execute")
    parallel: bool = Field(False, description="Run agents in parallel")
    aggregator: str = Field("default", description="Result aggregator: default, average, most_common, weighted_vote, consensus")

class EducationSwarmRequest(BaseModel):
    subjects: str = Field(..., description="Subjects to learn")
    learning_style: str = Field("Visual", description="Learning style: Visual, Auditory, Kinesthetic, Reading/Writing")
    challenge_level: str = Field("Moderate", description="Challenge level: Easy, Moderate, Hard")
    initial_task: Optional[str] = Field(None, description="Optional initial task/query")

class CustomSwarmCreateRequest(BaseModel):
    name: str = Field(..., description="Swarm name")
    description: str = Field(..., description="Swarm description")
    spec: Dict[str, Any] = Field(..., description="Swarm specification")

# Endpoints
@router.post("/monte-carlo/run")
async def run_monte_carlo(request: MonteCarloRunRequest):
    """Run MonteCarloSwarm with given task"""
    try:
        from app.modules.monte_carlo_swarm import (
            MonteCarloSwarm,
            average_aggregator,
            aggregate_most_common_result,
            aggregate_consensus
        )
        from app.modules.swarms_agentic_system import agentic_system
        
        # Get agents from agentic system
        # For now, create simple agents - in production, use agentic_system
        from swarms import Agent
        agents = [
            Agent(agent_name=f"Agent-{i}", system_prompt="You are a helpful assistant.")
            for i in range(3)
        ]
        
        # Select aggregator
        aggregator_map = {
            "default": MonteCarloSwarm.default_aggregator,
            "average": average_aggregator,
            "most_common": aggregate_most_common_result,
            "consensus": aggregate_consensus
        }
        aggregator = aggregator_map.get(request.aggregator, MonteCarloSwarm.default_aggregator)
        
        # Create and run swarm
        swarm = MonteCarloSwarm(
            agents=agents,
            parallel=request.parallel,
            result_aggregator=aggregator
        )
        
        result = swarm.run(request.task)
        
        return {
            "status": "success",
            "result": result,
            "parallel": request.parallel,
            "aggregator": request.aggregator
        }
    except Exception as e:
        logger.error(f"MonteCarloSwarm error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/education/generate")
async def generate_education(request: EducationSwarmRequest):
    """Generate education workflow using Education Swarm"""
    try:
        from app.modules.education_swarm import EducationSwarm
        
        swarm = EducationSwarm()
        
        user_preferences = {
            "subjects": request.subjects,
            "learning_style": request.learning_style,
            "challenge_level": request.challenge_level
        }
        
        result = swarm.run_workflow(user_preferences, request.initial_task)
        
        return result
    except Exception as e:
        logger.error(f"Education Swarm error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/custom/create")
async def create_custom_swarm(request: CustomSwarmCreateRequest):
    """Create a custom swarm from specification"""
    try:
        # Store custom swarm spec (in production, save to database)
        # For now, return success
        return {
            "status": "success",
            "swarm_id": f"custom_{request.name.lower().replace(' ', '_')}",
            "name": request.name,
            "description": request.description
        }
    except Exception as e:
        logger.error(f"Custom swarm creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/custom/list")
async def list_custom_swarms():
    """List all custom swarms"""
    try:
        # In production, fetch from database
        return {
            "status": "success",
            "swarms": []
        }
    except Exception as e:
        logger.error(f"List custom swarms error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


