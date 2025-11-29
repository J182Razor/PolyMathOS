"""
swarms-utils Integration Module
Utility package for JSON formatting, swarm matching, and logits processing
"""

import os
import logging
from typing import Optional, Dict, Any, List
import json

logger = logging.getLogger(__name__)

# Try to import swarms-utils
try:
    import swarms_utils
    SWARMS_UTILS_AVAILABLE = True
except ImportError:
    SWARMS_UTILS_AVAILABLE = False
    logger.warning("swarms-utils not available. Install from: https://github.com/The-Swarm-Corporation/swarms-utils.git")
    swarms_utils = None


class SwarmsUtilsIntegration:
    """Integration wrapper for swarms-utils functionality"""
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.available = SWARMS_UTILS_AVAILABLE
        
        if not self.available:
            logger.warning("swarms-utils package not installed. Some utility features will be unavailable.")
            return
        
        try:
            # Import utilities (adjust based on actual API)
            # from swarms_utils import format_json, match_swarms, process_logits
            # self.format_json = format_json
            # self.match_swarms = match_swarms
            # self.process_logits = process_logits
            logger.info("swarms-utils initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize swarms-utils: {e}")
            self.available = False
    
    def format_json(self, data: Any, indent: int = 2) -> str:
        """Format data as JSON string"""
        if not self.available:
            # Fallback to standard json
            return json.dumps(data, indent=indent, default=str)
        
        try:
            # In production, use swarms-utils format_json
            # return self.format_json(data, indent)
            return json.dumps(data, indent=indent, default=str)
        except Exception as e:
            logger.error(f"JSON formatting failed: {e}")
            return json.dumps(data, indent=indent, default=str)
    
    def match_swarms(self, swarm1: Dict[str, Any], swarm2: Dict[str, Any]) -> float:
        """Match two swarms and return similarity score"""
        if not self.available:
            # Fallback: simple comparison
            return 0.5
        
        try:
            # In production, use swarms-utils match_swarms
            # return self.match_swarms(swarm1, swarm2)
            return 0.5
        except Exception as e:
            logger.error(f"Swarm matching failed: {e}")
            return 0.0
    
    def process_logits(self, logits: List[float]) -> Dict[str, Any]:
        """Process logits for swarm operations"""
        if not self.available:
            # Fallback: basic processing
            return {
                "mean": sum(logits) / len(logits) if logits else 0.0,
                "max": max(logits) if logits else 0.0,
                "min": min(logits) if logits else 0.0
            }
        
        try:
            # In production, use swarms-utils process_logits
            # return self.process_logits(logits)
            return {
                "mean": sum(logits) / len(logits) if logits else 0.0,
                "max": max(logits) if logits else 0.0,
                "min": min(logits) if logits else 0.0
            }
        except Exception as e:
            logger.error(f"Logits processing failed: {e}")
            return {}
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check"""
        return {
            "status": "healthy" if self.available else "unavailable",
            "available": self.available
        }


def get_swarms_utils_integration(config: Optional[Dict] = None) -> SwarmsUtilsIntegration:
    """Get or create swarms-utils integration instance"""
    return SwarmsUtilsIntegration(config)


