"""
Database API Endpoints
Provides REST API for OmniDB operations (proxy endpoints)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/database", tags=["Database"])

# Request Models
class OmniDBQueryRequest(BaseModel):
    query: str = Field(..., description="Query string (SQL, NoSQL, or file operation)")
    query_type: str = Field("sql", description="Type of query: sql, nosql, file")
    params: Optional[Dict[str, Any]] = Field(None, description="Optional query parameters")

class StoreFileRequest(BaseModel):
    file_path: str = Field(..., description="Path/key for the file")
    content: str = Field(..., description="File content as base64 string")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Optional file metadata")

# Endpoints
@router.post("/omnidb/query")
async def query_omnidb(request: OmniDBQueryRequest):
    """Execute a query on OmniDB"""
    try:
        from app.modules.omnidb_integration import get_omnidb_integration
        import base64
        
        omnidb = get_omnidb_integration()
        
        # Decode content if it's base64
        if request.query_type == "file" and request.params:
            if "content" in request.params and isinstance(request.params["content"], str):
                try:
                    request.params["content"] = base64.b64decode(request.params["content"])
                except Exception:
                    pass  # Keep as is if not base64
        
        result = await omnidb.query(request.query, request.query_type, request.params)
        
        return result
    except Exception as e:
        logger.error(f"OmniDB query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/omnidb/store-file")
async def store_file(request: StoreFileRequest):
    """Store a file in OmniDB"""
    try:
        from app.modules.omnidb_integration import get_omnidb_integration
        import base64
        
        omnidb = get_omnidb_integration()
        
        # Decode base64 content
        try:
            content_bytes = base64.b64decode(request.content)
        except Exception:
            content_bytes = request.content.encode('utf-8')
        
        result = await omnidb.store_file(request.file_path, content_bytes, request.metadata)
        
        return result
    except Exception as e:
        logger.error(f"OmniDB file storage error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/omnidb/status")
async def get_omnidb_status():
    """Get OmniDB service status"""
    try:
        from app.modules.omnidb_integration import get_omnidb_integration
        
        omnidb = get_omnidb_integration()
        health = await omnidb.health_check()
        
        return health
    except Exception as e:
        logger.error(f"Get OmniDB status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
