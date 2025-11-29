"""
Create Example Zero Workflows with Agent Patterns
Demonstrates how to use agent patterns in Zero workflows
"""

import os
import sys
import json
from typing import Dict, Any

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Note: We don't need to import the actual modules, just create JSON workflows


def create_research_workflow():
    """Create a research workflow using AdvancedResearch pattern"""
    workflow = {
        "name": "Research Workflow with AdvancedResearch",
        "description": "Comprehensive research workflow using orchestrator-worker pattern",
        "triggers": [
            {
                "type": "manual",
                "name": "start_research",
                "parameters": ["query", "user_id"]
            }
        ],
        "steps": [
            {
                "id": "research_orchestration",
                "type": "agent_pattern",
                "pattern": "advanced_research",
                "action": "advanced_research_step",
                "config": {
                    "max_workers": 5,
                    "strategy": "comprehensive",
                    "export": True
                },
                "inputs": ["query"]
            },
            {
                "id": "store_results",
                "type": "agent_pattern",
                "pattern": "chromadb_memory",
                "action": "chromadb_memory_step",
                "config": {
                    "operation": "store"
                },
                "inputs": ["research_results"]
            }
        ]
    }
    return workflow


def create_learning_workflow():
    """Create a learning workflow with multiple agent patterns"""
    workflow = {
        "name": "Dynamic Learning Workflow",
        "description": "Multi-pattern learning workflow with RAG and agent collaboration",
        "triggers": [
            {
                "type": "manual",
                "name": "start_learning",
                "parameters": ["topic", "user_id", "goals"]
            }
        ],
        "steps": [
            {
                "id": "research_topic",
                "type": "agent_pattern",
                "pattern": "advanced_research",
                "action": "advanced_research_step",
                "config": {
                    "max_workers": 3,
                    "strategy": "focused"
                },
                "inputs": ["topic"]
            },
            {
                "id": "query_knowledge_base",
                "type": "agent_pattern",
                "pattern": "llamaindex_rag",
                "action": "llamaindex_rag_step",
                "config": {
                    "similarity_top_k": 10
                },
                "inputs": ["topic", "research_results"]
            },
            {
                "id": "collaborative_analysis",
                "type": "agent_pattern",
                "pattern": "group_chat",
                "action": "group_chat_step",
                "config": {
                    "agents": [
                        {
                            "name": "Content-Analyzer",
                            "description": "Analyzes and structures learning content"
                        },
                        {
                            "name": "Pedagogy-Expert",
                            "description": "Ensures pedagogical soundness"
                        },
                        {
                            "name": "Assessment-Designer",
                            "description": "Creates assessment strategies"
                        }
                    ],
                    "max_loops": 2
                },
                "inputs": ["research_results", "rag_results"]
            },
            {
                "id": "store_learning_materials",
                "type": "agent_pattern",
                "pattern": "chromadb_memory",
                "action": "chromadb_memory_step",
                "config": {
                    "operation": "store"
                },
                "inputs": ["collaborative_results"]
            }
        ]
    }
    return workflow


def create_sequential_processing_workflow():
    """Create a workflow using AgentRearrange for sequential processing"""
    workflow = {
        "name": "Sequential Document Processing",
        "description": "Process documents through sequential agent stages",
        "triggers": [
            {
                "type": "manual",
                "name": "process_document",
                "parameters": ["document", "user_id"]
            }
        ],
        "steps": [
            {
                "id": "sequential_processing",
                "type": "agent_pattern",
                "pattern": "agent_rearrange",
                "action": "agent_rearrange_step",
                "config": {
                    "agents": [
                        {
                            "name": "Document-Extractor",
                            "system_prompt": "Extract key information from documents"
                        },
                        {
                            "name": "Content-Analyzer",
                            "system_prompt": "Analyze extracted content for insights"
                        },
                        {
                            "name": "Summary-Generator",
                            "system_prompt": "Generate comprehensive summaries"
                        }
                    ],
                    "flow": "Document-Extractor -> Content-Analyzer -> Summary-Generator"
                },
                "inputs": ["document"]
            }
        ]
    }
    return workflow


def create_hierarchical_planning_workflow():
    """Create a workflow using HierarchicalSwarm for planning"""
    workflow = {
        "name": "Hierarchical Planning Workflow",
        "description": "Use director-agent pattern for strategic planning",
        "triggers": [
            {
                "type": "manual",
                "name": "create_plan",
                "parameters": ["objective", "user_id"]
            }
        ],
        "steps": [
            {
                "id": "strategic_planning",
                "type": "agent_pattern",
                "pattern": "hierarchical_swarm",
                "action": "hierarchical_swarm_step",
                "config": {
                    "director_prompt": "As the Director, coordinate strategic planning tasks",
                    "agents": [
                        {
                            "name": "Strategy-Analyst",
                            "system_prompt": "Analyze objectives and create strategic plans"
                        },
                        {
                            "name": "Resource-Planner",
                            "system_prompt": "Plan resource allocation and timelines"
                        },
                        {
                            "name": "Risk-Assessor",
                            "system_prompt": "Assess risks and mitigation strategies"
                        }
                    ],
                    "max_loops": 2
                },
                "inputs": ["objective"]
            }
        ]
    }
    return workflow


def save_workflow(workflow: Dict[str, Any], filename: str):
    """Save workflow to JSON file"""
    output_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "workflows"
    )
    os.makedirs(output_dir, exist_ok=True)
    
    filepath = os.path.join(output_dir, filename)
    with open(filepath, 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print(f"✅ Saved workflow to: {filepath}")
    return filepath


def main():
    """Create example workflows"""
    print("\n" + "="*60)
    print("  Creating Example Zero Workflows with Agent Patterns")
    print("="*60 + "\n")
    
    workflows = [
        ("research_workflow.json", create_research_workflow()),
        ("learning_workflow.json", create_learning_workflow()),
        ("sequential_processing_workflow.json", create_sequential_processing_workflow()),
        ("hierarchical_planning_workflow.json", create_hierarchical_planning_workflow()),
    ]
    
    for filename, workflow in workflows:
        print(f"Creating {workflow['name']}...")
        save_workflow(workflow, filename)
        print()
    
    print("="*60)
    print("  Workflow Creation Complete")
    print("="*60)
    print("\n✅ Created example workflows in backend/workflows/")
    print("\n   To use these workflows:")
    print("   1. Import them into Zero workflow system")
    print("   2. Configure API keys in .env")
    print("   3. Execute via Zero API or workflow orchestrator")
    print("\n")


if __name__ == "__main__":
    main()

