"""
Unified Agent Orchestration API
Provides endpoints for executing all agent patterns
"""

import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel

logger = logging.getLogger(__name__)

from app.modules.unified_agent_orchestrator import get_unified_orchestrator

router = APIRouter(prefix="/api/agents", tags=["unified-agents"])


class PatternExecutionRequest(BaseModel):
    """Request model for pattern execution"""
    pattern_type: str
    task: str
    pattern_config: Dict[str, Any] = {}
    context: Dict[str, Any] = {}


class PatternExecutionResponse(BaseModel):
    """Response model for pattern execution"""
    status: str
    execution_id: str
    pattern_type: str
    result: Dict[str, Any]
    execution_time: float
    timestamp: str


@router.post("/orchestrate", response_model=PatternExecutionResponse)
async def orchestrate_pattern(request: PatternExecutionRequest):
    """
    Execute any agent pattern through unified orchestrator.
    
    Pattern types:
    - advanced_research: Orchestrator-worker research
    - llamaindex_rag: RAG query with LlamaIndex
    - chromadb_memory: ChromaDB memory operations
    - agent_rearrange: Sequential agent flow
    - malt: Multi-Agent Learning Tree
    - hierarchical_swarm: Director-agent pattern
    - group_chat: Collaborative discussion
    - multi_agent_router: Intelligent routing
    - federated_swarm: Swarm of swarms
    - dfs_swarm: Depth-first execution
    - agent_matrix: Matrix execution
    """
    try:
        orchestrator = get_unified_orchestrator()
        result = await orchestrator.execute_pattern(
            request.pattern_type,
            request.pattern_config,
            request.task,
            request.context
        )
        
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result.get("message", "Execution failed"))
        
        return PatternExecutionResponse(**result)
    except Exception as e:
        logger.error(f"Pattern orchestration failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/advanced-research")
async def advanced_research(request: Dict[str, Any] = Body(...)):
    """Execute AdvancedResearch orchestration"""
    orchestrator = get_unified_orchestrator()
    result = await orchestrator.execute_pattern(
        "advanced_research",
        request.get("config", {}),
        request.get("query", ""),
        request.get("context", {})
    )
    return result


@router.post("/rag/query")
async def rag_query(request: Dict[str, Any] = Body(...)):
    """Execute LlamaIndex RAG query"""
    orchestrator = get_unified_orchestrator()
    result = await orchestrator.execute_pattern(
        "llamaindex_rag",
        request.get("config", {}),
        request.get("query", ""),
        request.get("context", {})
    )
    return result


@router.post("/memory/store")
async def store_memory(request: Dict[str, Any] = Body(...)):
    """Store content in ChromaDB memory"""
    orchestrator = get_unified_orchestrator()
    config = request.get("config", {})
    config["operation"] = "store"
    result = await orchestrator.execute_pattern(
        "chromadb_memory",
        config,
        request.get("content", ""),
        request.get("context", {})
    )
    return result


@router.post("/memory/query")
async def query_memory(request: Dict[str, Any] = Body(...)):
    """Query ChromaDB memory"""
    orchestrator = get_unified_orchestrator()
    config = request.get("config", {})
    config["operation"] = "query"
    result = await orchestrator.execute_pattern(
        "chromadb_memory",
        config,
        request.get("query", ""),
        request.get("context", {})
    )
    return result


@router.post("/patterns/{pattern_type}")
async def execute_pattern(pattern_type: str, request: Dict[str, Any] = Body(...)):
    """Execute a specific agent pattern"""
    orchestrator = get_unified_orchestrator()
    result = await orchestrator.execute_pattern(
        pattern_type,
        request.get("config", {}),
        request.get("task", ""),
        request.get("context", {})
    )
    return result


@router.get("/patterns")
async def list_patterns():
    """List all available agent patterns"""
    orchestrator = get_unified_orchestrator()
    patterns = orchestrator.list_available_patterns()
    return {
        "patterns": patterns,
        "total": len(patterns),
        "available": len([p for p in patterns if p["available"]])
    }


@router.get("/patterns/{pattern_type}/status")
async def get_pattern_status(pattern_type: str):
    """Get status of a specific pattern"""
    orchestrator = get_unified_orchestrator()
    status = orchestrator.get_pattern_status(pattern_type)
    return status


@router.get("/status")
async def get_orchestrator_status():
    """Get orchestrator health status"""
    orchestrator = get_unified_orchestrator()
    return orchestrator.health_check()

