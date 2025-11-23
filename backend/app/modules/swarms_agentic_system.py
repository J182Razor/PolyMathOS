"""
Swarms Agentic System for PolyMathOS
Fully integrates Swarms framework for agentic LLM operations with Lemon AI evolution
Reference: https://github.com/kyegomez/swarms.git
"""

import os
import json
import asyncio
from typing import Dict, List, Optional, Any, Callable, Union
from dataclasses import dataclass, asdict
from datetime import datetime
import logging
import uuid
from pathlib import Path

logger = logging.getLogger(__name__)

# Import Swarms framework
SWARMS_AVAILABLE = False
try:
    from swarms import Agent, SequentialWorkflow, Swarm, Worker
    from swarms.tools import Tool
    SWARMS_AVAILABLE = True
    logger.info("Swarms framework successfully imported")
except (ImportError, TypeError, SyntaxError) as e:
    SWARMS_AVAILABLE = False
    logger.warning(f"Swarms library not available: {e}")
    # Create minimal fallback classes
    class Agent:
        def __init__(self, **kwargs):
            self.agent_name = kwargs.get("agent_name", "Agent")
            self.system_prompt = kwargs.get("system_prompt", "")
            self.model_name = kwargs.get("model_name", "gpt-4o")
        
        def run(self, prompt: str) -> str:
            return json.dumps({"status": "processed", "agent": self.agent_name, "response": f"[Agent {self.agent_name} would process: {prompt[:100]}...]"})
    
    class SequentialWorkflow:
        def __init__(self, **kwargs):
            self.agents = []
        
        def add(self, agent):
            self.agents.append(agent)
        
        def run(self, task: str) -> str:
            return json.dumps({"status": "workflow_complete", "task": task})
    
    class Swarm:
        def __init__(self, **kwargs):
            self.agents = []
        
        def add(self, agent):
            self.agents.append(agent)
        
        def run(self, task: str) -> str:
            return json.dumps({"status": "swarm_complete", "task": task})

# Import Lemon AI integration
try:
    from .lemon_ai_integration import lemon_ai_integration
    LEMON_AI_AVAILABLE = True
except ImportError:
    LEMON_AI_AVAILABLE = False
    lemon_ai_integration = None
    logger.warning("Lemon AI integration not available")

# Import LLM router
try:
    from .llm_router import llm_router, TaskRequirements
    LLM_ROUTER_AVAILABLE = True
except ImportError:
    LLM_ROUTER_AVAILABLE = False
    llm_router = None
    logger.warning("LLM router not available")

@dataclass
class AgenticTask:
    """Task definition for agentic processing"""
    task_id: str
    task_type: str
    prompt: str
    context: Dict[str, Any]
    requirements: Dict[str, Any]
    priority: str = "quality"
    callback: Optional[Callable] = None
    
    def to_dict(self):
        return {
            "task_id": self.task_id,
            "task_type": self.task_type,
            "prompt": self.prompt,
            "context": self.context,
            "requirements": self.requirements,
            "priority": self.priority
        }

@dataclass
class AgenticResponse:
    """Response from agentic processing"""
    task_id: str
    agent_id: str
    content: str
    model_used: str
    tokens_used: int
    execution_time: float
    success: bool
    evolution_applied: bool = False
    metadata: Dict[str, Any] = None
    
    def to_dict(self):
        return asdict(self)

