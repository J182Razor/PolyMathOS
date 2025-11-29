"""
Education Learning Swarm Integration
Implements personalized education workflows using SequentialWorkflow
with curriculum design, interactive learning, and sample test generation.
"""

import os
import logging
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Try to import Swarms framework
try:
    from swarms import Agent, SequentialWorkflow
    from swarms.prompts import education as edu_prompts
    SWARMS_AVAILABLE = True
except ImportError:
    SWARMS_AVAILABLE = False
    logger.warning("Swarms framework not available")
    # Create minimal fallback
    class Agent:
        def __init__(self, **kwargs):
            self.agent_name = kwargs.get("agent_name", "Agent")
            self.model_name = kwargs.get("model_name", "gpt-4o-mini")
            self.sop = kwargs.get("sop", "")
        def run(self, task: str) -> str:
            return f"[Agent {self.agent_name} would process: {task[:100]}...]"
    
    class SequentialWorkflow:
        def __init__(self, **kwargs):
            self.tasks = []
        def add(self, agent, description: str):
            self.tasks.append({"agent": agent, "description": description})
        def run(self):
            return {"status": "workflow_complete"}
    
    edu_prompts = None

# Try to import OpenAI model
try:
    from swarms.models import OpenAIChat
    MODEL_AVAILABLE = True
except ImportError:
    MODEL_AVAILABLE = False
    logger.warning("OpenAIChat model not available")
    class OpenAIChat:
        def __init__(self, **kwargs):
            pass


class EducationSwarm:
    """
    Education Learning Swarm for personalized curriculum generation,
    interactive learning, and sample test creation.
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "gpt-4o-mini",
        temperature: float = 0.5,
        max_tokens: int = 3000
    ):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model_name = model_name
        self.temperature = temperature
        self.max_tokens = max_tokens
        
        if not SWARMS_AVAILABLE:
            logger.warning("Swarms framework not available, using fallback mode")
            self.available = False
            return
        
        self.available = True
        
        # Initialize language model
        try:
            if MODEL_AVAILABLE:
                self.llm = OpenAIChat(
                    openai_api_key=self.api_key,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
            else:
                self.llm = None
                logger.warning("LLM model not available")
        except Exception as e:
            logger.error(f"Failed to initialize LLM: {e}")
            self.llm = None
    
    def create_workflow(
        self,
        user_preferences: Dict[str, Any]
    ) -> SequentialWorkflow:
        """
        Create an education workflow based on user preferences.
        
        Args:
            user_preferences: Dictionary with keys:
                - subjects: str
                - learning_style: str (Visual, Auditory, Kinesthetic, Reading/Writing)
                - challenge_level: str (Easy, Moderate, Hard)
        
        Returns:
            SequentialWorkflow: Configured workflow
        """
        if not self.available:
            raise RuntimeError("Education Swarm not available")
        
        # Format prompts from user preferences
        if edu_prompts:
            curriculum_prompt = edu_prompts.CURRICULUM_DESIGN_PROMPT.format(**user_preferences)
            interactive_prompt = edu_prompts.INTERACTIVE_LEARNING_PROMPT.format(**user_preferences)
            sample_prompt = edu_prompts.SAMPLE_TEST_PROMPT.format(**user_preferences)
        else:
            # Fallback prompts
            curriculum_prompt = f"Design a curriculum for {user_preferences.get('subjects', 'general topics')} with {user_preferences.get('learning_style', 'Visual')} learning style."
            interactive_prompt = f"Create an interactive lesson for {user_preferences.get('subjects', 'general topics')}."
            sample_prompt = f"Generate a sample test for {user_preferences.get('subjects', 'general topics')}."
        
        # Initialize agents
        curriculum_agent = Agent(
            model_name=self.model_name,
            max_loops=1,
            sop=curriculum_prompt,
            llm=self.llm
        )
        
        interactive_learning_agent = Agent(
            model_name=self.model_name,
            max_loops=1,
            sop=interactive_prompt,
            llm=self.llm
        )
        
        sample_lesson_agent = Agent(
            model_name=self.model_name,
            max_loops=1,
            sop=sample_prompt,
            llm=self.llm
        )
        
        # Create Sequential Workflow
        workflow = SequentialWorkflow(max_loops=1)
        
        # Add tasks to workflow
        workflow.add(curriculum_agent, "Generate a curriculum")
        workflow.add(interactive_learning_agent, "Generate an interactive lesson")
        workflow.add(sample_lesson_agent, "Generate a practice test")
        
        return workflow
    
    def run_workflow(
        self,
        user_preferences: Dict[str, Any],
        initial_task: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Run the complete education workflow.
        
        Args:
            user_preferences: User preferences dictionary
            initial_task: Optional initial task/query
        
        Returns:
            Dictionary with workflow results
        """
        if not self.available:
            return {
                "status": "error",
                "message": "Education Swarm not available"
            }
        
        try:
            workflow = self.create_workflow(user_preferences)
            
            # Execute the workflow
            if initial_task:
                workflow.run(initial_task)
            else:
                workflow.run()
            
            # Collect results
            results = {
                "status": "success",
                "tasks": []
            }
            
            for task in workflow.tasks:
                results["tasks"].append({
                    "description": task.description,
                    "result": task.result if hasattr(task, 'result') else None
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Education workflow error: {e}")
            return {
                "status": "error",
                "message": str(e)
            }


