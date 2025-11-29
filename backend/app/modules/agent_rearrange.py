"""
AgentRearrange Pattern
Sequential agent flow with RAG memory system integration
Based on the medical diagnosis example with LlamaIndexDB
"""

import os
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Try to import Swarms
try:
    from swarms import Agent, AgentRearrange
    from swarm_models import OpenAIChat
    SWARMS_AVAILABLE = True
except ImportError:
    SWARMS_AVAILABLE = False
    logger.warning("Swarms not available. Install: pip install swarms")
    Agent = None
    AgentRearrange = None

# Import LlamaIndex RAG
try:
    from .llamaindex_rag import LlamaIndexRAG
    LLAMAINDEX_AVAILABLE = True
except ImportError:
    LLAMAINDEX_AVAILABLE = False
    LlamaIndexRAG = None


class AgentRearrangePattern:
    """
    AgentRearrange pattern for sequential agent execution with RAG memory.
    Agents execute in a defined flow, each building on previous results.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.available = SWARMS_AVAILABLE
        
        if not self.available:
            logger.warning("AgentRearrange not available")
            return
        
        # Initialize RAG system if available
        self.rag_system = None
        if LLAMAINDEX_AVAILABLE:
            try:
                self.rag_system = LlamaIndexRAG(self.config)
            except Exception as e:
                logger.warning(f"RAG system initialization failed: {e}")
        
        logger.info("AgentRearrange pattern initialized")
    
    async def execute(
        self,
        task: str,
        pattern_config: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute AgentRearrange pattern with sequential agent flow.
        
        Args:
            task: Task to execute
            pattern_config: Configuration (agents, flow, memory_system, etc.)
            context: Additional context
        
        Returns:
            Execution results
        """
        if not self.available:
            return {
                "status": "error",
                "message": "AgentRearrange not available"
            }
        
        try:
            # Get model configuration
            api_key = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
            model_name = pattern_config.get("model_name", "llama-3.1-70b-versatile")
            api_base = pattern_config.get("api_base", "https://api.groq.com/openai/v1")
            
            # Create model
            model = OpenAIChat(
                openai_api_base=api_base,
                openai_api_key=api_key,
                model_name=model_name,
                temperature=pattern_config.get("temperature", 0.1)
            )
            
            # Create agents from configuration
            agents = []
            agent_configs = pattern_config.get("agents", [])
            
            for agent_config in agent_configs:
                agent = Agent(
                    agent_name=agent_config.get("name", "Agent"),
                    system_prompt=agent_config.get("system_prompt", ""),
                    llm=model,
                    max_loops=pattern_config.get("max_loops", 1),
                    autosave=pattern_config.get("autosave", True),
                    verbose=pattern_config.get("verbose", True),
                    context_length=pattern_config.get("context_length", 200000)
                )
                agents.append(agent)
            
            # Create flow string
            flow = pattern_config.get("flow")
            if not flow and agents:
                # Auto-generate flow from agent names
                flow = " -> ".join([agent.agent_name for agent in agents])
            
            # Create AgentRearrange router
            router = AgentRearrange(
                name=pattern_config.get("swarm_name", "agent-rearrange-swarm"),
                description=pattern_config.get("description", "Sequential agent flow"),
                max_loops=pattern_config.get("max_loops", 1),
                agents=agents,
                memory_system=self.rag_system if self.rag_system and self.rag_system.available else None,
                flow=flow
            )
            
            # Execute
            result = router.run(task)
            
            return {
                "status": "success",
                "task": task,
                "flow": flow,
                "agents_used": len(agents),
                "result": str(result) if result else "No result",
                "conversation_history": getattr(router, "conversation", {}).return_messages_as_dictionary() if hasattr(router, "conversation") else {}
            }
        except Exception as e:
            logger.error(f"AgentRearrange execution failed: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    @property
    def description(self) -> str:
        return "Sequential agent flow with RAG memory integration"
    
    @property
    def capabilities(self) -> List[str]:
        return [
            "sequential_agent_execution",
            "rag_memory_integration",
            "custom_agent_flows",
            "conversation_tracking"
        ]