class SwarmsAgenticSystem:
    """
    Comprehensive agentic system using Swarms framework
    All LLM operations go through agentic Swarms agents with Lemon AI evolution
    """
    
    def __init__(self, workspace_path: str = "./workspace/swarms"):
        self.workspace_path = Path(workspace_path)
        self.workspace_path.mkdir(parents=True, exist_ok=True)
        
        self.lemon_ai = lemon_ai_integration if LEMON_AI_AVAILABLE else None
        self.llm_router = llm_router if LLM_ROUTER_AVAILABLE else None
        
        # Agent registry - all agents are self-evolving
        self.agents: Dict[str, Agent] = {}
        self.agent_swarms: Dict[str, Swarm] = {}
        self.workflows: Dict[str, SequentialWorkflow] = {}
        
        # Performance tracking for evolution
        self.agent_performance: Dict[str, List[Dict]] = {}
        
        # Initialize core agentic agents
        self._initialize_core_agents()
        
        logger.info(f"Swarms Agentic System initialized (Swarms: {SWARMS_AVAILABLE}, Lemon AI: {LEMON_AI_AVAILABLE})")
    
    def _initialize_core_agents(self):
        """Initialize core agentic agents for PolyMathOS"""
        if not SWARMS_AVAILABLE:
            logger.warning("Swarms not available, using fallback agents")
            return
        
        # Learning Content Generation Agent
        self.agents["learning_content"] = self._create_self_evolving_agent(
            agent_id="learning_content_generator",
            agent_type="content_generation",
            system_prompt="""You are a Learning Content Generation Agent specialized in creating educational content.
            Your role is to generate comprehensive, engaging, and pedagogically sound learning materials.
            Always structure content with clear learning objectives, explanations, examples, and assessments.
            Adapt content difficulty based on learner level and provide multiple learning modalities.""",
            goals=["Generate high-quality educational content", "Adapt to learner needs", "Ensure pedagogical soundness"],
            tools=["web_search", "code_generation", "data_analysis"]
        )
        
        # Research & Discovery Agent
        self.agents["research"] = self._create_self_evolving_agent(
            agent_id="research_discovery",
            agent_type="research",
            system_prompt="""You are a Research & Discovery Agent specialized in finding and synthesizing information.
            Your role is to discover relevant academic resources, research papers, datasets, and learning materials.
            Always verify sources, provide citations, and synthesize information from multiple sources.""",
            goals=["Discover relevant resources", "Synthesize information", "Verify sources"],
            tools=["web_search", "arxiv_search", "dataset_search", "citation_management"]
        )
        
        # Curriculum Planning Agent
        self.agents["curriculum"] = self._create_self_evolving_agent(
            agent_id="curriculum_planner",
            agent_type="curriculum_planning",
            system_prompt="""You are a Curriculum Planning Agent specialized in creating learning paths.
            Your role is to design structured, progressive learning curricula that build knowledge incrementally.
            Always consider prerequisites, learning objectives, assessment strategies, and learner progression.""",
            goals=["Design effective curricula", "Ensure progressive learning", "Optimize learning paths"],
            tools=["knowledge_graph", "skill_mapping", "assessment_design"]
        )
        
        # Assessment & Feedback Agent
        self.agents["assessment"] = self._create_self_evolving_agent(
            agent_id="assessment_feedback",
            agent_type="assessment",
            system_prompt="""You are an Assessment & Feedback Agent specialized in evaluating learning progress.
            Your role is to create assessments, evaluate responses, and provide constructive feedback.
            Always provide specific, actionable feedback that guides learners toward improvement.""",
            goals=["Create effective assessments", "Provide constructive feedback", "Track learning progress"],
            tools=["grading", "feedback_generation", "progress_tracking"]
        )
        
        # Personalization Agent
        self.agents["personalization"] = self._create_self_evolving_agent(
            agent_id="personalization_engine",
            agent_type="personalization",
            system_prompt="""You are a Personalization Agent specialized in adapting learning experiences.
            Your role is to analyze learner behavior, preferences, and performance to personalize content and pacing.
            Always consider individual learning styles, prior knowledge, and learning goals.""",
            goals=["Personalize learning experiences", "Adapt to learner needs", "Optimize engagement"],
            tools=["learner_profiling", "content_adaptation", "pacing_optimization"]
        )
        
        # Code Generation & Execution Agent
        self.agents["code"] = self._create_self_evolving_agent(
            agent_id="code_generator",
            agent_type="code_generation",
            system_prompt="""You are a Code Generation & Execution Agent specialized in creating and executing code.
            Your role is to generate, test, debug, and execute code for learning exercises and projects.
            Always write clean, well-documented code and ensure safe execution in sandboxed environments.""",
            goals=["Generate quality code", "Ensure safe execution", "Provide code explanations"],
            tools=["code_generation", "code_execution", "debugging", "code_review"]
        )
        
        # Knowledge Synthesis Agent
        self.agents["synthesis"] = self._create_self_evolving_agent(
            agent_id="knowledge_synthesizer",
            agent_type="knowledge_synthesis",
            system_prompt="""You are a Knowledge Synthesis Agent specialized in connecting concepts across domains.
            Your role is to identify patterns, create connections, and synthesize knowledge from multiple sources.
            Always look for cross-domain insights and create comprehensive knowledge representations.""",
            goals=["Synthesize knowledge", "Create connections", "Identify patterns"],
            tools=["concept_mapping", "pattern_recognition", "knowledge_graph"]
        )
        
        logger.info(f"Initialized {len(self.agents)} core agentic agents")
    
    def _create_self_evolving_agent(
        self,
        agent_id: str,
        agent_type: str,
        system_prompt: str,
        goals: List[str],
        tools: Optional[List[str]] = None
    ) -> Agent:
        """Create a self-evolving agent with Lemon AI integration"""
        # Get optimal model from router
        model_name = "gpt-4o"  # Default
        if self.llm_router:
            try:
                requirements = TaskRequirements(
                    task_type=agent_type,
                    priority="quality",
                    requires_reasoning=True,
                    requires_creativity=True
                )
                _, config = self.llm_router.select_optimal_llm(requirements)
                model_name = config.model_name
            except Exception as e:
                logger.warning(f"LLM router failed for {agent_id}, using default: {e}")
        
        # Create Lemon AI evolution config if available
        lemon_config = None
        if self.lemon_ai:
            try:
                lemon_config = self.lemon_ai.create_self_evolving_agent(
                    agent_id=agent_id,
                    agent_type=agent_type,
                    initial_prompt=system_prompt,
                    goals=goals,
                    tools=tools
                )
                # Update system prompt with evolution context
                if lemon_config.get("evolution_history"):
                    evolution_summary = "\n\nEvolution History:\n"
                    for evo in lemon_config["evolution_history"][-3:]:  # Last 3 evolutions
                        evolution_summary += f"- {evo.get('reason', 'Improvement')}\n"
                    system_prompt += evolution_summary
            except Exception as e:
                logger.warning(f"Lemon AI config failed for {agent_id}: {e}")
        
        # Create Swarms Agent
        if SWARMS_AVAILABLE:
            agent = Agent(
                agent_name=agent_id.replace("_", " ").title(),
                system_prompt=system_prompt,
                model_name=model_name,
                max_loops=3,  # Allow agent to think and refine
                verbose=True,
                output_type="json",
                tools=tools or []
            )
        else:
            # Fallback agent
            agent = Agent(
                agent_name=agent_id,
                system_prompt=system_prompt,
                model_name=model_name
            )
        
        # Initialize performance tracking
        self.agent_performance[agent_id] = []
        
        logger.info(f"Created self-evolving agent: {agent_id} with model: {model_name}")
        return agent
    
    async def process_agentically(
        self,
        task_type: str,
        prompt: str,
        context: Optional[Dict[str, Any]] = None,
        requirements: Optional[Dict[str, Any]] = None,
        priority: str = "quality"
    ) -> AgenticResponse:
        """
        Process any task agentically using Swarms agents
        This is the main entry point for all LLM operations in PolyMathOS
        """
        task_id = str(uuid.uuid4())
        start_time = datetime.now()
        
        # Select appropriate agent
        agent_id = self._select_agent_for_task(task_type)
        agent = self.agents.get(agent_id)
        
        if not agent:
            raise ValueError(f"No agent available for task type: {task_type}")
        
        # Enhance prompt with context
        enhanced_prompt = self._enhance_prompt(prompt, context or {})
        
        try:
            # Execute agentically
            if SWARMS_AVAILABLE and hasattr(agent, 'run'):
                result = agent.run(enhanced_prompt)
            else:
                # Fallback
                result = json.dumps({"response": f"[Agent {agent_id} processed: {enhanced_prompt[:100]}...]"})
            
            # Parse result
            if isinstance(result, str):
                try:
                    result_data = json.loads(result)
                    content = result_data.get("response", result_data.get("content", result))
                except json.JSONDecodeError:
                    content = result
            else:
                content = str(result)
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            # Track performance for evolution
            performance_data = {
                "task_id": task_id,
                "agent_id": agent_id,
                "success": True,
                "execution_time": execution_time,
                "quality_score": 0.8,  # Default, can be enhanced
                "timestamp": datetime.now().isoformat()
            }
            self.agent_performance[agent_id].append(performance_data)
            
            # Apply Lemon AI evolution
            evolution_applied = False
            if self.lemon_ai and len(self.agent_performance[agent_id]) % 10 == 0:  # Evolve every 10 tasks
                try:
                    evolution_result = self.lemon_ai.evolve_agent(
                        agent_id=agent_id,
                        task_results={"content": content, "task_type": task_type},
                        performance_feedback={
                            "success": True,
                            "quality_score": performance_data["quality_score"],
                            "feedback": "Task completed successfully"
                        }
                    )
                    evolution_applied = evolution_result.get("evolved", False)
                    if evolution_applied:
                        logger.info(f"Agent {agent_id} evolved: {evolution_result.get('reason', 'Performance improvement')}")
                except Exception as e:
                    logger.warning(f"Evolution failed for {agent_id}: {e}")
            
            # Get model info
            model_used = getattr(agent, 'model_name', 'unknown')
            tokens_used = len(content.split()) * 1.3  # Rough estimate
            
            return AgenticResponse(
                task_id=task_id,
                agent_id=agent_id,
                content=content,
                model_used=model_used,
                tokens_used=int(tokens_used),
                execution_time=execution_time,
                success=True,
                evolution_applied=evolution_applied,
                metadata={"context": context, "requirements": requirements}
            )
            
        except Exception as e:
            logger.error(f"Agentic processing failed for {agent_id}: {e}")
            execution_time = (datetime.now() - start_time).total_seconds()
            
            # Track failure for evolution
            if agent_id in self.agent_performance:
                self.agent_performance[agent_id].append({
                    "task_id": task_id,
                    "agent_id": agent_id,
                    "success": False,
                    "execution_time": execution_time,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                })
            
            # Trigger evolution on failure
            if self.lemon_ai:
                try:
                    self.lemon_ai.evolve_agent(
                        agent_id=agent_id,
                        task_results={"error": str(e)},
                        performance_feedback={
                            "success": False,
                            "quality_score": 0.0,
                            "feedback": f"Task failed: {str(e)}"
                        }
                    )
                except Exception as evo_error:
                    logger.warning(f"Evolution on failure failed: {evo_error}")
            
            return AgenticResponse(
                task_id=task_id,
                agent_id=agent_id,
                content=f"Error: {str(e)}",
                model_used=getattr(agent, 'model_name', 'unknown'),
                tokens_used=0,
                execution_time=execution_time,
                success=False,
                evolution_applied=False,
                metadata={"error": str(e)}
            )
    
    def _select_agent_for_task(self, task_type: str) -> str:
        """Select appropriate agent for task type"""
        task_mapping = {
            "content_generation": "learning_content",
            "lesson_generation": "learning_content",
            "research": "research",
            "resource_discovery": "research",
            "curriculum": "curriculum",
            "learning_path": "curriculum",
            "assessment": "assessment",
            "feedback": "assessment",
            "personalization": "personalization",
            "adaptation": "personalization",
            "code": "code",
            "programming": "code",
            "synthesis": "synthesis",
            "knowledge_synthesis": "synthesis"
        }
        
        return task_mapping.get(task_type, "learning_content")
    
    def _enhance_prompt(self, prompt: str, context: Dict[str, Any]) -> str:
        """Enhance prompt with context information"""
        if not context:
            return prompt
        
        context_str = "\n\nContext:\n"
        for key, value in context.items():
            if isinstance(value, (dict, list)):
                context_str += f"{key}: {json.dumps(value, indent=2)}\n"
            else:
                context_str += f"{key}: {value}\n"
        
        return prompt + context_str
    
    def create_swarm_for_task(self, task_description: str, agent_ids: List[str]) -> Swarm:
        """Create a swarm of agents for complex multi-agent tasks"""
        if not SWARMS_AVAILABLE:
            raise ValueError("Swarms framework not available")
        
        swarm_agents = [self.agents[aid] for aid in agent_ids if aid in self.agents]
        
        if not swarm_agents:
            raise ValueError(f"No valid agents found for IDs: {agent_ids}")
        
        swarm = Swarm(agents=swarm_agents)
        swarm_id = str(uuid.uuid4())
        self.agent_swarms[swarm_id] = swarm
        
        logger.info(f"Created swarm {swarm_id} with {len(swarm_agents)} agents for: {task_description}")
        return swarm
    
    def create_workflow(self, task_steps: List[Dict[str, Any]]) -> SequentialWorkflow:
        """Create a sequential workflow for multi-step tasks"""
        if not SWARMS_AVAILABLE:
            raise ValueError("Swarms framework not available")
        
        workflow = SequentialWorkflow()
        
        for step in task_steps:
            agent_id = step.get("agent_id")
            if agent_id in self.agents:
                workflow.add(self.agents[agent_id])
            else:
                logger.warning(f"Agent {agent_id} not found, skipping step")
        
        workflow_id = str(uuid.uuid4())
        self.workflows[workflow_id] = workflow
        
        logger.info(f"Created workflow {workflow_id} with {len(workflow.agents)} steps")
        return workflow
    
    def get_agent_performance_report(self, agent_id: Optional[str] = None) -> Dict:
        """Get performance report for agents"""
        if agent_id:
            return {
                "agent_id": agent_id,
                "performance_history": self.agent_performance.get(agent_id, []),
                "total_tasks": len(self.agent_performance.get(agent_id, [])),
                "success_rate": self._calculate_success_rate(agent_id)
            }
        else:
            return {
                "all_agents": {
                    aid: {
                        "total_tasks": len(perf),
                        "success_rate": self._calculate_success_rate(aid)
                    }
                    for aid, perf in self.agent_performance.items()
                }
            }
    
    def _calculate_success_rate(self, agent_id: str) -> float:
        """Calculate success rate for an agent"""
        perf = self.agent_performance.get(agent_id, [])
        if not perf:
            return 0.0
        successful = sum(1 for p in perf if p.get("success", False))
        return successful / len(perf)

# Global agentic system instance
agentic_system = SwarmsAgenticSystem()

