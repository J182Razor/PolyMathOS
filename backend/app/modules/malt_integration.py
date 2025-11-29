"""
MALT (Multi-Agent Learning Tree) Integration
Preset agent system for problem-solving
"""

import os
import logging
import json
import asyncio
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Try to import MALT
try:
    from swarms.structs.malt import MALT
    MALT_AVAILABLE = True
except ImportError:
    MALT_AVAILABLE = False
    logger.warning("MALT not available. Install: pip install swarms")
    MALT = None


class MALTIntegration:
    """
    MALT (Multi-Agent Learning Tree) integration.
    Preset agent system for collaborative problem-solving.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.available = MALT_AVAILABLE
        self.malt = None
        
        if not self.available:
            logger.warning("MALT not available")
            return
        
        try:
            self.malt = MALT(
                max_loops=self.config.get("max_loops", 1),
                preset_agents=self.config.get("preset_agents", True)
            )
            logger.info("MALT integration initialized")
        except Exception as e:
            logger.error(f"Failed to initialize MALT: {e}")
            self.available = False
    
    async def execute(
        self,
        task: str,
        pattern_config: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute MALT pattern.
        
        Args:
            task: Task/problem to solve
            pattern_config: Configuration
            context: Additional context
        
        Returns:
            Execution results
        """
        if not self.available or not self.malt:
            return {
                "status": "error",
                "message": "MALT not available"
            }
        
        try:
            # Execute MALT
            result = await asyncio.to_thread(self.malt.run, task)
            
            # Get conversation history
            conversation = {}
            if hasattr(self.malt, "conversation"):
                conversation = self.malt.conversation.return_messages_as_dictionary()
            
            return {
                "status": "success",
                "task": task,
                "result": str(result) if result else "No result",
                "conversation": conversation
            }
        except Exception as e:
            logger.error(f"MALT execution failed: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    @property
    def description(self) -> str:
        return "Multi-Agent Learning Tree for collaborative problem-solving"
    
    @property
    def capabilities(self) -> List[str]:
        return [
            "preset_agent_system",
            "collaborative_problem_solving",
            "conversation_tracking"
        ]

