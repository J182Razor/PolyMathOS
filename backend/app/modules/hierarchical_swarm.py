"""
HierarchicalSwarm Pattern
Director-agent pattern with LiteLLM for intelligent task delegation
"""

import os
import logging
import asyncio
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Try to import HierarchicalSwarm
try:
    from swarms.structs.hiearchical_swarm import HierarchicalSwarm, SwarmSpec
    from swarms.utils.litellm_wrapper import LiteLLM
    from swarms.structs.agent import Agent
    HIERARCHICAL_SWARM_AVAILABLE = True
except ImportError:
    HIERARCHICAL_SWARM_AVAILABLE = False
    logger.warning("HierarchicalSwarm not available. Install: pip install swarms")
    HierarchicalSwarm = None
    SwarmSpec = None
    LiteLLM = None


class HierarchicalSwarmPattern:
    """
    HierarchicalSwarm pattern implementation.
    Director agent orchestrates tasks among specialized worker agents.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.available = HIERARCHICAL_SWARM_AVAILABLE
        
        if not self.available:
            logger.warning("HierarchicalSwarm not available")
            return
        
        logger.info("HierarchicalSwarm pattern initialized")
    
    async def execute(
        self,
        task: str,
        pattern_config: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute HierarchicalSwarm pattern.
        
        Args:
            task: Task for director to orchestrate
            pattern_config: Configuration (director_prompt, agents, max_loops, etc.)
            context: Additional context
        
        Returns:
            Execution results
        """
        if not self.available:
            return {
                "status": "error",
                "message": "HierarchicalSwarm not available"
            }
        
        try:
            # Get director configuration
            director_prompt = pattern_config.get(
                "director_prompt",
                "As the Director of this Hierarchical Agent Swarm, coordinate and oversee all tasks."
            )
            model_name = pattern_config.get("model_name", "gpt-4.1")
            temperature = pattern_config.get("temperature", 0.5)
            max_loops = pattern_config.get("max_loops", 1)
            
            # Create director LLM
            director = LiteLLM(
                model_name=model_name,
                response_format=SwarmSpec,
                system_prompt=director_prompt,
                temperature=temperature,
                max_tokens=8196
            )
            
            # Create worker agents from configuration
            agents = []
            agent_configs = pattern_config.get("agents", [])
            
            for agent_config in agent_configs:
                agent = Agent(
                    agent_name=agent_config.get("name", "Agent"),
                    model_name=agent_config.get("model_name", "gpt-4.1"),
                    max_loops=agent_config.get("max_loops", 1),
                    interactive=agent_config.get("interactive", False),
                    streaming_on=agent_config.get("streaming_on", False),
                    system_prompt=agent_config.get("system_prompt", "")
                )
                agents.append(agent)
            
            # Create HierarchicalSwarm
            swarm = HierarchicalSwarm(
                description=pattern_config.get("description", "Hierarchical agent swarm"),
                director=director,
                agents=agents,
                max_loops=max_loops
            )
            
            # Execute
            result = await asyncio.to_thread(swarm.run, task)
            
            return {
                "status": "success",
                "task": task,
                "result": str(result) if result else "No result",
                "agents_used": len(agents),
                "max_loops": max_loops
            }
        except Exception as e:
            logger.error(f"HierarchicalSwarm execution failed: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    @property
    def description(self) -> str:
        return "Director-agent pattern for intelligent task orchestration"
    
    @property
    def capabilities(self) -> List[str]:
        return [
            "director_orchestration",
            "task_delegation",
            "intelligent_routing",
            "feedback_loops"
        ]

