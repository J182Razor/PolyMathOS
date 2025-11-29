"""
RAG API Endpoints
Provides REST API for RAG operations (AgentRAGProtocol, Multi-Agent-RAG)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/rag", tags=["RAG"])

# Request Models
class IndexDocumentsRequest(BaseModel):
    documents: List[str] = Field(..., description="List of document texts")
    metadata: Optional[List[Dict[str, Any]]] = Field(None, description="Optional metadata for each document")

class RAGQueryRequest(BaseModel):
    query: str = Field(..., description="Query string")
    top_k: int = Field(5, description="Number of results to return")
    filters: Optional[Dict[str, Any]] = Field(None, description="Optional filters")

class GetContextRequest(BaseModel):
    agent_query: str = Field(..., description="Agent's query")
    context_length: int = Field(2000, description="Maximum context length")

class ProcessDocumentsRequest(BaseModel):
    documents: List[str] = Field(..., description="List of document texts")
    analysis_type: str = Field("comprehensive", description="Type of analysis")

class GenerateInsightsRequest(BaseModel):
    documents: List[str] = Field(..., description="List of document texts")
    focus_areas: Optional[List[str]] = Field(None, description="Optional focus areas")

# Endpoints
@router.post("/agent/index")
async def index_documents(request: IndexDocumentsRequest):
    """Index documents for RAG retrieval using AgentRAGProtocol"""
    try:
        from app.modules.agent_rag_protocol_integration import get_agent_rag_protocol_integration
        
        rag = get_agent_rag_protocol_integration()
        result = rag.index_documents(request.documents, request.metadata)
        
        return result
    except Exception as e:
        logger.error(f"RAG indexing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/agent/query")
async def query_rag(request: RAGQueryRequest):
    """Query RAG system using AgentRAGProtocol"""
    try:
        from app.modules.agent_rag_protocol_integration import get_agent_rag_protocol_integration
        
        rag = get_agent_rag_protocol_integration()
        results = rag.query(request.query, request.top_k, request.filters)
        
        return {
            "status": "success",
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        logger.error(f"RAG query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/agent/context")
async def get_context(request: GetContextRequest):
    """Get RAG context for an agent"""
    try:
        from app.modules.agent_rag_protocol_integration import get_agent_rag_protocol_integration
        
        rag = get_agent_rag_protocol_integration()
        context = rag.get_context_for_agent(request.agent_query, request.context_length)
        
        return {
            "status": "success",
            "context": context,
            "length": len(context)
        }
    except Exception as e:
        logger.error(f"Get context error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/multi-agent/process")
async def process_documents(request: ProcessDocumentsRequest):
    """Process documents using Multi-Agent-RAG"""
    try:
        from app.modules.multi_agent_rag_integration import get_multi_agent_rag_integration
        
        multi_rag = get_multi_agent_rag_integration()
        result = multi_rag.process_documents(request.documents, request.analysis_type)
        
        return result
    except Exception as e:
        logger.error(f"Multi-agent RAG processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/multi-agent/insights")
async def generate_insights(request: GenerateInsightsRequest):
    """Generate insights using Multi-Agent-RAG"""
    try:
        from app.modules.multi_agent_rag_integration import get_multi_agent_rag_integration
        
        multi_rag = get_multi_agent_rag_integration()
        insights = multi_rag.generate_insights(request.documents, request.focus_areas)
        
        return {
            "status": "success",
            "insights": insights,
            "count": len(insights)
        }
    except Exception as e:
        logger.error(f"Insight generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


