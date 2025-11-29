# Dynamic Workflows with Zero Integration

## Overview

PolyMathOS now uses **Zero** (production-grade workflow automation) to dynamically generate and adapt workflows for maximum learning efficiency and effectiveness. The system creates adaptive workflows that adjust in real-time based on user progress, performance, and learning needs.

## Key Features

### 1. **Dynamic Workflow Generation**
- Automatically generates workflows for lesson plans, resource discovery, assessments, and more
- Workflows are customized based on user goals, preferences, and learning archetype
- Multi-phase workflows that adapt between learning phases

### 2. **Real-Time Adaptation**
- Workflows automatically adapt based on:
  - User progress (completion percentage)
  - Performance scores (comprehension levels)
  - Activity completion rates
  - Learning efficiency metrics

### 3. **Intelligent Workflow Orchestration**
- Monitors all active workflows
- Tracks progress across learning plans
- Triggers adaptations when needed
- Manages resource discovery and assessment workflows

### 4. **Workflow Templates**
- **Lesson Plan Workflow**: Generates and adapts lesson plans
- **Adaptive Learning Workflow**: Adapts learning path based on progress
- **Resource Discovery Workflow**: Discovers and integrates learning resources
- **Assessment Loop Workflow**: Continuous assessment and feedback

## Architecture

### Components

1. **DynamicWorkflowGenerator** (`backend/app/modules/dynamic_workflow_generator.py`)
   - Generates workflows from templates
   - Customizes workflows based on user needs
   - Creates adaptive workflows that adjust based on progress

2. **WorkflowOrchestrator** (`backend/app/modules/workflow_orchestrator.py`)
   - Monitors active workflows
   - Tracks progress and triggers adaptations
   - Manages workflow lifecycle

3. **Zero Integration** (`backend/app/modules/zero_integration.py`)
   - Production-grade workflow automation
   - Workflow execution engine
   - Workflow management

### API Endpoints

#### Dynamic Workflows (`/api/workflows/dynamic`)

- `POST /lesson-plan/generate` - Generate lesson plan workflow
- `POST /adaptive/create` - Create adaptive workflow
- `POST /adaptive/execute` - Execute workflow with adaptation
- `POST /multi-phase/generate` - Generate multi-phase workflow
- `POST /resources/generate` - Generate resource discovery workflow
- `POST /assessment/generate` - Generate assessment workflow
- `GET /templates` - Get available workflow templates

#### Workflow Orchestrator (`/api/workflows/orchestrator`)

- `POST /initialize` - Initialize complete workflow system
- `POST /progress/update` - Update progress and adapt workflows
- `POST /resources/trigger` - Trigger resource discovery
- `POST /assessment/trigger` - Trigger periodic assessment
- `GET /status/{learning_plan_id}` - Get workflow status

## Usage Examples

### Creating a Dynamic Lesson Plan

```python
from app.modules.dynamic_workflow_generator import get_dynamic_workflow_generator

generator = get_dynamic_workflow_generator()

workflow = generator.generate_lesson_plan_workflow(
    topic="Machine Learning",
    user_id="user123",
    goals={
        "goal_type": "mastery",
        "timeframe": "3 months",
        "target_comprehension": 90,
        "include_feynman": True,
        "include_memory_palace": True
    },
    user_profile={"archetype": "physicist"}
)
```

### Updating Progress and Adapting

```python
from app.modules.workflow_orchestrator import get_workflow_orchestrator

orchestrator = get_workflow_orchestrator()

result = await orchestrator.update_progress_and_adapt(
    learning_plan_id="plan123",
    activity_id="activity456",
    score=75.0,
    activity_type="quiz"
)

# Result includes adaptations applied
if result["status"] == "adapted":
    print(f"Applied {len(result['adaptations'])} adaptations")
```

### Initializing Complete Workflow System

```python
orchestrator = get_workflow_orchestrator()

workflow_system = await orchestrator.initialize_learning_workflow(
    user_id="user123",
    learning_plan_id="plan123",
    topic="Machine Learning",
    goals={...}
)

# System includes:
# - Lesson plan workflow
# - Resource discovery workflow
# - Assessment workflow
```

