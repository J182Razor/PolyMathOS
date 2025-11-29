"""
Workflow Orchestrator
Monitors user progress and dynamically adapts workflows for maximum efficiency
"""

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import asyncio

logger = logging.getLogger(__name__)

from app.modules.dynamic_workflow_generator import get_dynamic_workflow_generator
from app.modules.zero_integration import get_zero_integration


class WorkflowOrchestrator:
    """
    Orchestrates dynamic workflows, monitoring progress and adapting in real-time
    for maximum learning efficiency and effectiveness.
    """
    
    def __init__(self):
        self.workflow_generator = get_dynamic_workflow_generator()
        self.zero = get_zero_integration()
        self.active_workflows: Dict[str, Dict[str, Any]] = {}
        self.progress_tracking: Dict[str, Dict[str, Any]] = {}
    
    async def initialize_learning_workflow(
        self,
        user_id: str,
        learning_plan_id: str,
        topic: str,
        goals: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Initialize a complete learning workflow system.
        
        Args:
            user_id: User ID
            learning_plan_id: Learning plan ID
            topic: Learning topic
            goals: Learning goals
        
        Returns:
            Workflow system configuration
        """
        # Generate main lesson plan workflow
        lesson_workflow = self.workflow_generator.generate_lesson_plan_workflow(
            topic=topic,
            user_id=user_id,
            goals=goals
        )
        
        # Generate resource discovery workflow
        resource_workflow = self.workflow_generator.generate_resource_integration_workflow(
            topic=topic,
            user_id=user_id
        )
        
        # Generate assessment workflow
        assessment_workflow = self.workflow_generator.generate_assessment_workflow(
            user_id=user_id,
            learning_plan_id=learning_plan_id,
            frequency="weekly"
        )
        
        # Store active workflows
        workflow_system = {
            "learning_plan_id": learning_plan_id,
            "user_id": user_id,
            "topic": topic,
            "workflows": {
                "lesson_plan": lesson_workflow.get("workflow_id"),
                "resources": resource_workflow.get("workflow_id"),
                "assessment": assessment_workflow.get("workflow_id")
            },
            "created_at": datetime.utcnow().isoformat(),
            "status": "active"
        }
        
        self.active_workflows[learning_plan_id] = workflow_system
        
        # Initialize progress tracking
        self.progress_tracking[learning_plan_id] = {
            "overall_progress": 0,
            "comprehension": 0,
            "activities_completed": 0,
            "last_updated": datetime.utcnow().isoformat()
        }
        
        return workflow_system
    
    async def update_progress_and_adapt(
        self,
        learning_plan_id: str,
        activity_id: str,
        score: float,
        activity_type: str = "assessment"
    ) -> Dict[str, Any]:
        """
        Update progress and adapt workflows in real-time.
        
        Args:
            learning_plan_id: Learning plan ID
            activity_id: Activity ID
            score: Performance score (0-100)
            activity_type: Type of activity
        
        Returns:
            Adaptation result
        """
        if learning_plan_id not in self.active_workflows:
            return {"status": "error", "message": "Workflow not found"}
        
        workflow_system = self.active_workflows[learning_plan_id]
        progress = self.progress_tracking[learning_plan_id]
        
        # Update progress
        progress["activities_completed"] += 1
        progress["last_updated"] = datetime.utcnow().isoformat()
        
        # Calculate new comprehension (weighted average)
        current_comprehension = progress.get("comprehension", 0)
        new_comprehension = (current_comprehension * 0.7) + (score * 0.3)
        progress["comprehension"] = new_comprehension
        
        # Calculate overall progress
        # This would be based on activities completed vs total
        total_activities = workflow_system.get("total_activities", 100)
        progress["overall_progress"] = min(
            (progress["activities_completed"] / total_activities) * 100,
            100
        )
        
        # Determine if adaptation is needed
        adaptations = []
        
        # Low performance adaptation
        if score < 60:
            adaptations.append({
                "type": "remediation",
                "action": "add_support_materials",
                "priority": "high"
            })
            adaptations.append({
                "type": "pacing",
                "action": "reduce_difficulty",
                "priority": "high"
            })
        
        # High performance adaptation
        if score > 90:
            adaptations.append({
                "type": "acceleration",
                "action": "add_advanced_content",
                "priority": "medium"
            })
            adaptations.append({
                "type": "pacing",
                "action": "increase_difficulty",
                "priority": "medium"
            })
        
        # Comprehension below target
        target_comprehension = workflow_system.get("target_comprehension", 85)
        if new_comprehension < target_comprehension:
            adaptations.append({
                "type": "reinforcement",
                "action": "schedule_review",
                "priority": "high"
            })
        
        # Apply adaptations
        if adaptations:
            lesson_workflow_id = workflow_system["workflows"]["lesson_plan"]
            if lesson_workflow_id:
                progress_data = {
                    "progress_percentage": progress["overall_progress"],
                    "comprehension": new_comprehension,
                    "target_comprehension": target_comprehension,
                    "recent_score": score
                }
                
                adapted_workflow = self.workflow_generator.create_adaptive_workflow(
                    workflow_id=lesson_workflow_id,
                    progress_data=progress_data
                )
                
                # Execute adapted workflow
                if self.zero.available:
                    result = self.zero.execute_workflow(
                        lesson_workflow_id,
                        trigger_data={
                            "adaptations": adaptations,
                            "progress": progress_data
                        }
                    )
                    
                    return {
                        "status": "adapted",
                        "adaptations": adaptations,
                        "workflow_result": result,
                        "updated_progress": progress
                    }
        
        return {
            "status": "updated",
            "adaptations": [],
            "updated_progress": progress
        }
    
    async def trigger_resource_discovery(
        self,
        learning_plan_id: str,
        topic: str
    ) -> Dict[str, Any]:
        """
        Trigger resource discovery workflow.
        
        Args:
            learning_plan_id: Learning plan ID
            topic: Topic for resource discovery
        
        Returns:
            Discovery result
        """
        if learning_plan_id not in self.active_workflows:
            return {"status": "error", "message": "Workflow not found"}
        
        workflow_system = self.active_workflows[learning_plan_id]
        resource_workflow_id = workflow_system["workflows"]["resources"]
        
        if resource_workflow_id and self.zero.available:
            result = self.zero.execute_workflow(
                resource_workflow_id,
                trigger_data={"topic": topic}
            )
            return result
        
        return {"status": "error", "message": "Resource workflow not available"}
    
    async def trigger_periodic_assessment(
        self,
        learning_plan_id: str
    ) -> Dict[str, Any]:
        """
        Trigger periodic assessment workflow.
        
        Args:
            learning_plan_id: Learning plan ID
        
        Returns:
            Assessment result
        """
        if learning_plan_id not in self.active_workflows:
            return {"status": "error", "message": "Workflow not found"}
        
        workflow_system = self.active_workflows[learning_plan_id]
        assessment_workflow_id = workflow_system["workflows"]["assessment"]
        progress = self.progress_tracking.get(learning_plan_id, {})
        
        if assessment_workflow_id and self.zero.available:
            result = self.zero.execute_workflow(
                assessment_workflow_id,
                trigger_data={
                    "progress": progress,
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            return result
        
        return {"status": "error", "message": "Assessment workflow not available"}
    
    def get_workflow_status(self, learning_plan_id: str) -> Dict[str, Any]:
        """Get current workflow status and progress"""
        if learning_plan_id not in self.active_workflows:
            return {"status": "not_found"}
        
        workflow_system = self.active_workflows[learning_plan_id]
        progress = self.progress_tracking.get(learning_plan_id, {})
        
        return {
            "status": "active",
            "workflow_system": workflow_system,
            "progress": progress,
            "efficiency_metrics": self._calculate_efficiency_metrics(learning_plan_id)
        }
    
    def _calculate_efficiency_metrics(self, learning_plan_id: str) -> Dict[str, Any]:
        """Calculate efficiency metrics for the learning workflow"""
        progress = self.progress_tracking.get(learning_plan_id, {})
        
        # Calculate efficiency based on progress vs time
        # This is a simplified calculation
        efficiency = min(
            (progress.get("comprehension", 0) / progress.get("overall_progress", 1)) * 100,
            100
        ) if progress.get("overall_progress", 0) > 0 else 0
        
        return {
            "efficiency_score": efficiency,
            "comprehension_rate": progress.get("comprehension", 0),
            "progress_rate": progress.get("overall_progress", 0),
            "activities_per_day": progress.get("activities_completed", 0) / max(
                (datetime.utcnow() - datetime.fromisoformat(
                    progress.get("last_updated", datetime.utcnow().isoformat())
                )).days,
                1
            )
        }


def get_workflow_orchestrator() -> WorkflowOrchestrator:
    """Get or create workflow orchestrator instance"""
    return WorkflowOrchestrator()

