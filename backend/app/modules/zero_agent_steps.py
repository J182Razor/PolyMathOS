"""
Zero Workflow Step Wrappers for Agent Patterns
Provides Zero-executable functions for all agent patterns
"""

import logging
from typing import Dict, Any, Optional
import asyncio

logger = logging.getLogger(__name__)

from .unified_agent_orchestrator import get_unified_orchestrator


# Zero workflow step functions
async def advanced_research_step(
    task: str,
    config: Dict[str, Any],
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """Zero workflow step for AdvancedResearch orchestration"""
    orchestrator = get_unified_orchestrator()
    return await orchestrator.execute_pattern(
        "advanced_research",
        config,
        task,
        context
    )


async def llamaindex_rag_step(
    query: str,
    config: Dict[str, Any],
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """Zero workflow step for LlamaIndex RAG query"""
    orchestrator = get_unified_orchestrator()
    return await orchestrator.execute_pattern(
        "llamaindex_rag",
        config,
        query,
        context
    )


async def chromadb_memory_step(
    operation: str,
    config: Dict[str, Any],
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """Zero workflow step for ChromaDB memory operations"""
    orchestrator = get_unified_orchestrator()
    config["operation"] = operation
    return await orchestrator.execute_pattern(
        "chromadb_memory",
        config,
        config.get("content", operation),
        context
    )


async def agent_rearrange_step(
    task: str,
    config: Dict[str, Any],
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """Zero workflow step for AgentRearrange sequential flow"""
    orchestrator = get_unified_orchestrator()
    return await orchestrator.execute_pattern(
        "agent_rearrange",
        config,
        task,
        context
    )


async def malt_step(
    task: str,
    config: Dict[str, Any],
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """Zero workflow step for MALT execution"""
    orchestrator = get_unified_orchestrator()
    return await orchestrator.execute_pattern(
        "malt",
        config,
        task,
        context
    )


async def hierarchical_swarm_step(
    task: str,
    config: Dict[str, Any],
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """Zero workflow step for HierarchicalSwarm execution"""
    orchestrator = get_unified_orchestrator()
    return await orchestrator.execute_pattern(
        "hierarchical_swarm",
        config,
        task,
        context
    )


async def group_chat_step(
    topic: str,
    config: Dict[str, Any],
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """Zero workflow step for GroupChat discussion"""
    orchestrator = get_unified_orchestrator()
    return await orchestrator.execute_pattern(
        "group_chat",
        config,
        topic,
        context
    )


async def multi_agent_router_step(
    task: str,
    config: Dict[str, Any],
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """Zero workflow step for MultiAgentRouter execution"""
    orchestrator = get_unified_orchestrator()
    return await orchestrator.execute_pattern(
        "multi_agent_router",
        config,
        task,
        context
    )


async def federated_swarm_step(
    task: str,
    config: Dict[str, Any],
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """Zero workflow step for FederatedSwarm execution"""
    orchestrator = get_unified_orchestrator()
    return await orchestrator.execute_pattern(
        "federated_swarm",
        config,
        task,
        context
    )


async def dfs_swarm_step(
    task: str,
    config: Dict[str, Any],
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """Zero workflow step for DFSSwarm execution"""
    orchestrator = get_unified_orchestrator()
    return await orchestrator.execute_pattern(
        "dfs_swarm",
        config,
        task,
        context
    )


async def agent_matrix_step(
    task: str,
    config: Dict[str, Any],
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """Zero workflow step for AgentMatrix execution"""
    orchestrator = get_unified_orchestrator()
    return await orchestrator.execute_pattern(
        "agent_matrix",
        config,
        task,
        context
    )


# Registry of all Zero workflow steps
ZERO_AGENT_STEPS = {
    "advanced_research": advanced_research_step,
    "llamaindex_rag": llamaindex_rag_step,
    "chromadb_memory": chromadb_memory_step,
    "agent_rearrange": agent_rearrange_step,
    "malt": malt_step,
    "hierarchical_swarm": hierarchical_swarm_step,
    "group_chat": group_chat_step,
    "multi_agent_router": multi_agent_router_step,
    "federated_swarm": federated_swarm_step,
    "dfs_swarm": dfs_swarm_step,
    "agent_matrix": agent_matrix_step
}


def get_zero_agent_step(step_name: str):
    """Get a Zero workflow step function by name"""
    return ZERO_AGENT_STEPS.get(step_name)


def list_zero_agent_steps() -> Dict[str, str]:
    """List all available Zero agent steps"""
    return {
        name: func.__name__ for name, func in ZERO_AGENT_STEPS.items()
    }