## Adaptation Rules

Workflows adapt based on the following rules:

### Low Performance (< 60%)
- Add support materials
- Reduce difficulty
- Increase examples
- Schedule additional reviews

### High Performance (> 90%)
- Add advanced content
- Increase difficulty
- Accelerate pace
- Add challenge activities

### Low Comprehension (< Target)
- Schedule spaced repetition reviews
- Add reinforcement activities
- Simplify concepts
- Increase practice frequency

### Progress-Based
- Adjust phase transitions
- Optimize activity sequencing
- Balance challenge and support
- Personalize learning path

## Frontend Integration

### Services

- **DynamicWorkflowService** (`src/services/DynamicWorkflowService.ts`)
  - Generate workflows
  - Execute adaptive workflows
  - Get workflow templates

- **WorkflowOrchestratorService** (`src/services/WorkflowOrchestratorService.ts`)
  - Initialize workflows
  - Update progress
  - Trigger resource discovery
  - Get workflow status

### Example Usage

```typescript
import { dynamicWorkflowService } from './services/DynamicWorkflowService';
import { workflowOrchestratorService } from './services/WorkflowOrchestratorService';

// Generate lesson plan workflow
const workflow = await dynamicWorkflowService.generateLessonPlanWorkflow({
  topic: "Machine Learning",
  user_id: "user123",
  goals: {
    goal_type: "mastery",
    timeframe: "3 months",
    target_comprehension: 90
  }
});

// Update progress (triggers adaptation)
await workflowOrchestratorService.updateProgress({
  learning_plan_id: "plan123",
  activity_id: "activity456",
  score: 75,
  activity_type: "quiz"
});
```

## Workflow Lifecycle

1. **Initialization**
   - User creates learning plan
   - System generates dynamic workflows
   - Workflows are registered and activated

2. **Execution**
   - User completes activities
   - Progress is tracked
   - Workflows execute automatically

3. **Adaptation**
   - Progress triggers adaptation analysis
   - System determines needed changes
   - Workflows are updated dynamically

4. **Optimization**
   - Efficiency metrics are calculated
   - Workflows are optimized over time
   - Learning path is refined

## Benefits

1. **Maximum Efficiency**
   - Workflows adapt to user pace
   - Optimized activity sequencing
   - Reduced time to mastery

2. **Maximum Effectiveness**
   - Personalized learning paths
   - Real-time difficulty adjustment
   - Targeted support when needed

3. **Automation**
   - Resource discovery automated
   - Assessment scheduling automated
   - Progress tracking automated

4. **Scalability**
   - Handles multiple learning plans
   - Manages complex workflows
   - Efficient resource utilization

## Configuration

### Environment Variables

```bash
# Zero configuration (if needed)
ZERO_API_URL=http://localhost:8080
ZERO_API_KEY=your_api_key
```

### Workflow Templates

Templates can be customized in `DynamicWorkflowGenerator._load_workflow_templates()`:

- Add new workflow types
- Customize workflow steps
- Define adaptation rules
- Configure triggers

## Monitoring

### Workflow Status

```python
status = orchestrator.get_workflow_status(learning_plan_id)

# Returns:
# - Workflow system configuration
# - Current progress
# - Efficiency metrics
# - Adaptation history
```

### Efficiency Metrics

- **Efficiency Score**: Comprehension vs Progress ratio
- **Comprehension Rate**: Current comprehension level
- **Progress Rate**: Overall completion percentage
- **Activities Per Day**: Learning velocity

## Best Practices

1. **Initialize workflows early**: Set up workflows when creating learning plans
2. **Update progress frequently**: Regular updates enable better adaptations
3. **Monitor efficiency**: Track metrics to optimize workflows
4. **Use templates**: Leverage workflow templates for consistency
5. **Handle errors gracefully**: Workflow failures shouldn't block learning

## Future Enhancements

- Machine learning-based workflow optimization
- Multi-user workflow collaboration
- Advanced analytics and insights
- Integration with external learning platforms
- Workflow marketplace for custom workflows

