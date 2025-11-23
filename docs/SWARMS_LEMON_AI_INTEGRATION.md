# Swarms & Lemon AI Integration Guide

## Overview

PolyMathOS now fully integrates the **Swarms framework** (https://github.com/kyegomez/swarms.git) for agentic LLM operations and **Lemon AI** (https://github.com/hexdocom/lemonai.git) for self-evolving agents. **ALL LLM operations in PolyMathOS are now agentic**, meaning they go through intelligent agents that can think, plan, and refine their responses.

## Key Features

### 1. **Fully Agentic LLM Operations**
- All LLM calls go through Swarms agents, not direct API calls
- Agents can think, plan, and refine responses (max_loops=3)
- Intelligent agent selection based on task type
- Automatic performance tracking and optimization

### 2. **Self-Evolving Agents with Lemon AI**
- Every agent evolves based on performance
- Evolution happens automatically after every 10 tasks
- Agents learn from failures and improve over time
- Evolution history is tracked and incorporated into agent prompts

### 3. **Intelligent Agent Selection**
- Task-specific agents for different operations:
  - `learning_content`: Content generation
  - `research`: Research & discovery
  - `curriculum`: Curriculum planning
  - `assessment`: Assessment & feedback
  - `personalization`: Content personalization
  - `code`: Code generation & execution
  - `synthesis`: Knowledge synthesis

## Architecture

### Core Components

1. **SwarmsAgenticSystem** (`backend/app/modules/swarms_agentic_system.py`)
   - Main agentic system that manages all Swarms agents
   - Integrates with Lemon AI for evolution
   - Provides unified interface for agentic processing

2. **AgenticLLMWrapper** (`backend/app/modules/agentic_llm_wrapper.py`)
   - Wrapper that ensures ALL LLM calls are agentic
   - Provides convenient functions for common operations
   - Handles async/sync conversion

3. **PolyMathOSCollaborationSwarm** (Updated)
   - Multi-agent collaboration system
   - Now uses Swarms Agentic System for all agent operations
   - Maintains backward compatibility with fallback

## Usage

### Basic Agentic Content Generation

```python
from app.modules.agentic_llm_wrapper import agentic_llm, generate_content_agentically

# Async usage
result = await generate_content_agentically(
    prompt="Explain quantum computing",
    task_type="content_generation",
    context={"difficulty": "intermediate"},
    priority="quality"
)

print(result["content"])
print(f"Model used: {result['model_used']}")
print(f"Evolution applied: {result['evolution_applied']}")

# Sync usage
from app.modules.agentic_llm_wrapper import generate_content_agentically_sync

result = generate_content_agentically_sync(
    prompt="Create a lesson on machine learning",
    task_type="lesson_generation"
)
```

### Specialized Agentic Operations

```python
# Generate lesson content
lesson = await agentic_llm.generate_lesson_content(
    topic="Neural Networks",
    context={"level": "advanced", "duration": "60 minutes"}
)

# Generate research report
report = await agentic_llm.generate_research_report(
    query="Quantum machine learning applications",
    context={"sources": ["arxiv", "pubmed"]}
)

# Generate curriculum
curriculum = await agentic_llm.generate_curriculum(
    domains=["Mathematics", "Physics", "Computer Science"],
    duration="12 weeks"
)

# Generate assessment
assessment = await agentic_llm.generate_assessment(
    topic="Calculus",
    difficulty="advanced"
)

# Personalize content
personalized = await agentic_llm.personalize_content(
    content="Introduction to Python",
    learner_profile={
        "level": "beginner",
        "learning_style": "visual",
        "prior_knowledge": ["basic programming"]
    }
)

# Synthesize knowledge
synthesis = await agentic_llm.synthesize_knowledge(
    concepts=["Quantum Mechanics", "Machine Learning", "Information Theory"]
)

# Generate code
code = await agentic_llm.generate_code(
    requirement="Implement a neural network from scratch",
    language="python"
)
```

### Multi-Agent Collaboration

```python
from app.modules.multi_agent import PolyMathOSCollaborationSwarm

swarm = PolyMathOSCollaborationSwarm(priority="quality")

result = swarm.solve_complex_problem({
    "problem": "Design a comprehensive learning path for quantum computing",
    "domains": ["Physics", "Mathematics", "Computer Science"],
    "duration": "6 months"
})

print(result.final_solution)
```

## Agent Evolution

### Automatic Evolution

Agents automatically evolve based on:
- **Performance metrics**: Success rate, quality scores, execution time
- **Task outcomes**: Success/failure, error types, user feedback
- **Pattern recognition**: Successful approaches, common failures

### Evolution Triggers

1. **Periodic Evolution**: Every 10 tasks
2. **Failure-Based Evolution**: Immediately after task failure
3. **Quality-Based Evolution**: When quality score < 0.7

### Evolution Process

1. Performance analysis
2. Improvement identification
3. Agent configuration update
4. Prompt refinement
5. Version increment
6. History tracking

### Viewing Evolution History

```python
from app.modules.lemon_ai_integration import lemon_ai_integration

history = lemon_ai_integration.get_agent_evolution_history("learning_content_generator")
print(f"Total evolutions: {history['total_evolutions']}")
print(f"Evolution history: {history['evolution_history']}")
```

## Performance Tracking

### Agent Performance Reports

```python
from app.modules.swarms_agentic_system import agentic_system

# Get performance for specific agent
report = agentic_system.get_agent_performance_report("learning_content_generator")
print(f"Total tasks: {report['total_tasks']}")
print(f"Success rate: {report['success_rate']}")

# Get performance for all agents
all_reports = agentic_system.get_agent_performance_report()
```

## Configuration

### Environment Variables

No additional environment variables required. The system uses existing LLM API keys configured in your `.env` file.

### Swarms Configuration

The Swarms framework is automatically configured with:
- Intelligent LLM router for model selection
- Lemon AI integration for evolution
- Performance tracking
- Error handling and fallbacks

## Migration Guide

### Replacing Direct LLM Calls

**Before:**
```python
# Direct LLM call
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": prompt}]
)
```

**After:**
```python
# Agentic call
from app.modules.agentic_llm_wrapper import generate_content_agentically

result = await generate_content_agentically(
    prompt=prompt,
    task_type="content_generation"
)
content = result["content"]
```

### Updating Existing Code

1. Import the agentic wrapper:
   ```python
   from app.modules.agentic_llm_wrapper import agentic_llm
   ```

2. Replace direct LLM calls with agentic calls:
   ```python
   # Old
   response = llm_service.generate(prompt)
   
   # New
   response = await agentic_llm.generate_content(
       prompt=prompt,
       task_type="content_generation"
   )
   ```

3. Use appropriate task types for better agent selection:
   - `content_generation` / `lesson_generation`
   - `research`
   - `curriculum`
   - `assessment`
   - `personalization`
   - `code`
   - `knowledge_synthesis`

## Benefits

1. **Better Quality**: Agents can think and refine responses
2. **Self-Improvement**: Agents evolve and get better over time
3. **Intelligent Routing**: Right agent for the right task
4. **Performance Tracking**: Monitor and optimize agent performance
5. **Error Recovery**: Agents learn from failures
6. **Consistency**: Unified interface for all LLM operations

## Troubleshooting

### Swarms Not Available

If you see warnings about Swarms not being available:
```bash
pip install swarms>=2.0.0
```

### Lemon AI Not Available

Lemon AI integration is optional. The system will work without it, but agents won't evolve. To enable:
1. Install Lemon AI (see Lemon AI documentation)
2. Set `LEMON_AI_PATH` environment variable if needed

### Agent Selection Issues

If agents aren't being selected correctly:
1. Check task_type matches available agents
2. Verify agentic_system is initialized
3. Check logs for agent creation errors

## References

- **Swarms Framework**: https://github.com/kyegomez/swarms.git
- **Lemon AI**: https://github.com/hexdocom/lemonai.git
- **PolyMathOS Documentation**: See `docs/` directory

## Support

For issues or questions:
1. Check logs for detailed error messages
2. Verify all dependencies are installed
3. Ensure API keys are configured
4. Review agent performance reports




