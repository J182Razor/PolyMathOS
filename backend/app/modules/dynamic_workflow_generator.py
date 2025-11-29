"""
Dynamic Workflow Generator using Zero
Generates adaptive workflows for lesson plans, learning activities, and more
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

from app.modules.zero_integration import get_zero_integration
from app.modules.zero_agent_steps import ZERO_AGENT_STEPS, list_zero_agent_steps


class DynamicWorkflowGenerator:
    """
    Generates dynamic workflows using Zero for maximum efficiency and effectiveness.
    Creates adaptive workflows that adjust based on user progress and needs.
    """
    
    def __init__(self):
        self.zero = get_zero_integration()
        self.workflow_templates = self._load_workflow_templates()
    
    def _load_workflow_templates(self) -> Dict[str, Dict[str, Any]]:
        """Load workflow templates for different learning scenarios"""
        return {
            "lesson_plan": {
                "name": "Dynamic Lesson Plan Workflow",
                "description": "Generates and adapts lesson plans based on user progress",
                "triggers": [
                    {
                        "type": "manual",
                        "name": "create_lesson_plan",
                        "parameters": ["topic", "user_id", "goals"]
                    }
                ],
                "steps": [
                    {
                        "id": "analyze_requirements",
                        "type": "agent_pattern",
                        "pattern": "hierarchical_swarm",
                        "action": "hierarchical_swarm_step",
                        "config": {
                            "director_prompt": "Analyze learning requirements and create a strategic plan",
                            "agents": [
                                {"name": "Requirement-Analyzer", "system_prompt": "Analyze learning requirements from topic and goals"}
                            ]
                        },
                        "inputs": ["topic", "goals", "user_profile"]
                    },
                    {
                        "id": "generate_curriculum",
                        "type": "agent_pattern",
                        "pattern": "group_chat",
                        "action": "group_chat_step",
                        "config": {
                            "agents": [
                                {"name": "Curriculum-Designer", "description": "Designs learning curricula"},
                                {"name": "Pedagogy-Expert", "description": "Ensures pedagogical soundness"}
                            ]
                        },
                        "inputs": ["requirements", "user_preferences"]
                    },
                    {
                        "id": "optimize_path",
                        "type": "hdam",
                        "action": "optimize_learning_path",
                        "inputs": ["curriculum", "user_history"]
                    },
                    {
                        "id": "create_workflow",
                        "type": "workflow",
                        "action": "create_adaptive_workflow",
                        "inputs": ["optimized_path"]
                    }
                ]
            },
            "adaptive_learning": {
                "name": "Adaptive Learning Workflow",
                "description": "Adapts learning path based on real-time progress",
                "triggers": [
                    {
                        "type": "event",
                        "name": "progress_update",
                        "parameters": ["user_id", "activity_id", "score"]
                    }
                ],
                "steps": [
                    {
                        "id": "assess_progress",
                        "type": "analysis",
                        "action": "assess_current_progress",
                        "inputs": ["user_id", "activity_id", "score"]
                    },
                    {
                        "id": "determine_adaptation",
                        "type": "ai_decision",
                        "action": "determine_adaptation_strategy",
                        "inputs": ["progress", "user_profile", "learning_goals"]
                    },
                    {
                        "id": "update_workflow",
                        "type": "workflow",
                        "action": "update_workflow_steps",
                        "inputs": ["adaptation_strategy"]
                    }
                ]
            },
            "resource_discovery": {
                "name": "Resource Discovery Workflow",
                "description": "Discovers and integrates learning resources",
                "triggers": [
                    {
                        "type": "manual",
                        "name": "discover_resources",
                        "parameters": ["topic", "user_id"]
                    }
                ],
                "steps": [
                    {
                        "id": "research_papers",
                        "type": "agent_pattern",
                        "pattern": "advanced_research",
                        "action": "advanced_research_step",
                        "config": {
                            "max_workers": 5,
                            "strategy": "comprehensive"
                        },
                        "inputs": ["topic"]
                    },
                    {
                        "id": "process_documents",
                        "type": "agent_pattern",
                        "pattern": "agent_rearrange",
                        "action": "agent_rearrange_step",
                        "config": {
                            "agents": [
                                {"name": "Document-Analyzer", "system_prompt": "Analyze and extract key information from documents"},
                                {"name": "Content-Organizer", "system_prompt": "Organize content into structured learning materials"}
                            ]
                        },
                        "inputs": ["research_results"]
                    },
                    {
                        "id": "index_rag",
                        "type": "agent_pattern",
                        "pattern": "llamaindex_rag",
                        "action": "llamaindex_rag_step",
                        "config": {
                            "similarity_top_k": 10
                        },
                        "inputs": ["processed_documents"]
                    },
                    {
                        "id": "integrate_workflow",
                        "type": "workflow",
                        "action": "integrate_resources",
                        "inputs": ["indexed_resources"]
                    }
                ]
            },
            "assessment_loop": {
                "name": "Assessment and Feedback Loop",
                "description": "Continuous assessment and adaptive feedback",
                "triggers": [
                    {
                        "type": "schedule",
                        "name": "periodic_assessment",
                        "parameters": ["user_id", "frequency"]
                    }
                ],
                "steps": [
                    {
                        "id": "generate_assessment",
                        "type": "assessment",
                        "action": "generate_adaptive_quiz",
                        "inputs": ["user_progress", "learning_goals"]
                    },
                    {
                        "id": "analyze_results",
                        "type": "analysis",
                        "action": "analyze_assessment_results",
                        "inputs": ["assessment_results"]
                    },
                    {
                        "id": "update_path",
                        "type": "workflow",
                        "action": "update_learning_path",
                        "inputs": ["analysis", "user_profile"]
                    }
                ]
            }
        }
    
    def generate_lesson_plan_workflow(
        self,
        topic: str,
        user_id: str,
        goals: Dict[str, Any],
        user_profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate a dynamic lesson plan workflow using Zero.
        
        Args:
            topic: Learning topic
            user_id: User ID
            goals: Learning goals dictionary
            user_profile: Optional user profile for personalization
        
        Returns:
            Workflow definition and ID
        """
        template = self.workflow_templates["lesson_plan"]
        
        # Customize workflow based on goals and user profile
        workflow_def = {
            "name": f"Lesson Plan: {topic}",
            "description": f"Dynamic lesson plan workflow for {topic}",
            "user_id": user_id,
            "topic": topic,
            "goals": goals,
            "user_profile": user_profile or {},
            "triggers": template["triggers"],
            "steps": self._customize_lesson_steps(template["steps"], goals, user_profile),
            "adaptation_rules": self._generate_adaptation_rules(goals),
            "created_at": datetime.utcnow().isoformat(),
            "status": "active"
        }
        
        # Create workflow in Zero
        if self.zero.available:
            workflow_id = self.zero.create_workflow(workflow_def)
            if workflow_id:
                workflow_def["workflow_id"] = workflow_id
                logger.info(f"Created dynamic lesson plan workflow: {workflow_id}")
        
        return workflow_def
    
    def _customize_lesson_steps(
        self,
        base_steps: List[Dict[str, Any]],
        goals: Dict[str, Any],
        user_profile: Optional[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Customize workflow steps based on goals and user profile"""
        customized_steps = []
        
        for step in base_steps:
            customized_step = step.copy()
            
            # Convert agent pattern steps to Zero-executable format
            if step.get("type") == "agent_pattern":
                pattern_name = step.get("pattern")
                if pattern_name in ZERO_AGENT_STEPS:
                    customized_step["zero_function"] = ZERO_AGENT_STEPS[pattern_name].__name__
                    customized_step["zero_module"] = "app.modules.zero_agent_steps"
            
            # Add conditional steps based on goals
            if goals.get("include_feynman"):
                customized_steps.append({
                    "id": "feynman_explanation",
                    "type": "agent_pattern",
                    "pattern": "agent_rearrange",
                    "action": "agent_rearrange_step",
                    "config": {
                        "agents": [
                            {"name": "Feynman-Explainer", "system_prompt": "Explain concepts simply as if teaching a child"}
                        ]
                    },
                    "inputs": ["topic", "user_level"],
                    "condition": "after_curriculum"
                })
            
            if goals.get("include_memory_palace"):
                customized_steps.append({
                    "id": "memory_palace",
                    "type": "agent_pattern",
                    "pattern": "hierarchical_swarm",
                    "action": "hierarchical_swarm_step",
                    "config": {
                        "agents": [
                            {"name": "Memory-Palace-Designer", "system_prompt": "Design memory palaces for key concepts"}
                        ]
                    },
                    "inputs": ["key_concepts"],
                    "condition": "after_curriculum"
                })
            
            if goals.get("include_zettelkasten"):
                customized_steps.append({
                    "id": "zettelkasten_notes",
                    "type": "agent_pattern",
                    "pattern": "group_chat",
                    "action": "group_chat_step",
                    "config": {
                        "agents": [
                            {"name": "Zettel-Writer", "description": "Creates Zettelkasten notes"},
                            {"name": "Link-Analyzer", "description": "Analyzes and creates note links"}
                        ]
                    },
                    "inputs": ["content"],
                    "condition": "after_curriculum"
                })
            
            customized_steps.append(customized_step)
        
        return customized_steps
    
    def _generate_adaptation_rules(self, goals: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate adaptation rules for the workflow"""
        rules = [
            {
                "condition": "progress < 50%",
                "action": "increase_support",
                "parameters": {
                    "add_examples": True,
                    "reduce_difficulty": 0.1
                }
            },
            {
                "condition": "progress > 80%",
                "action": "increase_challenge",
                "parameters": {
                    "add_advanced_topics": True,
                    "increase_difficulty": 0.1
                }
            },
            {
                "condition": "comprehension < target_comprehension",
                "action": "add_review_cycle",
                "parameters": {
                    "review_frequency": "daily",
                    "review_method": "spaced_repetition"
                }
            }
        ]
        
        return rules
    
    def create_adaptive_workflow(
        self,
        workflow_id: str,
        progress_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create an adaptive workflow that adjusts based on progress.
        
        Args:
            workflow_id: Original workflow ID
            progress_data: Current progress data
        
        Returns:
            Updated workflow definition
        """
        # Get original workflow
        # In production, fetch from Zero or database
        
        # Analyze progress
        progress_percentage = progress_data.get("progress_percentage", 0)
        comprehension = progress_data.get("comprehension", 0)
        target_comprehension = progress_data.get("target_comprehension", 85)
        
        # Determine adaptations needed
        adaptations = []
        
        if progress_percentage < 50:
            adaptations.append({
                "type": "increase_support",
                "steps": [
                    {
                        "id": "add_examples",
                        "action": "generate_additional_examples",
                        "priority": "high"
                    },
                    {
                        "id": "simplify_content",
                        "action": "simplify_difficult_concepts",
                        "priority": "medium"
                    }
                ]
            })
        
        if comprehension < target_comprehension:
            adaptations.append({
                "type": "reinforcement",
                "steps": [
                    {
                        "id": "spaced_review",
                        "action": "schedule_spaced_repetition",
                        "priority": "high"
                    },
                    {
                        "id": "practice_quiz",
                        "action": "generate_practice_quiz",
                        "priority": "medium"
                    }
                ]
            })
        
        # Create updated workflow
        updated_workflow = {
            "original_workflow_id": workflow_id,
            "adaptations": adaptations,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        return updated_workflow
    
    def generate_resource_integration_workflow(
        self,
        topic: str,
        user_id: str
    ) -> Dict[str, Any]:
        """Generate workflow for discovering and integrating learning resources"""
        template = self.workflow_templates["resource_discovery"]
        
        workflow_def = {
            "name": f"Resource Discovery: {topic}",
            "description": f"Discovers and integrates resources for {topic}",
            "user_id": user_id,
            "topic": topic,
            "triggers": template["triggers"],
            "steps": template["steps"],
            "created_at": datetime.utcnow().isoformat()
        }
        
        if self.zero.available:
            workflow_id = self.zero.create_workflow(workflow_def)
            if workflow_id:
                workflow_def["workflow_id"] = workflow_id
        
        return workflow_def
    
    def generate_assessment_workflow(
        self,
        user_id: str,
        learning_plan_id: str,
        frequency: str = "weekly"
    ) -> Dict[str, Any]:
        """Generate periodic assessment workflow"""
        template = self.workflow_templates["assessment_loop"]
        
        workflow_def = {
            "name": f"Assessment Loop: {learning_plan_id}",
            "description": f"Periodic assessment workflow ({frequency})",
            "user_id": user_id,
            "learning_plan_id": learning_plan_id,
            "frequency": frequency,
            "triggers": [
                {
                    "type": "schedule",
                    "name": "periodic_assessment",
                    "schedule": self._get_schedule_for_frequency(frequency)
                }
            ],
            "steps": template["steps"],
            "created_at": datetime.utcnow().isoformat()
        }
        
        if self.zero.available:
            workflow_id = self.zero.create_workflow(workflow_def)
            if workflow_id:
                workflow_def["workflow_id"] = workflow_id
        
        return workflow_def
    
    def _get_schedule_for_frequency(self, frequency: str) -> str:
        """Get cron schedule for frequency"""
        schedules = {
            "daily": "0 9 * * *",  # 9 AM daily
            "weekly": "0 9 * * 0",  # 9 AM Sunday
            "biweekly": "0 9 */14 * *",  # Every 14 days
            "monthly": "0 9 1 * *"  # 9 AM 1st of month
        }
        return schedules.get(frequency, schedules["weekly"])
    
    def execute_workflow_with_adaptation(
        self,
        workflow_id: str,
        trigger_data: Dict[str, Any],
        progress_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute workflow with real-time adaptation based on progress.
        
        Args:
            workflow_id: Workflow ID
            trigger_data: Trigger data
            progress_data: Optional progress data for adaptation
        
        Returns:
            Execution result with adaptations
        """
        # If progress data provided, adapt workflow first
        if progress_data:
            adapted_workflow = self.create_adaptive_workflow(workflow_id, progress_data)
            # Merge adaptations into execution
            trigger_data["adaptations"] = adapted_workflow.get("adaptations", [])
        
        # Execute workflow
        if self.zero.available:
            result = self.zero.execute_workflow(workflow_id, trigger_data)
            return result
        
        return {
            "status": "error",
            "message": "Zero not available"
        }
    
    def generate_multi_phase_workflow(
        self,
        phases: List[Dict[str, Any]],
        user_id: str,
        topic: str
    ) -> Dict[str, Any]:
        """
        Generate a multi-phase workflow that adapts between phases.
        
        Args:
            phases: List of learning phases
            user_id: User ID
            topic: Learning topic
        
        Returns:
            Multi-phase workflow definition
        """
        workflow_steps = []
        
        for i, phase in enumerate(phases):
            phase_steps = [
                {
                    "id": f"phase_{i}_start",
                    "type": "phase_transition",
                    "action": "start_phase",
                    "inputs": ["phase_data"],
                    "phase_data": phase
                },
                {
                    "id": f"phase_{i}_activities",
                    "type": "activities",
                    "action": "execute_phase_activities",
                    "inputs": ["phase", "user_progress"]
                },
                {
                    "id": f"phase_{i}_assessment",
                    "type": "assessment",
                    "action": "assess_phase_completion",
                    "inputs": ["phase", "activities_results"]
                },
                {
                    "id": f"phase_{i}_adaptation",
                    "type": "adaptation",
                    "action": "adapt_next_phase",
                    "inputs": ["assessment_results", "next_phase"],
                    "condition": f"phase_{i}_complete"
                }
            ]
            
            workflow_steps.extend(phase_steps)
        
        workflow_def = {
            "name": f"Multi-Phase Learning: {topic}",
            "description": f"Adaptive multi-phase workflow for {topic}",
            "user_id": user_id,
            "topic": topic,
            "phases": phases,
            "triggers": [
                {
                    "type": "manual",
                    "name": "start_learning",
                    "parameters": ["user_id", "topic"]
                }
            ],
            "steps": workflow_steps,
            "created_at": datetime.utcnow().isoformat()
        }
        
        if self.zero.available:
            workflow_id = self.zero.create_workflow(workflow_def)
            if workflow_id:
                workflow_def["workflow_id"] = workflow_id
        
        return workflow_def


def get_dynamic_workflow_generator() -> DynamicWorkflowGenerator:
    """Get or create dynamic workflow generator instance"""
    return DynamicWorkflowGenerator()

