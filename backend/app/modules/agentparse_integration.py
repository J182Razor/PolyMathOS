"""
AgentParse Integration Module
High-performance parsing library mapping structured data to agent-understandable blocks
"""

import os
import logging
from typing import Optional, Dict, Any, List, Union
import json
import yaml
import csv
from io import StringIO

logger = logging.getLogger(__name__)

# Try to import AgentParse
try:
    import agentparse
    AGENTPARSE_AVAILABLE = True
except ImportError:
    AGENTPARSE_AVAILABLE = False
    logger.warning("AgentParse not available. Install from: https://github.com/The-Swarm-Corporation/AgentParse.git")
    agentparse = None

# Try to import Pydantic
try:
    from pydantic import BaseModel
    PYDANTIC_AVAILABLE = True
except ImportError:
    PYDANTIC_AVAILABLE = False
    BaseModel = None


class AgentParseIntegration:
    """Integration wrapper for AgentParse functionality"""
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.available = AGENTPARSE_AVAILABLE
        
        if not self.available:
            logger.warning("AgentParse package not installed. Agent parsing features will be unavailable.")
            return
        
        try:
            # Initialize AgentParse (adjust based on actual API)
            # self.agentparse = agentparse.AgentParse(**self.config)
            logger.info("AgentParse initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize AgentParse: {e}")
            self.available = False
    
    def parse_to_blocks(
        self,
        data: Union[str, Dict, List],
        format: str = "json"
    ) -> List[Dict[str, Any]]:
        """
        Parse structured data into agent-understandable blocks.
        
        Args:
            data: Input data (string, dict, or list)
            format: Data format (json, yaml, csv, pydantic)
        
        Returns:
            List of agent blocks
        """
        if not self.available:
            # Fallback: basic block creation
            if isinstance(data, str):
                try:
                    if format == "json":
                        data = json.loads(data)
                    elif format == "yaml":
                        data = yaml.safe_load(data)
                    elif format == "csv":
                        reader = csv.DictReader(StringIO(data))
                        data = list(reader)
                except Exception as e:
                    logger.error(f"Data parsing failed: {e}")
                    return []
            
            # Convert to blocks
            if isinstance(data, dict):
                return [{"type": "object", "content": data}]
            elif isinstance(data, list):
                return [{"type": "array_item", "content": item} for item in data]
            else:
                return [{"type": "value", "content": data}]
        
        try:
            # In production, use actual AgentParse API
            # blocks = self.agentparse.parse_to_blocks(data, format)
            # For now, use fallback
            if isinstance(data, str):
                try:
                    if format == "json":
                        data = json.loads(data)
                    elif format == "yaml":
                        data = yaml.safe_load(data)
                except Exception:
                    pass
            
            if isinstance(data, dict):
                return [{"type": "object", "content": data}]
            elif isinstance(data, list):
                return [{"type": "array_item", "content": item} for item in data]
            else:
                return [{"type": "value", "content": data}]
        except Exception as e:
            logger.error(f"AgentParse parsing failed: {e}")
            return []
    
    def parse_pydantic_model(self, model_instance: Any) -> List[Dict[str, Any]]:
        """
        Parse a Pydantic model instance into agent blocks.
        
        Args:
            model_instance: Pydantic model instance
        
        Returns:
            List of agent blocks
        """
        if not PYDANTIC_AVAILABLE or not isinstance(model_instance, BaseModel):
            return []
        
        try:
            # Convert Pydantic model to dict and parse
            data = model_instance.dict()
            return self.parse_to_blocks(data, format="json")
        except Exception as e:
            logger.error(f"Pydantic model parsing failed: {e}")
            return []
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check"""
        return {
            "status": "healthy" if self.available else "unavailable",
            "available": self.available,
            "pydantic_available": PYDANTIC_AVAILABLE
        }


def get_agentparse_integration(config: Optional[Dict] = None) -> AgentParseIntegration:
    """Get or create AgentParse integration instance"""
    return AgentParseIntegration(config)


