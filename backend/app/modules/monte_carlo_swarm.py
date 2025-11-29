"""
MonteCarloSwarm Integration
Leverages multiple agents to collaborate in a Monte Carlo fashion.
Each agent's output is passed to the next, refining the result progressively.
Supports parallel execution, dynamic agent selection, and custom result aggregation.
"""

import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Callable, List, Optional
from collections import Counter

logger = logging.getLogger(__name__)

# Try to import Swarms framework
try:
    from swarms import Agent
    from swarms.structs.base_swarm import BaseSwarm
    from swarms.utils.loguru_logger import logger as swarm_logger
    SWARMS_AVAILABLE = True
except ImportError:
    SWARMS_AVAILABLE = False
    logger.warning("Swarms framework not available")
    # Create minimal fallback
    class BaseSwarm:
        def __init__(self, agents, *args, **kwargs):
            self.agents = agents
    class Agent:
        def __init__(self, **kwargs):
            self.agent_name = kwargs.get("agent_name", "Agent")
        def run(self, task: str) -> str:
            return f"[Agent {self.agent_name} would process: {task[:100]}...]"


class MonteCarloSwarm(BaseSwarm):
    """
    MonteCarloSwarm leverages multiple agents to collaborate in a Monte Carlo fashion.
    Each agent's output is passed to the next, refining the result progressively.
    Supports parallel execution, dynamic agent selection, and custom result aggregation.

    Attributes:
        agents (List[Agent]): A list of agents that will participate in the swarm.
        parallel (bool): If True, agents will run in parallel.
        result_aggregator (Callable[[List[Any]], Any]): A function to aggregate results from agents.
        max_workers (Optional[int]): The maximum number of threads for parallel execution.
    """

    def __init__(
        self,
        agents: List[Agent],
        parallel: bool = False,
        result_aggregator: Optional[Callable[[List[Any]], Any]] = None,
        max_workers: Optional[int] = None,
        *args,
        **kwargs,
    ) -> None:
        """
        Initializes the MonteCarloSwarm with a list of agents.

        Args:
            agents (List[Agent]): A list of agents to include in the swarm.
            parallel (bool): If True, agents will run in parallel. Default is False.
            result_aggregator (Optional[Callable[[List[Any]], Any]]): A function to aggregate results from agents.
            max_workers (Optional[int]): The maximum number of threads for parallel execution.
        """
        super().__init__(agents=agents, *args, **kwargs)

        if not agents:
            raise ValueError("The agents list cannot be empty.")

        self.agents = agents
        self.parallel = parallel
        self.result_aggregator = result_aggregator or self.default_aggregator
        self.max_workers = max_workers or len(agents)

    def run(self, task: str) -> Any:
        """
        Runs the MonteCarloSwarm with the given input, passing the output of each agent
        to the next one in the list or running agents in parallel.

        Args:
            task (str): The initial input to provide to the first agent.

        Returns:
            Any: The final output after all agents have processed the input.
        """
        logger.info(f"Starting MonteCarloSwarm with parallel={self.parallel}")

        if self.parallel:
            results = self._run_parallel(task)
        else:
            results = self._run_sequential(task)

        final_output = self.result_aggregator(results)
        logger.info(f"MonteCarloSwarm completed. Final output: {final_output}")
        return final_output

    def _run_sequential(self, task: str) -> List[Any]:
        """
        Runs the agents sequentially, passing each agent's output to the next.

        Args:
            task (str): The initial input to provide to the first agent.

        Returns:
            List[Any]: A list of results from each agent.
        """
        results = []
        current_input = task
        for i, agent in enumerate(self.agents):
            logger.info(f"Agent {i + 1} processing sequentially...")
            current_output = agent.run(current_input)
            results.append(current_output)
            current_input = current_output
        return results

    def _run_parallel(self, task: str) -> List[Any]:
        """
        Runs the agents in parallel, each receiving the same initial input.

        Args:
            task (str): The initial input to provide to all agents.

        Returns:
            List[Any]: A list of results from each agent.
        """
        results = []
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_agent = {
                executor.submit(agent.run, task): agent
                for agent in self.agents
            }
            for future in as_completed(future_to_agent):
                try:
                    result = future.result()
                    results.append(result)
                    logger.info(f"Agent completed with result: {result}")
                except Exception as e:
                    logger.error(f"Agent encountered an error: {e}")
                    results.append(None)
        return results

    @staticmethod
    def default_aggregator(results: List[Any]) -> Any:
        """
        Default result aggregator that returns the last result.

        Args:
            results (List[Any]): A list of results from agents.

        Returns:
            Any: The final aggregated result.
        """
        return results


# Aggregation functions
def average_aggregator(results: List[float]) -> float:
    """Aggregate results by averaging numerical values"""
    return sum(results) / len(results) if results else 0.0


def aggregate_most_common_result(results: List[str]) -> str:
    """
    Aggregate results using the most common result.

    Args:
        results (List[str]): List of results from each iteration.

    Returns:
        str: The most common result.
    """
    result_counter = Counter(results)
    most_common_result = result_counter.most_common(1)[0][0]
    return most_common_result


def aggregate_weighted_vote(results: List[str], weights: List[int]) -> str:
    """
    Aggregate results using a weighted voting system.

    Args:
        results (List[str]): List of results from each iteration.
        weights (List[int]): List of weights corresponding to each result.

    Returns:
        str: The result with the highest weighted vote.
    """
    weighted_results = Counter()
    for result, weight in zip(results, weights):
        weighted_results[result] += weight

    weighted_result = weighted_results.most_common(1)[0][0]
    return weighted_result


def aggregate_consensus(results: List[str]) -> Optional[str]:
    """
    Aggregate results by checking if there's a consensus (all results are the same).

    Args:
        results (List[str]): List of results from each iteration.

    Returns:
        Optional[str]: The consensus result if there is one, otherwise None.
    """
    if all(result == results[0] for result in results):
        return results[0]
    else:
        return None


