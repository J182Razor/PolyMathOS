"""
AdvancedResearch Orchestrator
Full implementation of orchestrator-worker pattern from Anthropic's multi-agent research system
Reference: https://github.com/The-Swarm-Corporation/AdvancedResearch.git
"""

import os
import logging
import asyncio
from typing import Dict, Any, List, Optional
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

# Try to import AdvancedResearch
try:
    from advanced_research import AdvancedResearch
    ADVANCED_RESEARCH_AVAILABLE = True
except ImportError:
    ADVANCED_RESEARCH_AVAILABLE = False
    logger.warning("AdvancedResearch not available. Install: pip install advanced-research")
    AdvancedResearch = None

# Try to import Exa for web search
try:
    from exa_py import Exa
    EXA_AVAILABLE = True
except ImportError:
    EXA_AVAILABLE = False
    logger.warning("Exa not available. Install: pip install exa-py")
    Exa = None


class AdvancedResearchOrchestrator:
    """
    AdvancedResearch orchestrator-worker pattern implementation.
    Director agent coordinates research strategy while worker agents execute parallel searches.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.available = ADVANCED_RESEARCH_AVAILABLE and EXA_AVAILABLE
        self.research_system = None
        
        if not self.available:
            logger.warning("AdvancedResearch not fully available")
            return
        
        try:
            # Get API keys
            exa_api_key = os.getenv("EXA_API_KEY") or self.config.get("exa_api_key")
            anthropic_api_key = os.getenv("ANTHROPIC_API_KEY") or self.config.get("anthropic_api_key")
            openai_api_key = os.getenv("OPENAI_API_KEY") or self.config.get("openai_api_key")
            
            # Initialize AdvancedResearch
            self.research_system = AdvancedResearch(
                exa_api_key=exa_api_key,
                anthropic_api_key=anthropic_api_key,
                openai_api_key=openai_api_key,
                **self.config
            )
            logger.info("AdvancedResearch orchestrator initialized")
        except Exception as e:
            logger.error(f"Failed to initialize AdvancedResearch: {e}")
            self.available = False
    
    async def execute(
        self,
        task: str,
        pattern_config: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute AdvancedResearch orchestration.
        
        Args:
            task: Research query/question
            pattern_config: Configuration (max_workers, strategy, etc.)
            context: Additional context (user_id, learning_plan_id, etc.)
        
        Returns:
            Research results
        """
        if not self.available or not self.research_system:
            return {
                "status": "error",
                "message": "AdvancedResearch not available"
            }
        
        try:
            # Extract configuration
            max_workers = pattern_config.get("max_workers", 5)
            strategy = pattern_config.get("strategy", "comprehensive")
            export_results = pattern_config.get("export", False)
            
            # Run research orchestration
            result = await asyncio.to_thread(
                self.research_system.run,
                task,
                max_workers=max_workers,
                strategy=strategy,
                export=export_results
            )
            
            return {
                "status": "success",
                "query": task,
                "strategy": strategy,
                "workers_used": max_workers,
                "results": result if isinstance(result, dict) else {"output": str(result)},
                "summary": f"Research orchestration completed for: {task}"
            }
        except Exception as e:
            logger.error(f"AdvancedResearch execution failed: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    @property
    def description(self) -> str:
        return "Orchestrator-worker pattern for comprehensive research using parallel agent execution"
    
    @property
    def capabilities(self) -> List[str]:
        return [
            "parallel_web_search",
            "research_orchestration",
            "result_synthesis",
            "export_functionality"
        ]

