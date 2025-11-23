"""
Agentic LLM Wrapper for PolyMathOS
Ensures ALL LLM operations go through agentic Swarms agents with Lemon AI evolution
This module provides a unified interface for all LLM calls in PolyMathOS
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime

logger = logging.getLogger(__name__)

# Import Swarms Agentic System
try:
    from .swarms_agentic_system import agentic_system, SwarmsAgenticSystem
    AGENTIC_SYSTEM_AVAILABLE = True
except ImportError:
    AGENTIC_SYSTEM_AVAILABLE = False
    agentic_system = None
    logger.warning("Swarms Agentic System not available for LLM wrapper")

class AgenticLLMWrapper:
    """
    Wrapper that ensures all LLM operations are agentic
    All direct LLM calls should go through this wrapper
    """
    
    def __init__(self):
        self.agentic_system = agentic_system if AGENTIC_SYSTEM_AVAILABLE else None
        if not self.agentic_system:
            logger.warning("Agentic LLM Wrapper initialized without Swarms Agentic System")
    
    async def generate_content(
        self,
        prompt: str,
        task_type: str = "content_generation",
        context: Optional[Dict[str, Any]] = None,
        priority: str = "quality"
    ) -> Dict[str, Any]:
        """
        Generate content agentically
        This replaces all direct LLM.generate() calls
        """
        if not self.agentic_system:
            logger.warning("Agentic system not available, returning fallback response")
            return {
                "content": f"[Fallback] Would process: {prompt[:100]}...",
                "success": False,
                "model_used": "fallback",
                "tokens_used": 0
            }
        
        try:
            response = await self.agentic_system.process_agentically(
                task_type=task_type,
                prompt=prompt,
                context=context or {},
                priority=priority
            )
            
            return {
                "content": response.content,
                "success": response.success,
                "model_used": response.model_used,
                "tokens_used": response.tokens_used,
                "execution_time": response.execution_time,
                "evolution_applied": response.evolution_applied,
                "agent_id": response.agent_id
            }
        except Exception as e:
            logger.error(f"Agentic content generation failed: {e}")
            return {
                "content": f"Error: {str(e)}",
                "success": False,
                "model_used": "unknown",
                "tokens_used": 0,
                "error": str(e)
            }
    
    async def generate_lesson_content(
        self,
        topic: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate lesson content agentically"""
        prompt = f"Generate a comprehensive lesson on: {topic}"
        return await self.generate_content(
            prompt=prompt,
            task_type="lesson_generation",
            context=context or {"topic": topic},
            priority="quality"
        )
    
    async def generate_research_report(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate research report agentically"""
        prompt = f"Research and create a comprehensive report on: {query}"
        return await self.generate_content(
            prompt=prompt,
            task_type="research",
            context=context or {"query": query},
            priority="quality"
        )
    
    async def generate_curriculum(
        self,
        domains: List[str],
        duration: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate curriculum agentically"""
        prompt = f"Create a {duration} learning curriculum covering: {', '.join(domains)}"
        return await self.generate_content(
            prompt=prompt,
            task_type="curriculum",
            context=context or {"domains": domains, "duration": duration},
            priority="quality"
        )
    
    async def generate_assessment(
        self,
        topic: str,
        difficulty: str = "medium",
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate assessment agentically"""
        prompt = f"Create a {difficulty} difficulty assessment for: {topic}"
        return await self.generate_content(
            prompt=prompt,
            task_type="assessment",
            context=context or {"topic": topic, "difficulty": difficulty},
            priority="quality"
        )
    
    async def personalize_content(
        self,
        content: str,
        learner_profile: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Personalize content agentically"""
        prompt = f"Personalize this content for the learner: {content[:200]}..."
        return await self.generate_content(
            prompt=prompt,
            task_type="personalization",
            context={**(context or {}), "learner_profile": learner_profile},
            priority="quality"
        )
    
    async def synthesize_knowledge(
        self,
        concepts: List[str],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Synthesize knowledge across concepts agentically"""
        prompt = f"Synthesize and connect these concepts: {', '.join(concepts)}"
        return await self.generate_content(
            prompt=prompt,
            task_type="knowledge_synthesis",
            context=context or {"concepts": concepts},
            priority="quality"
        )
    
    async def generate_code(
        self,
        requirement: str,
        language: str = "python",
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate code agentically"""
        prompt = f"Generate {language} code for: {requirement}"
        return await self.generate_content(
            prompt=prompt,
            task_type="code",
            context=context or {"requirement": requirement, "language": language},
            priority="quality"
        )
    
    def generate_content_sync(
        self,
        prompt: str,
        task_type: str = "content_generation",
        context: Optional[Dict[str, Any]] = None,
        priority: str = "quality"
    ) -> Dict[str, Any]:
        """Synchronous wrapper for generate_content"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(
                self.generate_content(prompt, task_type, context, priority)
            )
        finally:
            loop.close()
        return result

# Global wrapper instance
agentic_llm = AgenticLLMWrapper()

# Convenience functions for easy import
async def generate_content_agentically(
    prompt: str,
    task_type: str = "content_generation",
    context: Optional[Dict[str, Any]] = None,
    priority: str = "quality"
) -> Dict[str, Any]:
    """Convenience function for agentic content generation"""
    return await agentic_llm.generate_content(prompt, task_type, context, priority)

def generate_content_agentically_sync(
    prompt: str,
    task_type: str = "content_generation",
    context: Optional[Dict[str, Any]] = None,
    priority: str = "quality"
) -> Dict[str, Any]:
    """Synchronous convenience function for agentic content generation"""
    return agentic_llm.generate_content_sync(prompt, task_type, context, priority)




