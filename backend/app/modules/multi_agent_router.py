"""
MultiAgentRouter Pattern
Intelligent agent selection and routing based on task requirements
"""

import os
import logging
import asyncio
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Try to import MultiAgentRouter
try:
    from swarms.structs.multi_agent_router import MultiAgentRouter
    from swarms.structs.agent import Agent
    MULTI_AGENT_ROUTER_AVAILABLE = True
except ImportError:
    MULTI_AGENT_ROUTER_AVAILABLE = False
    logger.warning("MultiAgentRouter not available. Install: pip install swarms")
    MultiAgentRouter = None
    Agent = None


class MultiAgentRouterPattern:
    """
    MultiAgentRouter pattern implementation.
    Intelligent routing system that selects appropriate agents for tasks.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.available = MULTI_AGENT_ROUTER_AVAILABLE
        
        if not self.available:
            logger.warning("MultiAgentRouter not available")
            return
        
        logger.info("MultiAgentRouter pattern initialized")
    
    async def execute(
        self,
        task: str,
        pattern_config: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute MultiAgentRouter pattern.
        
        Args:
            task: Task to route to appropriate agents
            pattern_config: Configuration (agents, temperature, model, etc.)
            context: Additional context
        
        Returns:
            Routing and execution results
        """
        if not self.available:
            return {
                "status": "error",
                "message": "MultiAgentRouter not available"
            }
        
        try:
            # Create agents from configuration
            agents = []
            agent_configs = pattern_config.get("agents", [])
            
            for agent_config in agent_configs:
                agent = Agent(
                    agent_name=agent_config.get("name", "Agent"),
                    agent_description=agent_config.get("description", ""),
                    system_prompt=agent_config.get("system_prompt", ""),
                    model_name=agent_config.get("model_name", "gpt-4o")
                )
                agents.append(agent)
            
            # Create router
            router = MultiAgentRouter(
                agents=agents,
                temperature=pattern_config.get("temperature", 0.5),
                model=pattern_config.get("model", "claude-sonnet-4-20250514")
            )
            
            # Execute
            result = await asyncio.to_thread(router.run, task)
            
            return {
                "status": "success",
                "task": task,
                "result": str(result) if result else "No result",
                "agents_available": len(agents),
                "routing_strategy": "intelligent_selection"
            }
        except Exception as e:
            logger.error(f"MultiAgentRouter execution failed: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    @property
    def description(self) -> str:
        return "Intelligent agent selection and routing system"
    
    @property
    def capabilities(self) -> List[str]:
        return [
            "intelligent_routing",
            "agent_selection",
            "task_delegation",
            "dynamic_agent_assignment"
        ]

