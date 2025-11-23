"""
Intelligent LLM Router and Manager for PolyMathOS
Manages dynamic LLM switching based on task requirements, cost, quality, and availability
"""

import os
import time
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import logging
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class LLMProvider(Enum):
    """Supported LLM providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    GROQ = "groq"
    NVIDIA = "nvidia"
    DEEPSEEK = "deepseek"
    OLLAMA = "ollama"
    VLLM = "vllm"

@dataclass
class LLMConfig:
    """Configuration for an LLM"""
    provider: LLMProvider
    model_name: str
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    max_tokens: int = 4096
    temperature: float = 0.7
    cost_per_1k_tokens: float = 0.0
    speed_score: float = 5.0  # 1-10
    quality_score: float = 7.0  # 1-10
    context_window: int = 128000
    available: bool = True
    last_used: Optional[datetime] = None
    success_rate: float = 1.0
    avg_response_time: float = 0.0

@dataclass
class TaskRequirements:
    """Requirements for a specific task"""
    task_type: str
    priority: str = "quality"  # quality, speed, cost
    required_context: int = 0
    complexity: str = "medium"  # low, medium, high
    domain: Optional[str] = None
    requires_reasoning: bool = False
    requires_creativity: bool = False
    requires_code: bool = False

class IntelligentLLMRouter:
    """
    Intelligent LLM Router that selects optimal models based on task requirements
    """
    
    def __init__(self):
        self.llm_configs: Dict[str, LLMConfig] = {}
        self.usage_history: List[Dict] = []
        self.performance_metrics: Dict[str, Dict] = {}
        self._initialize_default_configs()
    
    def _initialize_default_configs(self):
        """Initialize default LLM configurations"""
        default_configs = [
            LLMConfig(
                provider=LLMProvider.OPENAI,
                model_name="gpt-4o",
                cost_per_1k_tokens=2.50,
                speed_score=8.0,
                quality_score=10.0,
                context_window=128000
            ),
            LLMConfig(
                provider=LLMProvider.OPENAI,
                model_name="gpt-4o-mini",
                cost_per_1k_tokens=0.15,
                speed_score=10.0,
                quality_score=7.0,
                context_window=128000
            ),
            LLMConfig(
                provider=LLMProvider.ANTHROPIC,
                model_name="claude-sonnet-4",
                cost_per_1k_tokens=3.00,
                speed_score=9.0,
                quality_score=10.0,
                context_window=200000
            ),
            LLMConfig(
                provider=LLMProvider.GOOGLE,
                model_name="gemini-pro",
                cost_per_1k_tokens=0.50,
                speed_score=8.0,
                quality_score=9.0,
                context_window=1000000
            ),
            LLMConfig(
                provider=LLMProvider.GROQ,
                model_name="llama-3.1-70b",
                cost_per_1k_tokens=0.10,
                speed_score=10.0,
                quality_score=8.0,
                context_window=128000
            ),
            LLMConfig(
                provider=LLMProvider.DEEPSEEK,
                model_name="deepseek-chat",
                cost_per_1k_tokens=0.14,
                speed_score=9.0,
                quality_score=9.0,
                context_window=64000
            ),
            LLMConfig(
                provider=LLMProvider.OLLAMA,
                model_name="llama3",
                cost_per_1k_tokens=0.0,  # Local
                speed_score=7.0,
                quality_score=8.0,
                context_window=128000
            )
        ]
        
        for config in default_configs:
            key = f"{config.provider.value}:{config.model_name}"
            self.llm_configs[key] = config
            self.performance_metrics[key] = {
                "total_requests": 0,
                "successful_requests": 0,
                "total_tokens": 0,
                "total_cost": 0.0,
                "avg_response_time": 0.0,
                "error_count": 0
            }
    
    def register_llm(self, config: LLMConfig):
        """Register a new LLM configuration"""
        key = f"{config.provider.value}:{config.model_name}"
        self.llm_configs[key] = config
        if key not in self.performance_metrics:
            self.performance_metrics[key] = {
                "total_requests": 0,
                "successful_requests": 0,
                "total_tokens": 0,
                "total_cost": 0.0,
                "avg_response_time": 0.0,
                "error_count": 0
            }
        logger.info(f"Registered LLM: {key}")
    
    def select_optimal_llm(self, requirements: TaskRequirements) -> Tuple[str, LLMConfig]:
        """
        Select optimal LLM based on task requirements
        
        Returns:
            Tuple of (llm_key, LLMConfig)
        """
        # Filter available LLMs
        available_configs = {
            k: v for k, v in self.llm_configs.items()
            if v.available and v.context_window >= requirements.required_context
        }
        
        if not available_configs:
            # Fallback to any available
            available_configs = {k: v for k, v in self.llm_configs.items() if v.available}
        
        if not available_configs:
            raise ValueError("No available LLMs configured")
        
        # Score each LLM based on requirements
        scored_llms = []
        for key, config in available_configs.items():
            score = self._calculate_llm_score(config, requirements)
            scored_llms.append((score, key, config))
        
        # Sort by score (highest first)
        scored_llms.sort(reverse=True, key=lambda x: x[0])
        
        # Get best match
        best_score, best_key, best_config = scored_llms[0]
        
        logger.info(f"Selected LLM: {best_key} (score: {best_score:.2f}) for task: {requirements.task_type}")
        
        return best_key, best_config
    
    def _calculate_llm_score(self, config: LLMConfig, requirements: TaskRequirements) -> float:
        """Calculate suitability score for an LLM given task requirements"""
        score = 0.0
        
        # Priority-based weighting
        if requirements.priority == "quality":
            score += config.quality_score * 0.5
            score += config.speed_score * 0.2
            score += (1.0 / (config.cost_per_1k_tokens + 0.01)) * 0.3
        elif requirements.priority == "speed":
            score += config.speed_score * 0.5
            score += config.quality_score * 0.3
            score += (1.0 / (config.cost_per_1k_tokens + 0.01)) * 0.2
        elif requirements.priority == "cost":
            score += (1.0 / (config.cost_per_1k_tokens + 0.01)) * 0.5
            score += config.quality_score * 0.3
            score += config.speed_score * 0.2
        
        # Task-specific adjustments
        if requirements.requires_reasoning:
            # Prefer high-quality models
            score += config.quality_score * 0.2
        
        if requirements.requires_creativity:
            # Prefer models with large context windows
            score += (config.context_window / 100000) * 0.1
        
        if requirements.requires_code:
            # Prefer code-specialized models
            if "code" in config.model_name.lower() or "gpt-4" in config.model_name.lower():
                score += 2.0
        
        # Performance history adjustment
        metrics = self.performance_metrics.get(f"{config.provider.value}:{config.model_name}", {})
        if metrics.get("total_requests", 0) > 0:
            success_rate = metrics["successful_requests"] / metrics["total_requests"]
            score *= success_rate
        
        # Recency bonus (prefer recently used models)
        if config.last_used:
            time_since_use = (datetime.now() - config.last_used).total_seconds()
            if time_since_use < 3600:  # Used in last hour
                score += 0.5
        
        return score
    
    def record_usage(self, llm_key: str, success: bool, tokens: int, response_time: float, cost: float = None):
        """Record LLM usage for performance tracking"""
        metrics = self.performance_metrics.get(llm_key, {})
        metrics["total_requests"] = metrics.get("total_requests", 0) + 1
        
        if success:
            metrics["successful_requests"] = metrics.get("successful_requests", 0) + 1
        else:
            metrics["error_count"] = metrics.get("error_count", 0) + 1
        
        metrics["total_tokens"] = metrics.get("total_tokens", 0) + tokens
        
        # Update average response time
        current_avg = metrics.get("avg_response_time", 0.0)
        total_reqs = metrics["total_requests"]
        metrics["avg_response_time"] = ((current_avg * (total_reqs - 1)) + response_time) / total_reqs
        
        # Update cost
        if cost is not None:
            metrics["total_cost"] = metrics.get("total_cost", 0.0) + cost
        elif llm_key in self.llm_configs:
            config = self.llm_configs[llm_key]
            estimated_cost = (tokens / 1000) * config.cost_per_1k_tokens
            metrics["total_cost"] = metrics.get("total_cost", 0.0) + estimated_cost
        
        # Update config
        if llm_key in self.llm_configs:
            self.llm_configs[llm_key].last_used = datetime.now()
            self.llm_configs[llm_key].success_rate = metrics["successful_requests"] / metrics["total_requests"]
            self.llm_configs[llm_key].avg_response_time = metrics["avg_response_time"]
        
        # Record in history
        self.usage_history.append({
            "llm_key": llm_key,
            "timestamp": datetime.now().isoformat(),
            "success": success,
            "tokens": tokens,
            "response_time": response_time,
            "cost": cost or (tokens / 1000) * self.llm_configs.get(llm_key, LLMConfig(
                provider=LLMProvider.OPENAI,
                model_name="unknown"
            )).cost_per_1k_tokens
        })
        
        # Keep history limited
        if len(self.usage_history) > 10000:
            self.usage_history = self.usage_history[-5000:]
    
    def get_performance_report(self) -> Dict:
        """Get performance report for all LLMs"""
        return {
            "llm_configs": {k: asdict(v) for k, v in self.llm_configs.items()},
            "performance_metrics": self.performance_metrics,
            "total_usage": len(self.usage_history),
            "recent_usage": self.usage_history[-100:] if self.usage_history else []
        }
    
    def auto_switch_on_failure(self, current_llm_key: str, error_type: str) -> Optional[Tuple[str, LLMConfig]]:
        """Automatically switch to alternative LLM on failure"""
        logger.warning(f"LLM {current_llm_key} failed with error: {error_type}")
        
        # Mark current LLM as temporarily unavailable
        if current_llm_key in self.llm_configs:
            self.llm_configs[current_llm_key].available = False
        
        # Find alternative
        available = {k: v for k, v in self.llm_configs.items() 
                    if v.available and k != current_llm_key}
        
        if available:
            # Select best alternative
            best_key = max(available.keys(), 
                          key=lambda k: self.llm_configs[k].quality_score)
            return best_key, self.llm_configs[best_key]
        
        return None

# Global router instance
llm_router = IntelligentLLMRouter()

