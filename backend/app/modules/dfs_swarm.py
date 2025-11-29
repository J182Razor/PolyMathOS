"""
DFSSwarm Pattern
Depth-first search execution pattern for sequential agent processing
"""

import os
import logging
import asyncio
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Try to import Swarms Agent
try:
    from swarms import Agent
    SWARMS_AVAILABLE = True
except ImportError:
    SWARMS_AVAILABLE = False
    logger.warning("Swarms not available. Install: pip install swarms")
    Agent = None


class DFSSwarmPattern:
    """
    DFSSwarm pattern implementation.
    Depth-first search execution where agents process tasks sequentially,
    with each agent building on the previous agent's output.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.available = SWARMS_AVAILABLE
        
        if not self.available:
            logger.warning("DFSSwarm not available")
            return
        
        logger.info("DFSSwarm pattern initialized")
    
    def _dfs_execute(
        self,
        agents: List[Agent],
        agent_index: int,
        task: str,
        previous_output: Optional[str] = None
    ) -> str:
        """
        Recursive DFS execution through agents.
        
        Args:
            agents: List of agents
            agent_index: Current agent index
            task: Original task
            previous_output: Output from previous agent
        
        Returns:
            Final output
        """
        if agent_index >= len(agents):
            return previous_output or ""
        
        agent = agents[agent_index]
        
        # Combine task with previous output
        if previous_output:
            current_task = f"{task}\nPrevious result: {previous_output}"
        else:
            current_task = task
        
        # Execute current agent
        output = agent.run(current_task)
        
        # Recursively call next agent
        return self._dfs_execute(agents, agent_index + 1, task, output)
    
    async def execute(
        self,
        task: str,
        pattern_config: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute DFSSwarm pattern.
        
        Args:
            task: Task to execute
            pattern_config: Configuration (agents, model, etc.)
            context: Additional context
        
        Returns:
            Execution results
        """
        if not self.available:
            return {
                "status": "error",
                "message": "DFSSwarm not available"
            }
        
        try:
            # Create agents from configuration
            agents = []
            agent_configs = pattern_config.get("agents", [])
            
            # Get model configuration
            api_key = os.getenv("OPENAI_API_KEY")
            model_name = pattern_config.get("model_name", "gpt-4o-mini")
            
            for agent_config in agent_configs:
                agent = Agent(
                    agent_name=agent_config.get("name", "Agent"),
                    system_prompt=agent_config.get("system_prompt", ""),
                    model_name=model_name,
                    openai_api_key=api_key,
                    max_loops=pattern_config.get("max_loops", 1),
                    autosave=pattern_config.get("autosave", True),
                    verbose=pattern_config.get("verbose", True)
                )
                agents.append(agent)
            
            # Execute DFS
            result = await asyncio.to_thread(
                self._dfs_execute, agents, 0, task
            )
            
            return {
                "status": "success",
                "task": task,
                "result": result,
                "agents_used": len(agents),
                "execution_pattern": "depth_first_search"
            }
        except Exception as e:
            logger.error(f"DFSSwarm execution failed: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    @property
    def description(self) -> str:
        return "Depth-first search execution pattern for sequential agent processing"
    
    @property
    def capabilities(self) -> List[str]:
        return [
            "sequential_processing",
            "output_chaining",
            "depth_first_traversal"
        ]

