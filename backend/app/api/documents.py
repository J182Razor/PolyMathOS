"""
Documents API Endpoints
Provides REST API for document processing (doc-master, OmniParse, AgentParse)
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging
import tempfile
import os

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["Documents"])

# Request Models
class ParseRequest(BaseModel):
    content: str = Field(..., description="Document content to parse")
    document_type: Optional[str] = Field(None, description="Optional document type hint")

class AgentParseRequest(BaseModel):
    data: Any = Field(..., description="Data to parse (string, dict, or list)")
    format: str = Field("json", description="Data format: json, yaml, csv, pydantic")

# Endpoints
@router.post("/read")
async def read_document(file: UploadFile = File(...)):
    """Read a file using doc-master"""
    try:
        from app.modules.doc_master_integration import get_doc_master_integration
        
        doc_master = get_doc_master_integration()
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        try:
            # Read file
            result = doc_master.read_file(tmp_path)
            
            return {
                "status": "success",
                "filename": file.filename,
                "content": result,
                "content_type": file.content_type
            }
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except Exception as e:
        logger.error(f"Document read error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/parse")
async def parse_document(request: ParseRequest):
    """Parse document using OmniParse"""
    try:
        from app.modules.omniparse_integration import get_omniparse_integration
        
        omniparse = get_omniparse_integration()
        result = omniparse.parse_document(request.content, request.document_type)
        
        if result is None:
            raise HTTPException(status_code=500, detail="Parsing failed")
        
        return {
            "status": "success",
            "result": result
        }
    except Exception as e:
        logger.error(f"Document parse error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/parse/agent")
async def parse_for_agent(request: AgentParseRequest):
    """Parse structured data for agent consumption using AgentParse"""
    try:
        from app.modules.agentparse_integration import get_agentparse_integration
        
        agentparse = get_agentparse_integration()
        blocks = agentparse.parse_to_blocks(request.data, request.format)
        
        return {
            "status": "success",
            "blocks": blocks,
            "block_count": len(blocks)
        }
    except Exception as e:
        logger.error(f"Agent parse error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/formats")
async def get_supported_formats():
    """Get list of supported file formats"""
    try:
        from app.modules.doc_master_integration import get_doc_master_integration
        
        doc_master = get_doc_master_integration()
        formats = doc_master.get_supported_formats()
        
        return {
            "status": "success",
            "formats": formats
        }
    except Exception as e:
        logger.error(f"Get formats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


