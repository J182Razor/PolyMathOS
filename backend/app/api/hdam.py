"""
HDAM API Endpoints
Provides REST API for the Enhanced Quantum Holographic HDAM system
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging
import os

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/hdam", tags=["HDAM"])

# Global HDAM instance
_hdam_instance = None

def get_hdam():
    """Get or create HDAM instance"""
    global _hdam_instance
    if _hdam_instance is None:
        from app.modules.hdam import initialize_hdam
        _hdam_instance = initialize_hdam(
            supabase_url=os.getenv("SUPABASE_URL"),
            supabase_key=os.getenv("SUPABASE_KEY"),
            enable_quantum=os.getenv("ENABLE_QUANTUM", "false").lower() == "true"
        )
    return _hdam_instance

# Request Models
class LearnRequest(BaseModel):
    facts: List[str] = Field(..., description="List of facts to learn")
    metadata: Optional[List[Dict[str, Any]]] = Field(None, description="Optional metadata for each fact")
    context: str = Field("general", description="Context/domain for learning")
    verbose: bool = Field(False, description="Verbose output")
    quantum_enhanced: bool = Field(False, description="Use quantum-enhanced storage")

class ReasonRequest(BaseModel):
    query: str = Field(..., description="Query string for reasoning")
    context: str = Field("general", description="Context/domain for reasoning")
    top_k: int = Field(5, description="Number of top results to return")
    quantum_assisted: bool = Field(False, description="Use quantum-assisted selection")
    reasoning_mode: str = Field("associative", description="Reasoning mode: associative, analytical, or creative")

class AnalogyRequest(BaseModel):
    a: str = Field(..., description="First term")
    b: str = Field(..., description="Second term")
    c: str = Field(..., description="Third term")
    context: str = Field("general", description="Context/domain")
    top_k: int = Field(5, description="Number of results")

class ExtrapolateRequest(BaseModel):
    base_concept: str = Field(..., description="Base concept to extrapolate from")
    direction_from: str = Field(..., description="Starting direction concept")
    direction_to: str = Field(..., description="Ending direction concept")
    steps: int = Field(3, description="Number of extrapolation steps")
    step_size: float = Field(0.5, description="Step size for extrapolation")
    context: str = Field("general", description="Context/domain")

class OptimizePathRequest(BaseModel):
    goals: List[str] = Field(..., description="Learning goals")
    context: str = Field("general", description="Context/domain")
    max_items: int = Field(10, description="Maximum items in path")
    quantum_assisted: bool = Field(True, description="Use quantum-assisted optimization")

# Endpoints
@router.post("/learn")
async def learn(request: LearnRequest):
    """Learn facts with holographic encoding"""
    try:
        hdam = get_hdam()
        result = await hdam.learn(
            facts=request.facts,
            metadata=request.metadata,
            context=request.context,
            verbose=request.verbose,
            quantum_enhanced=request.quantum_enhanced
        )
        return result
    except Exception as e:
        logger.error(f"HDAM learn error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reason")
async def reason(request: ReasonRequest):
    """Perform reasoning with multiple modes"""
    try:
        hdam = get_hdam()
        result = await hdam.reason(
            query=request.query,
            context=request.context,
            top_k=request.top_k,
            quantum_assisted=request.quantum_assisted,
            reasoning_mode=request.reasoning_mode
        )
        return result
    except Exception as e:
        logger.error(f"HDAM reason error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analogy")
async def analogy(request: AnalogyRequest):
    """Perform analogical reasoning: a : b :: c : ?"""
    try:
        hdam = get_hdam()
        result = hdam.analogy(
            a=request.a,
            b=request.b,
            c=request.c,
            context=request.context,
            top_k=request.top_k
        )
        return result
    except Exception as e:
        logger.error(f"HDAM analogy error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extrapolate")
async def extrapolate(request: ExtrapolateRequest):
    """Perform conceptual extrapolation"""
    try:
        hdam = get_hdam()
        result = hdam.extrapolate(
            base_concept=request.base_concept,
            direction_from=request.direction_from,
            direction_to=request.direction_to,
            steps=request.steps,
            step_size=request.step_size,
            context=request.context
        )
        return result
    except Exception as e:
        logger.error(f"HDAM extrapolate error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize-path")
async def optimize_path(request: OptimizePathRequest):
    """Optimize learning path for maximum efficiency"""
    try:
        hdam = get_hdam()
        result = await hdam.optimize_learning_path(
            goals=request.goals,
            context=request.context,
            max_items=request.max_items,
            quantum_assisted=request.quantum_assisted
        )
        return result
    except Exception as e:
        logger.error(f"HDAM optimize-path error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_metrics():
    """Get HDAM memory metrics"""
    try:
        hdam = get_hdam()
        metrics = hdam.get_memory_metrics()
        return metrics
    except Exception as e:
        logger.error(f"HDAM metrics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


