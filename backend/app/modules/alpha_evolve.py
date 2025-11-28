"""
OpenAlphaEvolve - Advanced Neural Architecture Evolution System
Enhanced evolutionary algorithm for neural network optimization with:
- Novelty Search for behavioral diversity
- Population Based Training (PBT) for efficient hyperparameter optimization
- Multi-objective optimization
- Advanced crossover and mutation strategies
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import numpy as np
import random
from typing import List, Tuple, Dict, Any, Optional
from dataclasses import dataclass
import copy
from abc import ABC, abstractmethod
import logging
from collections import deque
import time

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Genome:
    """Represents neural network architecture and hyperparameters"""
    layers: List[int]
    activation_functions: List[str]
    learning_rates: List[float]
    dropout_rates: List[float]
    batch_norm: List[bool]
    
    def __post_init__(self):
        if len(self.layers) != len(self.dropout_rates) + 1:
            raise ValueError("Dropout rates should be one less than layers")
        if len(self.activation_functions) != len(self.layers) - 1:
            raise ValueError("Activation functions should match layer transitions")

class NeuralNetwork(nn.Module):
    """Dynamic neural network based on genome specification"""
    def __init__(self, genome: Genome):
        super().__init__()
        self.genome = genome
        self.layers = nn.ModuleList()
        
        for i in range(len(genome.layers) - 1):
            layer = nn.Linear(genome.layers[i], genome.layers[i+1])
            self.layers.append(layer)
            
            # Add batch normalization if specified
            if i < len(genome.batch_norm) and genome.batch_norm[i]:
                self.layers.append(nn.BatchNorm1d(genome.layers[i+1]))
                
            # Add activation function
            if i < len(genome.activation_functions):
                act_func = genome.activation_functions[i]
                if act_func == 'relu':
                    self.layers.append(nn.ReLU())
                elif act_func == 'tanh':
                    self.layers.append(nn.Tanh())
                elif act_func == 'sigmoid':
                    self.layers.append(nn.Sigmoid())
                    
            # Add dropout
            if i < len(genome.dropout_rates):
                self.layers.append(nn.Dropout(genome.dropout_rates[i]))
    
    def forward(self, x):
        for layer in self.layers:
            x = layer(x)
        return x

class AgentMetrics:
    """Track various performance metrics for agents"""
    def __init__(self):
        self.fitness_history = []
        self.age = 0
        self.evaluations = 0
        self.improvement_rate = 0.0
        self.diversity_score = 0.0
        
    def update_fitness(self, fitness: float):
        self.fitness_history.append(fitness)
        self.evaluations += 1
        if len(self.fitness_history) > 1:
            self.improvement_rate = (
                self.fitness_history[-1] - self.fitness_history[0]
            ) / len(self.fitness_history)

class EvolutionaryAgent:
    """Enhanced evolutionary agent with multiple optimization strategies"""
    def __init__(self, genome: Genome, agent_id: str = None):
        self.id = agent_id or f"agent_{random.randint(1000, 9999)}"
        self.genome = genome
        self.model = NeuralNetwork(genome)
        self.metrics = AgentMetrics()
        self.optimizer_state = None  # Store optimizer state for PBT
        self.last_performance = 0.0
        self.behavior_characterization = []  # For novelty search
        
    def compute_fitness(self, dataloader: DataLoader, device: str = 'cpu') -> float:
        """Enhanced fitness computation with multiple metrics"""
        self.model.to(device)
        self.model.eval()
        
        correct = 0
        total = 0
        loss_sum = 0.0
        criterion = nn.CrossEntropyLoss()
        
        with torch.no_grad():
            for inputs, targets in dataloader:
                inputs, targets = inputs.to(device), targets.to(device)
                outputs = self.model(inputs)
                loss = criterion(outputs, targets)
                loss_sum += loss.item()
                
                _, predicted = torch.max(outputs.data, 1)
                total += targets.size(0)
                correct += (predicted == targets).sum().item()
        
        accuracy = correct / total if total > 0 else 0.0
        avg_loss = loss_sum / len(dataloader) if len(dataloader) > 0 else float('inf')
        
        # Multi-objective fitness combining accuracy and efficiency penalty
        size_penalty = sum(p.numel() for p in self.model.parameters()) / 1e6  # Parameters in millions
        fitness = accuracy - 0.01 * size_penalty  # Size regularization
        
        self.metrics.update_fitness(fitness)
        self.last_performance = fitness
        return fitness
    
    def train_step(self, dataloader: DataLoader, epochs: int = 1, 
                   device: str = 'cpu', max_batches: int = None) -> float:
        """Train agent for specified epochs with gradient descent"""
        self.model.to(device)
        self.model.train()
        optimizer = optim.Adam(self.model.parameters(), lr=self.genome.learning_rates[0])
        criterion = nn.CrossEntropyLoss()
        
        if self.optimizer_state is not None:
            optimizer.load_state_dict(self.optimizer_state)
        
        total_loss = 0.0
        batch_count = 0
        
        for epoch in range(epochs):
            for batch_idx, (inputs, targets) in enumerate(dataloader):
                if max_batches and batch_count >= max_batches:
                    break
                    
                inputs, targets = inputs.to(device), targets.to(device)
                optimizer.zero_grad()
                outputs = self.model(inputs)
                loss = criterion(outputs, targets)
                loss.backward()
                optimizer.step()
                
                total_loss += loss.item()
                batch_count += 1
        
        self.optimizer_state = optimizer.state_dict()
        return total_loss / batch_count if batch_count > 0 else 0.0
    
    def mutate(self, mutation_rate: float = 0.1, mutation_strength: float = 0.1):
        """Enhanced mutation with multiple types"""
        new_genome = copy.deepcopy(self.genome)
        
        # Mutate learning rates
        for i in range(len(new_genome.learning_rates)):
            if random.random() < mutation_rate:
                new_genome.learning_rates[i] *= (1 + random.gauss(0, mutation_strength))
                new_genome.learning_rates[i] = max(1e-6, min(1.0, new_genome.learning_rates[i]))
        
        # Mutate dropout rates
        for i in range(len(new_genome.dropout_rates)):
            if random.random() < mutation_rate:
                new_genome.dropout_rates[i] += random.gauss(0, mutation_strength)
                new_genome.dropout_rates[i] = max(0.0, min(0.9, new_genome.dropout_rates[i]))
        
        # Mutate activation functions
        activation_options = ['relu', 'tanh', 'sigmoid']
        for i in range(len(new_genome.activation_functions)):
            if random.random() < mutation_rate * 0.1:  # Lower rate for architecture changes
                new_genome.activation_functions[i] = random.choice(activation_options)
        
        # Add/remove layers with low probability
        if len(new_genome.layers) > 2 and random.random() < mutation_rate * 0.05:
            idx = random.randint(1, len(new_genome.layers) - 2)
            new_genome.layers.pop(idx)
            if idx-1 < len(new_genome.dropout_rates):
                new_genome.dropout_rates.pop(idx-1)
            if idx-1 < len(new_genome.activation_functions):
                new_genome.activation_functions.pop(idx-1)
        
        self.genome = new_genome
        self.model = NeuralNetwork(new_genome)  # Rebuild model
    
    def crossover(self, other_agent: 'EvolutionaryAgent') -> 'EvolutionaryAgent':
        """Advanced crossover with uniform mixing"""
        # Mix genomes uniformly
        new_layers = []
        min_len = min(len(self.genome.layers), len(other_agent.genome.layers))
        max_len = max(len(self.genome.layers), len(other_agent.genome.layers))
        
        # Handle layer size differences
        for i in range(max_len):
            if i < min_len:
                # Mix existing layers
                if random.random() < 0.5:
                    new_layers.append(self.genome.layers[i])
                else:
                    new_layers.append(other_agent.genome.layers[i])
            else:
                # Take remaining layers from longer genome
                if len(self.genome.layers) > len(other_agent.genome.layers):
                    new_layers.append(self.genome.layers[i])
                else:
                    new_layers.append(other_agent.genome.layers[i])
        
        # Mix other parameters
        new_activation_functions = []
        min_act_len = min(len(self.genome.activation_functions), 
                         len(other_agent.genome.activation_functions))
        for i in range(min_act_len):
            if random.random() < 0.5:
                new_activation_functions.append(self.genome.activation_functions[i])
            else:
                new_activation_functions.append(other_agent.genome.activation_functions[i])
        
        # Interpolate learning rates
        new_learning_rates = []
        for lr1, lr2 in zip(self.genome.learning_rates, 
                           other_agent.genome.learning_rates):
            new_lr = 0.5 * (lr1 + lr2) + random.gauss(0, 0.01)
            new_learning_rates.append(max(1e-6, min(1.0, new_lr)))
        
        # Create new genome
        new_genome = Genome(
            layers=new_layers,
            activation_functions=new_activation_functions,
            learning_rates=new_learning_rates,
            dropout_rates=[0.1] * (len(new_layers) - 1),  # Simplified
            batch_norm=[True] * (len(new_layers) - 1)
        )
        
        return EvolutionaryAgent(new_genome)

class NoveltyArchive:
    """Maintains behavioral diversity using novelty search"""
    def __init__(self, k: int = 15):
        self.archive = []
        self.k = k  # Number of nearest neighbors for sparsity calculation
    
    def add_behavior(self, behavior: List[float]):
        """Add new behavior characterization to archive"""
        self.archive.append(behavior)
    
    def calculate_novelty(self, behavior: List[float]) -> float:
        """Calculate novelty score based on distance to archived behaviors"""
        if not self.archive:
            return 1.0
            
        distances = []
        for archived_behavior in self.archive:
            dist = np.linalg.norm(np.array(behavior) - np.array(archived_behavior))
            distances.append(dist)
        
        # Return average distance to k nearest neighbors
        distances.sort()
        k_nearest = distances[:min(self.k, len(distances))]
        return sum(k_nearest) / len(k_nearest) if k_nearest else 1.0

class PopulationBasedTrainer:
    """Implements Population Based Training for efficient evolution"""
    def __init__(self, exploit_threshold: float = 0.2, explore_factor: float = 0.2):
        self.exploit_threshold = exploit_threshold
        self.explore_factor = explore_factor
        self.trainer_states = {}  # Store trainer states per agent
    
    def exploit_and_explore(self, population: List[EvolutionaryAgent]) -> List[EvolutionaryAgent]:
        """Perform exploit/explore operations"""
        # Sort by performance
        sorted_population = sorted(population, key=lambda x: x.last_performance, reverse=True)
        top_performers = sorted_population[:len(sorted_population)//2]
        
        new_population = []
        for agent in population:
            if agent.last_performance < sorted_population[len(sorted_population)//2].last_performance:
                # Exploit: copy from better performer
                donor = random.choice(top_performers)
                new_agent = copy.deepcopy(donor)
                new_agent.id = f"{agent.id}_exploited"
                
                # Explore: perturb hyperparameters
                new_agent.genome.learning_rates = [
                    lr * (1 + random.uniform(-self.explore_factor, self.explore_factor))
                    for lr in new_agent.genome.learning_rates
                ]
                new_agent.mutate(mutation_rate=0.1, mutation_strength=0.05)
                
                new_population.append(new_agent)
            else:
                new_population.append(agent)
        
        return new_population

class AdvancedAlphaEvolve:
    """Complete enhanced evolutionary system"""
    def __init__(self, 
                 population_size: int = 20,
                 use_novelty_search: bool = True,
                 use_pbt: bool = True,
                 multi_objective: bool = True):
        
        self.population_size = population_size
        self.agents: List[EvolutionaryAgent] = []
        self.generation = 0
        self.best_fitness = float('-inf')
        self.best_agent = None
        
        # Enhanced features
        self.use_novelty_search = use_novelty_search
        self.novelty_archive = NoveltyArchive() if use_novelty_search else None
        self.use_pbt = use_pbt
        self.pbt_trainer = PopulationBasedTrainer() if use_pbt else None
        self.multi_objective = multi_objective
        
        # Adaptive parameters
        self.mutation_rate = 0.1
        self.crossover_rate = 0.7
        self.elitism_rate = 0.1
        
        logger.info(f"Initialized AlphaEvolve with {population_size} agents")
    
    def create_initial_genome(self, input_size: int, output_size: int) -> Genome:
        """Create initial genome with reasonable defaults"""
        layers = [input_size, 64, 32, output_size]
        return Genome(
            layers=layers,
            activation_functions=['relu', 'relu', 'linear'],
            learning_rates=[0.001, 0.001, 0.001],
            dropout_rates=[0.2, 0.2, 0.0],
            batch_norm=[True, True, False]
        )
    
    def initialize_population(self, input_size: int, output_size: int):
        """Initialize diverse population"""
        logger.info("Initializing population...")
        
        for i in range(self.population_size):
            # Vary initial architectures
            hidden_sizes = [random.randint(16, 128) for _ in range(random.randint(1, 4))]
            layers = [input_size] + hidden_sizes + [output_size]
            
            genome = Genome(
                layers=layers,
                activation_functions=['relu'] * (len(layers) - 1),
                learning_rates=[random.uniform(0.0001, 0.01) for _ in range(len(layers) - 1)],
                dropout_rates=[random.uniform(0.0, 0.5) for _ in range(len(layers) - 1)],
                batch_norm=[random.choice([True, False]) for _ in range(len(layers) - 1)]
            )
            
            agent = EvolutionaryAgent(genome, f"initial_{i}")
            self.agents.append(agent)
        
        logger.info(f"Population initialized with {len(self.agents)} agents")
    
    def evaluate_population(self, dataloader: DataLoader, device: str = 'cpu', 
                          quick_eval: bool = False) -> List[float]:
        """Evaluate entire population"""
        logger.info(f"Evaluating generation {self.generation} population...")
        fitness_scores = []
        
        max_batches = 10 if quick_eval else None  # Quick evaluation during early generations
        
        for i, agent in enumerate(self.agents):
            try:
                # Quick pre-training if needed
                if self.generation > 0:
                    agent.train_step(dataloader, epochs=1, device=device, max_batches=max_batches)
                
                fitness = agent.compute_fitness(dataloader, device)
                
                # Apply novelty bonus if enabled
                if self.use_novelty_search and agent.behavior_characterization:
                    novelty_score = self.novelty_archive.calculate_novelty(
                        agent.behavior_characterization
                    )
                    fitness += 0.1 * novelty_score
                
                fitness_scores.append(fitness)
                
                if fitness > self.best_fitness:
                    self.best_fitness = fitness
                    self.best_agent = copy.deepcopy(agent)
                    logger.info(f"New best fitness: {fitness:.4f}")
                
            except Exception as e:
                logger.warning(f"Error evaluating agent {agent.id}: {e}")
                fitness_scores.append(float('-inf'))
        
        return fitness_scores
    
    def select_parents(self, fitness_scores: List[float]) -> List[EvolutionaryAgent]:
        """Tournament selection with elitism"""
        # Elitism: keep best performers
        elite_count = max(1, int(self.elitism_rate * len(self.agents)))
        elite_indices = np.argsort(fitness_scores)[-elite_count:]
        parents = [self.agents[i] for i in elite_indices]
        
        # Tournament selection for remaining slots
        tournament_size = 3
        remaining_slots = self.population_size - elite_count
        
        for _ in range(remaining_slots):
            tournament_indices = random.sample(range(len(self.agents)), tournament_size)
            tournament_fitness = [fitness_scores[i] for i in tournament_indices]
            winner_idx = tournament_indices[np.argmax(tournament_fitness)]
            parents.append(copy.deepcopy(self.agents[winner_idx]))
        
        return parents
    
    def evolve_generation(self):
        """Perform one complete generation of evolution"""
        logger.info(f"Evolving generation {self.generation}")
        
        # Selection
        # Note: Fitness scores should already be computed in evaluate_population
        # For demonstration, we'll sort by last_performance
        fitness_scores = [agent.last_performance for agent in self.agents]
        parents = self.select_parents(fitness_scores)
        
        # Apply PBT if enabled
        if self.use_pbt and self.generation > 0:
            parents = self.pbt_trainer.exploit_and_explore(parents)
        
        # Create new population through crossover and mutation
        new_population = []
        
        # Keep elites unchanged
        elite_count = max(1, int(self.elitism_rate * self.population_size))
        new_population.extend(parents[:elite_count])
        
        # Generate offspring
        while len(new_population) < self.population_size:
            parent1, parent2 = random.sample(parents, 2)
            
            if random.random() < self.crossover_rate:
                # Crossover
                offspring = parent1.crossover(parent2)
            else:
                # Asexual reproduction with mutation
                offspring = copy.deepcopy(random.choice([parent1, parent2]))
            
            # Mutation
            offspring.mutate(mutation_rate=self.mutation_rate)
            new_population.append(offspring)
        
        self.agents = new_population[:self.population_size]
        self.generation += 1
        
        # Adapt parameters based on performance
        self._adapt_parameters()
    
    def _adapt_parameters(self):
        """Adaptively adjust evolutionary parameters"""
        # Reduce mutation rate over time for fine-tuning
        if self.generation > 10:
            self.mutation_rate = max(0.01, self.mutation_rate * 0.98)
    
    def run_evolution(self, 
                     train_dataloader: DataLoader,
                     val_dataloader: DataLoader,
                     generations: int = 50,
                     device: str = 'cpu',
                     patience: int = 10) -> EvolutionaryAgent:
        """Run complete evolutionary process"""
        logger.info(f"Starting evolution for {generations} generations")
        
        if not self.agents:
            input_size = next(iter(train_dataloader))[0].shape[1:].numel()
            output_size = len(set(next(iter(train_dataloader))[1].numpy()))
            self.initialize_population(input_size, output_size)
        
        best_fitness_history = []
        no_improvement_count = 0
        
        for gen in range(generations):
            start_time = time.time()
            
            # Evaluate population (quick eval for early gens)
            quick_eval = gen < generations * 0.3
            fitness_scores = self.evaluate_population(
                train_dataloader, device, quick_eval=quick_eval
            )
            
            current_best = max(fitness_scores)
            best_fitness_history.append(current_best)
            
            logger.info(f"Generation {gen}: Best fitness = {current_best:.4f}, "
                       f"Time = {time.time() - start_time:.2f}s")
            
            # Early stopping check
            if current_best > self.best_fitness:
                no_improvement_count = 0
            else:
                no_improvement_count += 1
            
            if no_improvement_count >= patience:
                logger.info(f"Early stopping at generation {gen}")
                break
            
            # Evolve to next generation
            self.evolve_generation()
        
        logger.info(f"Evolution completed. Best fitness: {self.best_fitness:.4f}")
        return self.best_agent

# Example usage with synthetic data
class SyntheticDataset(Dataset):
    """Synthetic dataset for testing"""
    def __init__(self, num_samples: int = 1000, input_dim: int = 784, num_classes: int = 10):
        self.data = torch.randn(num_samples, input_dim)
        self.targets = torch.randint(0, num_classes, (num_samples,))
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        return self.data[idx], self.targets[idx]

def main():
    """Example usage of the enhanced AlphaEvolve system"""
    # Create synthetic datasets
    train_dataset = SyntheticDataset(1000, 784, 10)
    val_dataset = SyntheticDataset(200, 784, 10)
    
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)
    
    # Initialize and run evolution
    alpha_evolve = AdvancedAlphaEvolve(
        population_size=15,
        use_novelty_search=True,
        use_pbt=True,
        multi_objective=True
    )
    
    # Run evolution
    best_agent = alpha_evolve.run_evolution(
        train_dataloader=train_loader,
        val_dataloader=val_loader,
        generations=20,
        device='cuda' if torch.cuda.is_available() else 'cpu',
        patience=5
    )
    
    # Final evaluation
    final_fitness = best_agent.compute_fitness(
        val_loader, 
        device='cuda' if torch.cuda.is_available() else 'cpu'
    )
    
    logger.info(f"Final best agent fitness: {final_fitness:.4f}")
    logger.info(f"Best agent architecture: {best_agent.genome.layers}")

if __name__ == "__main__":
    main()

