"""
AgentMatrix Pattern
Matrix-based agent execution with row/column processing options
"""

import os
import logging
import asyncio
import concurrent.futures
from typing import Dict, Any, List, Optional, Union

logger = logging.getLogger(__name__)

# Try to import AgentMatrix
try:
    from swarms.structs.agent import Agent
    SWARMS_AVAILABLE = True
except ImportError:
    SWARMS_AVAILABLE = False
    logger.warning("Swarms not available. Install: pip install swarms")
    Agent = None


class AgentMatrixPattern:
    """
    AgentMatrix pattern implementation.
    Matrix-based execution where agents can be organized in rows/columns
    and executed sequentially or concurrently.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.available = SWARMS_AVAILABLE
        
        if not self.available:
            logger.warning("AgentMatrix not available")
            return
        
        logger.info("AgentMatrix pattern initialized")
    
    def _execute_row_sequentially(
        self,
        row: List[Agent],
        query: str,
        current_input: str
    ) -> str:
        """Execute agents in a row sequentially"""
        for agent in row:
            current_input = agent.run(current_input)
        return current_input
    
    def _execute_row_concurrently(
        self,
        row: List[Agent],
        query: str
    ) -> List[str]:
        """Execute agents in a row concurrently"""
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = [executor.submit(agent.run, query) for agent in row]
            return [future.result() for future in concurrent.futures.as_completed(futures)]
    
    async def execute(
        self,
        task: str,
        pattern_config: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute AgentMatrix pattern.
        
        Args:
            task: Task to execute
            pattern_config: Configuration (matrix, execution_mode, etc.)
            context: Additional context
        
        Returns:
            Execution results
        """
        if not self.available:
            return {
                "status": "error",
                "message": "AgentMatrix not available"
            }
        
        try:
            # Get matrix configuration
            matrix_config = pattern_config.get("matrix", [])
            execution_mode = pattern_config.get("execution_mode", "row_sequential")
            row_index = pattern_config.get("row_index")
            col_index = pattern_config.get("col_index")
            
            # Build agent matrix
            agent_matrix = []
            for row_config in matrix_config:
                row = []
                for agent_config in row_config:
                    agent = Agent(
                        agent_name=agent_config.get("name", "Agent"),
                        system_prompt=agent_config.get("system_prompt", ""),
                        model_name=agent_config.get("model_name", "gpt-4o-mini"),
                        max_loops=pattern_config.get("max_loops", 1)
                    )
                    row.append(agent)
                agent_matrix.append(row)
            
            results = []
            
            if execution_mode == "row_sequential" and row_index is not None:
                # Execute specific row sequentially
                result = await asyncio.to_thread(
                    self._execute_row_sequentially, agent_matrix[row_index], task, task
                )
                results.append({"row": row_index, "result": result})
            
            elif execution_mode == "row_concurrent" and row_index is not None:
                # Execute specific row concurrently
                result = await asyncio.to_thread(
                    self._execute_row_concurrently, agent_matrix[row_index], task
                )
                results.append({"row": row_index, "results": result})
            
            elif execution_mode == "column" and col_index is not None:
                # Execute specific column
                column_results = []
                for row in agent_matrix:
                    if col_index < len(row):
                        result = await asyncio.to_thread(row[col_index].run, task)
                        column_results.append(result)
                results.append({"column": col_index, "results": column_results})
            
            elif execution_mode == "all":
                # Execute all agents in row-major order
                current_input = task
                for i, row in enumerate(agent_matrix):
                    current_input = await asyncio.to_thread(
                        self._execute_row_sequentially, row, task, current_input
                    )
                    results.append({"row": i, "result": current_input})
            
            return {
                "status": "success",
                "task": task,
                "execution_mode": execution_mode,
                "matrix_size": f"{len(agent_matrix)}x{len(agent_matrix[0]) if agent_matrix else 0}",
                "results": results
            }
        except Exception as e:
            logger.error(f"AgentMatrix execution failed: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    @property
    def description(self) -> str:
        return "Matrix-based agent execution with flexible processing patterns"
    
    @property
    def capabilities(self) -> List[str]:
        return [
            "matrix_organization",
            "row_sequential_execution",
            "row_concurrent_execution",
            "column_execution",
            "flexible_processing"
        ]

