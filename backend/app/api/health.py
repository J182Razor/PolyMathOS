"""
Health Check API Endpoints
Provides comprehensive health check endpoints for all components
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/health", tags=["Health"])

@router.get("/")
async def health_check():
    """Overall system health check"""
    try:
        from app.core.integration_manager import get_integration_manager
        
        manager = get_integration_manager()
        health = manager.health_check()
        
        return health
    except Exception as e:
        logger.error(f"Health check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/components")
async def components_health():
    """Detailed health check for all components"""
    try:
        from app.core.integration_manager import get_integration_manager
        
        manager = get_integration_manager()
        health = manager.health_check()
        
        return {
            "status": "success",
            "components": health.get("components", {})
        }
    except Exception as e:
        logger.error(f"Components health check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/component/{component_name}")
async def component_health(component_name: str):
    """Health check for a specific component"""
    try:
        from app.core.integration_manager import get_integration_manager
        
        manager = get_integration_manager()
        health = manager.health_check()
        
        component_health = health.get("components", {}).get(component_name)
        
        if component_health is None:
            raise HTTPException(status_code=404, detail=f"Component {component_name} not found")
        
        return {
            "status": "success",
            "component": component_name,
            "health": component_health
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Component health check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

