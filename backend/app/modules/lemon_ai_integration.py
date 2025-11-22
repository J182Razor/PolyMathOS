"""
Lemon AI Integration for Self-Evolving Agents in PolyMathOS
Integrates Lemon AI framework for agent evolution and self-improvement
"""

import os
import json
import subprocess
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Check if Lemon AI is available
LEMON_AI_AVAILABLE = False
try:
    # Try to import or check if lemonai is installed
    result = subprocess.run(['which', 'lemonai'], capture_output=True, text=True)
    if result.returncode == 0:
        LEMON_AI_AVAILABLE = True
except:
    pass

# Also check if it's in the environment
if os.getenv('LEMON_AI_PATH') or os.path.exists('/app/lemonai') or os.path.exists('./lemonai'):
    LEMON_AI_AVAILABLE = True

class LemonAIIntegration:
    """
    Integration with Lemon AI for self-evolving agents
    Reference: https://github.com/hexdocom/lemonai
    """
    
    def __init__(self, workspace_path: str = "./workspace", data_path: str = "./data"):
        self.workspace_path = Path(workspace_path)
        self.data_path = Path(data_path)
        self.workspace_path.mkdir(parents=True, exist_ok=True)
        self.data_path.mkdir(parents=True, exist_ok=True)
        
        self.agent_evolution_history: Dict[str, List[Dict]] = {}
        self.agent_performance_tracking: Dict[str, Dict] = {}
        
        logger.info(f"Lemon AI Integration initialized (Available: {LEMON_AI_AVAILABLE})")
    
    def create_self_evolving_agent(
        self,
        agent_id: str,
        agent_type: str,
        initial_prompt: str,
        goals: List[str],
        tools: Optional[List[str]] = None
    ) -> Dict:
        """
        Create a self-evolving agent using Lemon AI framework
        
        Args:
            agent_id: Unique identifier for the agent
            agent_type: Type of agent (knowledge_engineer, research_analyst, etc.)
            initial_prompt: Initial system prompt
            goals: List of goals for the agent
            tools: Optional list of tools the agent can use
        
        Returns:
            Agent configuration dictionary
        """
        agent_config = {
            "agent_id": agent_id,
            "agent_type": agent_type,
            "initial_prompt": initial_prompt,
            "goals": goals,
            "tools": tools or [],
            "created_at": datetime.now().isoformat(),
            "evolution_history": [],
            "performance_metrics": {
                "tasks_completed": 0,
                "success_rate": 0.0,
                "avg_quality_score": 0.0,
                "improvements_made": 0
            },
            "current_version": 1,
            "lemon_ai_enabled": LEMON_AI_AVAILABLE
        }
        
        # Save agent configuration
        agent_file = self.workspace_path / f"agents/{agent_id}.json"
        agent_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(agent_file, 'w') as f:
            json.dump(agent_config, f, indent=2)
        
        # Initialize evolution history
        self.agent_evolution_history[agent_id] = []
        self.agent_performance_tracking[agent_id] = {
            "tasks": [],
            "improvements": [],
            "version_history": []
        }
        
        logger.info(f"Created self-evolving agent: {agent_id}")
        
        return agent_config
    
    def evolve_agent(
        self,
        agent_id: str,
        task_results: Dict,
        performance_feedback: Dict
    ) -> Dict:
        """
        Evolve an agent based on performance feedback
        
        Args:
            agent_id: Agent identifier
            task_results: Results from agent's task execution
            performance_feedback: Performance metrics and feedback
        
        Returns:
            Evolution result with updated agent configuration
        """
        if agent_id not in self.agent_evolution_history:
            raise ValueError(f"Agent {agent_id} not found")
        
        # Load current agent config
        agent_file = self.workspace_path / f"agents/{agent_id}.json"
        if not agent_file.exists():
            raise ValueError(f"Agent config file not found: {agent_file}")
        
        with open(agent_file, 'r') as f:
            agent_config = json.load(f)
        
        # Analyze performance
        quality_score = performance_feedback.get("quality_score", 0.0)
        success = performance_feedback.get("success", False)
        feedback_text = performance_feedback.get("feedback", "")
        
        # Record performance
        self.agent_performance_tracking[agent_id]["tasks"].append({
            "timestamp": datetime.now().isoformat(),
            "task_results": task_results,
            "performance": performance_feedback
        })
        
        # Determine if evolution is needed
        should_evolve = False
        evolution_reason = ""
        
        if not success:
            should_evolve = True
            evolution_reason = "Task failure - need improvement"
        elif quality_score < 0.7:
            should_evolve = True
            evolution_reason = "Low quality score - optimization needed"
        elif len(self.agent_evolution_history[agent_id]) == 0:
            should_evolve = True
            evolution_reason = "Initial evolution"
        
        evolution_result = {
            "agent_id": agent_id,
            "evolved": should_evolve,
            "reason": evolution_reason,
            "previous_version": agent_config["current_version"],
            "new_version": agent_config["current_version"],
            "improvements": []
        }
        
        if should_evolve:
            # Generate evolution improvements
            improvements = self._generate_evolution_improvements(
                agent_config, task_results, performance_feedback
            )
            
            # Apply improvements
            agent_config["current_version"] += 1
            agent_config["evolution_history"].append({
                "version": agent_config["current_version"],
                "timestamp": datetime.now().isoformat(),
                "reason": evolution_reason,
                "improvements": improvements,
                "performance_before": {
                    "quality_score": quality_score,
                    "success_rate": agent_config["performance_metrics"]["success_rate"]
                }
            })
            
            # Update agent prompt/configuration based on improvements
            if improvements:
                agent_config = self._apply_improvements(agent_config, improvements)
            
            # Save updated config
            with open(agent_file, 'w') as f:
                json.dump(agent_config, f, indent=2)
            
            evolution_result["new_version"] = agent_config["current_version"]
            evolution_result["improvements"] = improvements
            
            # Record evolution
            self.agent_evolution_history[agent_id].append(evolution_result)
            self.agent_performance_tracking[agent_id]["improvements"].append(improvements)
            self.agent_performance_tracking[agent_id]["version_history"].append({
                "version": agent_config["current_version"],
                "timestamp": datetime.now().isoformat(),
                "improvements": improvements
            })
            
            logger.info(f"Agent {agent_id} evolved to version {agent_config['current_version']}")
        
        return evolution_result
    
    def _generate_evolution_improvements(
        self,
        agent_config: Dict,
        task_results: Dict,
        performance_feedback: Dict
    ) -> List[Dict]:
        """Generate specific improvements for agent evolution"""
        improvements = []
        
        # Analyze failure points
        if not performance_feedback.get("success", True):
            improvements.append({
                "type": "error_handling",
                "description": "Improve error handling and recovery",
                "priority": "high"
            })
        
        # Quality improvements
        quality_score = performance_feedback.get("quality_score", 0.0)
        if quality_score < 0.7:
            improvements.append({
                "type": "quality_enhancement",
                "description": "Enhance output quality and accuracy",
                "priority": "high"
            })
        
        # Tool usage improvements
        if task_results.get("tool_errors"):
            improvements.append({
                "type": "tool_optimization",
                "description": "Optimize tool usage and selection",
                "priority": "medium"
            })
        
        # Prompt refinement
        improvements.append({
            "type": "prompt_refinement",
            "description": "Refine system prompt based on task patterns",
            "priority": "medium"
        })
        
        # Learning from successful patterns
        if task_results.get("successful_patterns"):
            improvements.append({
                "type": "pattern_learning",
                "description": "Incorporate successful patterns into agent behavior",
                "priority": "low"
            })
        
        return improvements
    
    def _apply_improvements(self, agent_config: Dict, improvements: List[Dict]) -> Dict:
        """Apply improvements to agent configuration"""
        # Update prompt based on improvements
        prompt_updates = []
        for improvement in improvements:
            if improvement["type"] == "prompt_refinement":
                prompt_updates.append(f"Enhanced: {improvement['description']}")
            elif improvement["type"] == "error_handling":
                prompt_updates.append("Improved error handling and recovery mechanisms")
            elif improvement["type"] == "quality_enhancement":
                prompt_updates.append("Enhanced focus on quality and accuracy")
        
        if prompt_updates:
            # Append improvements to prompt
            agent_config["initial_prompt"] += "\n\nRecent Improvements:\n" + "\n".join(f"- {update}" for update in prompt_updates)
        
        # Update performance metrics
        agent_config["performance_metrics"]["improvements_made"] += len(improvements)
        
        return agent_config
    
    def get_agent_evolution_history(self, agent_id: str) -> Dict:
        """Get evolution history for an agent"""
        if agent_id not in self.agent_evolution_history:
            return {"error": "Agent not found"}
        
        return {
            "agent_id": agent_id,
            "evolution_history": self.agent_evolution_history[agent_id],
            "performance_tracking": self.agent_performance_tracking.get(agent_id, {}),
            "total_evolutions": len(self.agent_evolution_history[agent_id])
        }
    
    def track_agent_performance(
        self,
        agent_id: str,
        task_id: str,
        success: bool,
        quality_score: float,
        execution_time: float,
        tokens_used: int = 0
    ):
        """Track agent performance for evolution"""
        if agent_id not in self.agent_performance_tracking:
            self.agent_performance_tracking[agent_id] = {
                "tasks": [],
                "improvements": [],
                "version_history": []
            }
        
        performance_record = {
            "task_id": task_id,
            "timestamp": datetime.now().isoformat(),
            "success": success,
            "quality_score": quality_score,
            "execution_time": execution_time,
            "tokens_used": tokens_used
        }
        
        self.agent_performance_tracking[agent_id]["tasks"].append(performance_record)
        
        # Update agent config metrics
        agent_file = self.workspace_path / f"agents/{agent_id}.json"
        if agent_file.exists():
            with open(agent_file, 'r') as f:
                agent_config = json.load(f)
            
            metrics = agent_config["performance_metrics"]
            metrics["tasks_completed"] += 1
            
            # Update success rate
            total_tasks = metrics["tasks_completed"]
            current_success_rate = metrics.get("success_rate", 0.0)
            metrics["success_rate"] = ((current_success_rate * (total_tasks - 1)) + (1.0 if success else 0.0)) / total_tasks
            
            # Update average quality score
            current_avg_quality = metrics.get("avg_quality_score", 0.0)
            metrics["avg_quality_score"] = ((current_avg_quality * (total_tasks - 1)) + quality_score) / total_tasks
            
            with open(agent_file, 'w') as f:
                json.dump(agent_config, f, indent=2)
        
        return performance_record

# Global Lemon AI integration instance
lemon_ai_integration = LemonAIIntegration()

