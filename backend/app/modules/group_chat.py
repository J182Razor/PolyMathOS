"""
GroupChat Pattern
Collaborative multi-agent chat system for group discussions
"""

import os
import logging
import asyncio
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Try to import GroupChat
try:
    from swarms.structs.groupchat import GroupChat
    from swarms.structs.agent import Agent
    GROUP_CHAT_AVAILABLE = True
except ImportError:
    GROUP_CHAT_AVAILABLE = False
    logger.warning("GroupChat not available. Install: pip install swarms")
    GroupChat = None
    Agent = None


class GroupChatPattern:
    """
    GroupChat pattern implementation.
    Multiple agents collaborate in a group discussion format.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.available = GROUP_CHAT_AVAILABLE
        
        if not self.available:
            logger.warning("GroupChat not available")
            return
        
        logger.info("GroupChat pattern initialized")
    
    async def execute(
        self,
        task: str,
        pattern_config: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute GroupChat pattern.
        
        Args:
            task: Discussion topic/task
            pattern_config: Configuration (agents, max_loops, output_type, etc.)
            context: Additional context
        
        Returns:
            Discussion results
        """
        if not self.available:
            return {
                "status": "error",
                "message": "GroupChat not available"
            }
        
        try:
            # Create agents from configuration
            agents = []
            agent_configs = pattern_config.get("agents", [])
            
            for agent_config in agent_configs:
                agent = Agent(
                    agent_name=agent_config.get("name", "Agent"),
                    description=agent_config.get("description", ""),
                    model_name=agent_config.get("model_name", "gpt-4o-mini"),
                    max_loops=pattern_config.get("max_loops", 1),
                    autosave=pattern_config.get("autosave", False),
                    dashboard=pattern_config.get("dashboard", False),
                    verbose=pattern_config.get("verbose", True),
                    dynamic_temperature_enabled=pattern_config.get("dynamic_temperature_enabled", True),
                    user_name=pattern_config.get("user_name", "swarms_corp"),
                    retry_attempts=pattern_config.get("retry_attempts", 1),
                    context_length=pattern_config.get("context_length", 200000),
                    output_type=pattern_config.get("output_type", "string"),
                    streaming_on=pattern_config.get("streaming_on", False),
                    max_tokens=pattern_config.get("max_tokens", 15000)
                )
                agents.append(agent)
            
            # Create GroupChat
            chat = GroupChat(
                name=pattern_config.get("chat_name", "Group Discussion"),
                description=pattern_config.get("description", "Multi-agent collaborative discussion"),
                agents=agents,
                max_loops=pattern_config.get("max_loops", 1),
                output_type=pattern_config.get("output_type", "all")
            )
            
            # Execute
            history = await asyncio.to_thread(chat.run, task)
            
            return {
                "status": "success",
                "task": task,
                "history": history if isinstance(history, dict) else {"messages": str(history)},
                "agents_participated": len(agents)
            }
        except Exception as e:
            logger.error(f"GroupChat execution failed: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    @property
    def description(self) -> str:
        return "Collaborative multi-agent chat system for group discussions"
    
    @property
    def capabilities(self) -> List[str]:
        return [
            "multi_agent_discussion",
            "collaborative_problem_solving",
            "conversation_history",
            "turn_based_interaction"
        ]

