"""
Research API Endpoints
Provides REST API for research operations (Research-Paper-Hive, AdvancedResearch)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/research", tags=["Research"])

# Request Models
class DiscoverPapersRequest(BaseModel):
    query: str = Field(..., description="Search query")
    max_results: int = Field(10, description="Maximum number of results")
    filters: Optional[Dict[str, Any]] = Field(None, description="Optional filters")

class EngagePaperRequest(BaseModel):
    paper_id: str = Field(..., description="Paper ID")
    action: str = Field("read", description="Action: read, cite, bookmark, etc.")

class OrchestrateResearchRequest(BaseModel):
    research_query: str = Field(..., description="Research query/question")
    max_workers: int = Field(5, description="Maximum number of worker agents")
    strategy: str = Field("comprehensive", description="Research strategy")

# Endpoints
@router.post("/papers/discover")
async def discover_papers(request: DiscoverPapersRequest):
    """Discover research papers using Research-Paper-Hive"""
    try:
        from app.modules.research_paper_hive_integration import get_research_paper_hive_integration
        
        hive = get_research_paper_hive_integration()
        papers = hive.discover_papers(
            query=request.query,
            max_results=request.max_results,
            filters=request.filters
        )
        
        return {
            "status": "success",
            "papers": papers,
            "count": len(papers)
        }
    except Exception as e:
        logger.error(f"Paper discovery error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/papers/engage")
async def engage_with_paper(request: EngagePaperRequest):
    """Engage with a research paper"""
    try:
        from app.modules.research_paper_hive_integration import get_research_paper_hive_integration
        
        hive = get_research_paper_hive_integration()
        result = hive.engage_with_paper(request.paper_id, request.action)
        
        return result
    except Exception as e:
        logger.error(f"Paper engagement error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/papers/{paper_id}")
async def get_paper_details(paper_id: str):
    """Get detailed information about a paper"""
    try:
        from app.modules.research_paper_hive_integration import get_research_paper_hive_integration
        
        hive = get_research_paper_hive_integration()
        details = hive.get_paper_details(paper_id)
        
        if details is None:
            raise HTTPException(status_code=404, detail="Paper not found")
        
        return {
            "status": "success",
            "paper": details
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get paper details error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/advanced/orchestrate")
async def orchestrate_research(request: OrchestrateResearchRequest):
    """Orchestrate research using AdvancedResearch"""
    try:
        from app.modules.advanced_research_integration import get_advanced_research_integration
        
        research = get_advanced_research_integration()
        result = await research.orchestrate_research(
            research_query=request.research_query,
            max_workers=request.max_workers,
            strategy=request.strategy
        )
        
        return result
    except Exception as e:
        logger.error(f"Research orchestration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/advanced/plan")
async def create_research_plan(query: str):
    """Create a research plan"""
    try:
        from app.modules.advanced_research_integration import get_advanced_research_integration
        
        research = get_advanced_research_integration()
        plan = research.create_research_plan(query)
        
        return plan
    except Exception as e:
        logger.error(f"Research plan creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


