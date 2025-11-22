# PolyMathOS - Comprehensive Usage Guide

Complete guide to all features with detailed explanations and test examples.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Learning Features](#core-learning-features)
3. [AI-Powered Features](#ai-powered-features)
4. [Quantum Computing Features](#quantum-computing-features)
5. [Multi-Agent Collaboration](#multi-agent-collaboration)
6. [Intelligent LLM Router](#intelligent-llm-router)
7. [Self-Evolving Agents](#self-evolving-agents)
8. [Storage & Persistence](#storage--persistence)
9. [Settings & Configuration](#settings--configuration)
10. [API Usage Examples](#api-usage-examples)
11. [Testing & Verification](#testing--verification)

---

## Getting Started

### First Time Setup

1. **Complete Installation Wizard**
   - On first launch, you'll see the Installation Wizard
   - Configure n8n webhook URL (optional)
   - Add API keys for LLM providers
   - Click "Complete Setup" or "Skip" to proceed

2. **Sign Up / Sign In**
   - Create an account or sign in
   - Your progress is saved locally

3. **Take Cognitive Assessment**
   - Click "Take Assessment" from dashboard
   - Complete the questionnaire (5-10 minutes)
   - Receive personalized learning profile

4. **Configure Settings**
   - Click "Settings" button (top right)
   - Add/update API keys
   - Configure backend API URL
   - Test n8n connection

---

## Core Learning Features

### 1. Learning Sessions

**Description**: AI-powered learning sessions with personalized content delivery.

**How to Use**:
1. From Dashboard, click "Start New Learning Session"
2. Select or enter a topic
3. AI generates personalized content
4. Complete lessons, quizzes, and exercises
5. Track progress and RPE scores

**Test Example**:
```bash
# Via API
curl -X GET http://localhost:8000/activity/test_user

# Expected response:
{
  "type": "video_lecture",
  "module": "machine learning",
  "content": {...},
  "estimated_duration": 30
}
```

**Features**:
- Personalized content generation
- RPE (Reward Prediction Error) tracking
- Confidence calibration
- Adaptive difficulty

---

### 2. Enhanced Learning Sessions

**Description**: Advanced sessions with dopamine optimization and hyper-correction detection.

**How to Use**:
1. Complete cognitive assessment first
2. Start enhanced session from dashboard
3. Rate confidence before answering
4. System tracks RPE and adjusts
5. High-confidence errors trigger hyper-correction

**Test Example**:
```typescript
// In browser console or via API
// Session automatically tracks:
// - Confidence ratings
// - RPE calculations
// - Hyper-correction events
// - Dopamine optimization
```

**Key Features**:
- Confidence tracking before answers
- RPE-based learning optimization
- Hyper-correction for high-confidence errors
- Dopamine reward system

---

### 3. Spaced Repetition (Flashcards)

**Description**: SM-2 algorithm-based spaced repetition for optimal retention.

**How to Use**:
1. Navigate to Flashcards (from Polymath Dashboard)
2. Review cards in queue
3. Rate confidence: Again (0), Hard (1), Good (2), Easy (3)
4. System schedules next review automatically
5. Track statistics and progress

**Test Example**:
```bash
# Create a flashcard (via frontend)
# Frontend: Click "Create Flashcard"
# Enter: Front: "What is RPE?", Back: "Reward Prediction Error"

# Review card
# Rate: "Good" (2)
# Next review automatically scheduled
```

**Features**:
- SM-2 algorithm
- Automatic scheduling
- Domain organization
- Review queue management
- Statistics tracking

---

### 4. Memory Palace Builder

**Description**: Method of Loci for spatial memory encoding.

**How to Use**:
1. Navigate to Memory Palace from Polymath Dashboard
2. Create new palace or select existing
3. Add locations (rooms, objects, paths)
4. Associate content with locations
5. Visualize and review

**Test Example**:
```typescript
// Create memory palace
// 1. Click "Create Memory Palace"
// 2. Name: "Quantum Physics Concepts"
// 3. Add locations:
//    - Entrance: "Wave-Particle Duality"
//    - Living Room: "Superposition"
//    - Kitchen: "Entanglement"
// 4. Save and visualize
```

**Features**:
- 144-grid structure
- Visual association
- Domain organization
- XP rewards
- Spatial memory encoding

---

### 5. Mind Map Builder

**Description**: Tony Buzan's radiant thinking for semantic networks.

**How to Use**:
1. Navigate to Mind Map from Polymath Dashboard
2. Create new map
3. Add central node (main topic)
4. Add child nodes (subtopics)
5. Connect related concepts
6. Export or save

**Test Example**:
```typescript
// Create mind map
// 1. Central node: "Machine Learning"
// 2. Add branches:
//    - "Supervised Learning"
//    - "Unsupervised Learning"
//    - "Reinforcement Learning"
// 3. Add sub-branches to each
// 4. Connect related concepts
```

**Features**:
- Hierarchical structure
- Visual connections
- Domain integration
- Export functionality
- Semantic network building

---

### 6. Deep Work Blocks

**Description**: Focused practice sessions with activity tracking.

**How to Use**:
1. Navigate to Deep Work from Polymath Dashboard
2. Set duration (15-90 minutes)
3. Select activity type
4. Start timer
5. Track focused work time
6. Review session summary

**Test Example**:
```typescript
// Start deep work session
// 1. Duration: 45 minutes
// 2. Activity: "Coding Practice"
// 3. Domain: "Computer Science"
// 4. Start timer
// 5. Complete session
// 6. Review: Time spent, focus score
```

**Features**:
- Pomodoro-style timer
- Activity type tracking
- Focus metrics
- Session history
- Domain organization

---

### 7. Reflection Journal

**Description**: Structured reflection with mood tracking.

**How to Use**:
1. Navigate to Reflection Journal
2. Create new entry
3. Answer reflection prompts
4. Rate mood and energy
5. Save entry
6. Review past reflections

**Test Example**:
```typescript
// Create reflection entry
// 1. Date: Today
// 2. Mood: 8/10
// 3. Energy: 7/10
// 4. What did I learn? "Quantum superposition"
// 5. What was challenging? "Understanding entanglement"
// 6. What's next? "Practice with examples"
```

**Features**:
- Structured prompts
- Mood tracking
- Learning insights
- Progress visualization
- Historical review

---

### 8. TRIZ Application

**Description**: 40 inventive principles for creative problem-solving.

**How to Use**:
1. Navigate to TRIZ from Polymath Dashboard
2. Enter problem statement
3. System suggests relevant principles
4. Apply principles to problem
5. Generate solutions
6. Evaluate and refine

**Test Example**:
```typescript
// Apply TRIZ
// 1. Problem: "How to improve learning retention?"
// 2. Suggested principles:
//    - Principle 13: "The Other Way Round"
//    - Principle 24: "Intermediary"
//    - Principle 35: "Parameter Changes"
// 3. Generate solutions based on principles
```

**Features**:
- 40 inventive principles
- Problem analysis
- Solution generation
- Creative thinking tools

---

### 9. Cross-Domain Projects

**Description**: Synthesize knowledge across multiple domains.

**How to Use**:
1. Navigate to Cross-Domain Projects
2. Create new project
3. Select multiple domains
4. Define project goals
5. Track progress across domains
6. Synthesize insights

**Test Example**:
```typescript
// Create cross-domain project
// 1. Name: "AI in Medicine"
// 2. Domains: ["Computer Science", "Biology", "Medicine"]
// 3. Goals: "Understand AI applications in healthcare"
// 4. Add research and notes
// 5. Synthesize connections
```

**Features**:
- Multi-domain integration
- Project tracking
- Knowledge synthesis
- Progress visualization

---

### 10. Brainwave Generator

**Description**: Binaural beats for optimal learning states.

**How to Use**:
1. Navigate to Brainwave Generator
2. Select brainwave frequency:
   - Alpha (8-12 Hz): Reading, learning
   - Theta (4-8 Hz): Visualization, creativity
   - Beta (12-30 Hz): Focus, problem-solving
   - Gamma (30+ Hz): High-level thinking
3. Adjust volume and duration
4. Start audio
5. Use during learning sessions

**Test Example**:
```typescript
// Use brainwave generator
// 1. Select: Alpha waves (10 Hz)
// 2. Duration: 30 minutes
// 3. Start before learning session
// 4. Use headphones for best effect
```

**Features**:
- Multiple frequency bands
- Customizable duration
- Volume control
- Learning state optimization

---

## AI-Powered Features

### 11. Polymath AI Assistant

**Description**: Advanced AI assistant for learning guidance and content generation.

**How to Use**:
1. Navigate to Polymath AI Assistant
2. Ask questions or give commands:
   - "Learn quantum computing"
   - "Generate flashcards for machine learning"
   - "Create memory palace for history"
3. AI generates content and guides you
4. Interactive editing and refinement

**Test Example**:
```typescript
// Chat with AI Assistant
// User: "Teach me about neural networks"
// AI: Generates lesson plan, creates flashcards, suggests memory palace
// User: "Make it more advanced"
// AI: Adjusts content difficulty and depth
```

**Features**:
- Natural language interaction
- Content generation
- Learning path creation
- Interactive editing
- Multi-feature coordination

---

### 12. Intelligent LLM Router

**Description**: Automatically selects optimal LLM for each task.

**How to Use** (Via API):

```bash
# Test 1: Quality-focused task
curl -X POST http://localhost:8000/llm/select \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "research_analysis",
    "priority": "quality",
    "requires_reasoning": true,
    "required_context": 50000
  }'

# Expected: Selects high-quality model (Claude or GPT-4o)
# Response:
{
  "llm_key": "anthropic:claude-sonnet-4",
  "model_name": "claude-sonnet-4",
  "provider": "anthropic",
  "reasoning": {
    "quality_score": 10.0,
    "speed_score": 9.0,
    "cost_per_1k": 3.0,
    "context_window": 200000
  }
}

# Test 2: Speed-focused task
curl -X POST http://localhost:8000/llm/select \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "quick_response",
    "priority": "speed",
    "required_context": 1000
  }'

# Expected: Selects fast model (GPT-4o-mini or Groq)
# Response:
{
  "llm_key": "openai:gpt-4o-mini",
  "model_name": "gpt-4o-mini",
  "provider": "openai",
  "reasoning": {
    "quality_score": 7.0,
    "speed_score": 10.0,
    "cost_per_1k": 0.15,
    "context_window": 128000
  }
}

# Test 3: Cost-focused task
curl -X POST http://localhost:8000/llm/select \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "simple_task",
    "priority": "cost",
    "required_context": 5000
  }'

# Expected: Selects low-cost model
# Response:
{
  "llm_key": "groq:llama-3.1-70b",
  "model_name": "llama-3.1-70b",
  "provider": "groq",
  "reasoning": {
    "quality_score": 8.0,
    "speed_score": 10.0,
    "cost_per_1k": 0.1,
    "context_window": 128000
  }
}

# Test 4: Code generation task
curl -X POST http://localhost:8000/llm/select \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "code_generation",
    "priority": "quality",
    "requires_code": true
  }'

# Expected: Selects code-specialized model
# Response:
{
  "llm_key": "openai:gpt-4o",
  "model_name": "gpt-4o",
  "provider": "openai",
  "reasoning": {...}
}

# Get performance metrics
curl http://localhost:8000/llm/performance

# Response shows usage statistics, costs, success rates
```

**Features**:
- Automatic model selection
- Task-based optimization
- Performance tracking
- Cost optimization
- Automatic failover

---

## Quantum Computing Features

### 13. Quantum Learning Path Optimization

**Description**: Uses quantum algorithms to optimize learning sequences.

**How to Use** (Via API):

```bash
# Test quantum path optimization
curl -X POST http://localhost:8000/quantum/optimize-path \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "domains": ["machine_learning", "quantum_computing", "mathematics"],
    "constraints": {
      "time_limit": 100,
      "difficulty": "intermediate",
      "prerequisites": ["linear_algebra", "python"]
    }
  }'

# Expected response:
{
  "user_id": "test_user",
  "domains": ["machine_learning", "quantum_computing", "mathematics"],
  "quantum_optimized_path": {
    "path": [0, 1, 2, 3, 4],
    "confidence": 0.85
  },
  "optimization_metrics": {
    "minimum_cost": 0.42,
    "convergence": 15
  }
}
```

**Features**:
- QAOA optimization
- Constraint handling
- Optimal sequence generation
- Performance metrics

---

### 14. Quantum Pattern Recognition

**Description**: Quantum-enhanced pattern recognition for learning.

**How to Use** (Via API):

```bash
# Test quantum pattern recognition
curl -X POST http://localhost:8000/quantum/pattern-recognition \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "pattern_type": "abstract_reasoning"
  }'

# Expected response:
{
  "user_id": "test_user",
  "pattern_type": "abstract_reasoning",
  "recognizer_type": "quantum_kernel_methods",
  "session_ready": true
}

# Other pattern types:
# - "image_recognition": Uses quantum convolutional networks
# - "sequential_patterns": Uses quantum attention mechanism
```

**Features**:
- Quantum kernel methods
- Quantum convolutional networks
- Quantum attention mechanisms
- Pattern classification

---

## Multi-Agent Collaboration

### 15. Collaborative Problem Solving

**Description**: 8 specialized AI agents work together to solve complex problems.

**How to Use** (Via API):

```bash
# Test collaborative problem solving
curl -X POST http://localhost:8000/collaboration/solve \
  -H "Content-Type: application/json" \
  -d '{
    "problem_statement": {
      "description": "Design an optimal learning system for personalized education",
      "domain": "education",
      "constraints": ["Must be scalable", "Must respect privacy", "Must be effective"],
      "objectives": [
        "Personalize learning paths",
        "Adapt to learning styles",
        "Track progress effectively"
      ]
    },
    "user_id": "test_user"
  }'

# Expected response (may take 30-60 seconds):
{
  "problem_statement": {...},
  "session_id": "uuid-here",
  "timestamp": "2025-01-XX...",
  "individual_contributions": [
    {
      "agent": "knowledge_engineer",
      "contribution": {...}
    },
    {
      "agent": "research_analyst",
      "contribution": {...}
    },
    // ... 6 more agents
  ],
  "collective_insight": {
    "convergent_patterns": [...],
    "meta_insights": [...],
    "solution_quality": "High"
  },
  "specialized_solutions": [...],
  "final_solution": {
    "final_solution": "Comprehensive solution...",
    "key_recommendations": [...],
    "implementation_steps": [...]
  },
  "collaboration_metrics": {
    "effectiveness_score": 8.5,
    "total_agents": 8,
    "contributions_received": 8
  },
  "emergence_indicators": {
    "emergence_detected": true,
    "emergence_strength": 7.5
  }
}
```

**Agent Specializations**:
1. **Knowledge Engineer**: Organizes and structures knowledge
2. **Research Analyst**: Analyzes research and synthesizes findings
3. **Pattern Recognizer**: Identifies patterns and anomalies
4. **Strategy Planner**: Creates strategic plans
5. **Creative Synthesizer**: Generates innovative solutions
6. **Optimization Specialist**: Solves optimization problems
7. **Meta-Learning Coordinator**: Coordinates system improvement
8. **Ethics Evaluator**: Evaluates ethical implications

**Features**:
- 8 specialized agents
- Collective intelligence synthesis
- Emergent solution generation
- Ethical evaluation
- Performance metrics

---

## Self-Evolving Agents

### 16. Agent Evolution System

**Description**: Agents automatically improve based on performance feedback.

**How to Use** (Via API):

```bash
# Test 1: Track agent performance
# (This happens automatically during collaboration, but you can trigger manually)

# Test 2: Evolve an agent
curl -X POST http://localhost:8000/agents/evolve \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "knowledge_engineer",
    "task_results": {
      "task_completed": true,
      "output_quality": "good",
      "time_taken": 45.2
    },
    "performance_feedback": {
      "success": true,
      "quality_score": 0.75,
      "feedback": "Good organization but could improve structure"
    }
  }'

# Expected response:
{
  "agent_id": "knowledge_engineer",
  "evolved": true,
  "reason": "Low quality score - optimization needed",
  "previous_version": 1,
  "new_version": 2,
  "improvements": [
    {
      "type": "quality_enhancement",
      "description": "Enhance output quality and accuracy",
      "priority": "high"
    },
    {
      "type": "prompt_refinement",
      "description": "Refine system prompt based on task patterns",
      "priority": "medium"
    }
  ]
}

# Test 3: Get evolution history
curl http://localhost:8000/agents/knowledge_engineer/evolution

# Expected response:
{
  "agent_id": "knowledge_engineer",
  "evolution_history": [
    {
      "version": 2,
      "timestamp": "2025-01-XX...",
      "reason": "Low quality score - optimization needed",
      "improvements": [...]
    }
  ],
  "performance_tracking": {
    "tasks": [...],
    "improvements": [...],
    "version_history": [...]
  },
  "total_evolutions": 1
}
```

**Features**:
- Automatic performance tracking
- Evolution on failure or low quality
- Improvement generation
- Version management
- Complete history

---

## Storage & Persistence

### 17. Artifact Management

**Description**: Versioned storage for learning artifacts and outputs.

**How to Use** (Via API):

```bash
# Test 1: Store an artifact
curl -X POST http://localhost:8000/storage/artifact \
  -H "Content-Type: application/json" \
  -d '{
    "artifact_id": "research_report_001",
    "content": {
      "title": "Quantum Computing in Education",
      "sections": ["Introduction", "Methods", "Results"],
      "data": {...}
    },
    "task_id": "task_123",
    "artifact_type": "output",
    "metadata": {
      "domain": "quantum_computing",
      "author": "test_user"
    }
  }'

# Expected response:
{
  "artifact_id": "research_report_001",
  "version": 1,
  "task_id": "task_123",
  "artifact_type": "output",
  "content": {...},
  "metadata": {...},
  "created_at": "2025-01-XX...",
  "file_path": "./artifacts/task_123/output/research_report_001_v1.json",
  "public_url": "https://..."  // If Supabase configured
}

# Test 2: Retrieve artifact
curl http://localhost:8000/storage/artifact/research_report_001

# Test 3: Get specific version
curl http://localhost:8000/storage/artifact/research_report_001?version=1

# Test 4: List all artifacts for a task
curl http://localhost:8000/storage/task/task_123/artifacts

# Expected: Array of all artifacts for that task
```

**Features**:
- Automatic versioning
- Task-based organization
- Local and cloud storage
- Metadata support
- Public URL generation (Supabase)

---

## Settings & Configuration

### 18. Settings Modal

**Description**: Centralized configuration for all PolyMathOS settings.

**How to Use** (Via Frontend):

1. **Access Settings**
   - Click "Settings" button (top right of dashboard)
   - Or use keyboard shortcut (if configured)

2. **Integrations Tab**
   - **n8n Configuration**:
     - Enter webhook URL: `http://localhost:5678`
     - Click "Test Connection"
     - Status shows: Connected/Error
   
   - **API Keys**:
     - Enter keys for:
       - NVIDIA API Key
       - Gemini API Key
       - Groq API Key
       - Supabase URL
       - Supabase Anon Key
       - Backend API URL
     - Click "Save Changes"

3. **Data Sets Tab**
   - Upload datasets (coming soon)
   - Manage local/remote datasets

4. **General Tab**
   - Toggle Dark Mode
   - Other preferences

**Test Example**:
```typescript
// In browser console
// 1. Open Settings Modal
// 2. Enter n8n URL: http://localhost:5678
// 3. Click "Test Connection"
// 4. Should show: "Connected Successfully" (if n8n is running)
// 5. Add API keys
// 6. Click "Save Changes"
// 7. Verify in localStorage:
localStorage.getItem('n8n_webhook_url')
localStorage.getItem('polymathos_env')
```

**Features**:
- n8n webhook configuration
- API key management
- Backend API URL configuration
- Connection testing
- LocalStorage persistence

---

## API Usage Examples

### Complete Workflow Example

```bash
# Step 1: Check system status
curl http://localhost:8000/system/status

# Step 2: Enroll a user
curl -X POST http://localhost:8000/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "alice_student",
    "interests": ["machine_learning", "quantum_computing", "neuroscience"]
  }'

# Step 3: Get next learning activity
curl http://localhost:8000/activity/alice_student

# Step 4: Activate genius mode
curl -X POST http://localhost:8000/genius/activate \
  -H "Content-Type: application/json" \
  -d '{"user_id": "alice_student"}'

# Step 5: Start cognitive amplification session
curl -X POST http://localhost:8000/genius/session \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "alice_student",
    "session_type": "pattern_recognition_supercharge"
  }'

# Step 6: Optimize learning path with quantum computing
curl -X POST http://localhost:8000/quantum/optimize-path \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "alice_student",
    "domains": ["machine_learning", "quantum_computing"],
    "constraints": {"time_limit": 200, "difficulty": "advanced"}
  }'

# Step 7: Solve complex problem with multi-agent collaboration
curl -X POST http://localhost:8000/collaboration/solve \
  -H "Content-Type: application/json" \
  -d '{
    "problem_statement": {
      "description": "How can quantum computing enhance machine learning?",
      "domain": "research"
    },
    "user_id": "alice_student"
  }'

# Step 8: Store collaboration results as artifact
curl -X POST http://localhost:8000/storage/artifact \
  -H "Content-Type: application/json" \
  -d '{
    "artifact_id": "quantum_ml_research",
    "content": {
      "problem": "Quantum computing in ML",
      "solution": "...",
      "agents_contributions": [...]
    },
    "task_id": "collaboration_session_001",
    "artifact_type": "research_output"
  }'

# Step 9: Check progress
curl http://localhost:8000/progress/alice_student

# Step 10: View LLM performance
curl http://localhost:8000/llm/performance
```

---

## Testing & Verification

### Frontend Testing

**Test 1: Basic Navigation**
```typescript
// 1. Open http://localhost:5173
// 2. Verify homepage loads
// 3. Click "Sign Up"
// 4. Create account
// 5. Verify redirect to dashboard
```

**Test 2: Settings Configuration**
```typescript
// 1. Sign in
// 2. Click "Settings"
// 3. Add n8n URL: http://localhost:5678
// 4. Test connection
// 5. Add API keys
// 6. Save
// 7. Verify localStorage has values
```

**Test 3: Learning Session**
```typescript
// 1. From dashboard, click "Start New Learning Session"
// 2. Enter topic: "Quantum Mechanics"
// 3. Complete session
// 4. Verify progress tracked
```

### Backend Testing

**Test 1: Health Check**
```bash
curl http://localhost:8000/
# Expected: {"status":"active","system":"PolyMathOS Genius Engine"}
```

**Test 2: System Status**
```bash
curl http://localhost:8000/system/status
# Expected: Full system capabilities and module status
```

**Test 3: User Enrollment**
```bash
curl -X POST http://localhost:8000/enroll \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","interests":["ai"]}'
# Expected: Learning path with modules
```

**Test 4: LLM Selection**
```bash
curl -X POST http://localhost:8000/llm/select \
  -H "Content-Type: application/json" \
  -d '{"task_type":"research","priority":"quality"}'
# Expected: Optimal LLM selection with reasoning
```

**Test 5: Multi-Agent Collaboration**
```bash
curl -X POST http://localhost:8000/collaboration/solve \
  -H "Content-Type: application/json" \
  -d '{"problem_statement":{"description":"Test problem"}}'
# Expected: Collaboration result with agent contributions
```

**Test 6: Artifact Storage**
```bash
curl -X POST http://localhost:8000/storage/artifact \
  -H "Content-Type: application/json" \
  -d '{"artifact_id":"test","content":{},"task_id":"task1"}'
# Expected: Stored artifact with version
```

### Integration Testing

**Complete User Journey**:
1. ✅ Sign up / Sign in
2. ✅ Complete cognitive assessment
3. ✅ Configure settings
4. ✅ Start learning session
5. ✅ Use flashcards
6. ✅ Create memory palace
7. ✅ Build mind map
8. ✅ Use AI assistant
9. ✅ Check progress
10. ✅ Review analytics

---

## Feature Summary Table

| Feature | Frontend | Backend API | Description |
|---------|----------|-------------|-------------|
| Learning Sessions | ✅ | ✅ | AI-powered personalized learning |
| Enhanced Sessions | ✅ | ✅ | RPE-optimized learning |
| Flashcards | ✅ | - | Spaced repetition system |
| Memory Palace | ✅ | - | Spatial memory encoding |
| Mind Maps | ✅ | - | Semantic network building |
| Deep Work | ✅ | - | Focused practice sessions |
| Reflection Journal | ✅ | - | Structured reflection |
| TRIZ | ✅ | - | Creative problem-solving |
| Cross-Domain Projects | ✅ | - | Multi-domain synthesis |
| Brainwave Generator | ✅ | - | Binaural beats |
| AI Assistant | ✅ | ✅ | Learning guidance |
| LLM Router | - | ✅ | Intelligent model selection |
| Quantum Optimization | - | ✅ | Quantum path optimization |
| Quantum Patterns | - | ✅ | Quantum pattern recognition |
| Multi-Agent Collaboration | - | ✅ | 8-agent problem solving |
| Agent Evolution | - | ✅ | Self-improving agents |
| Artifact Storage | - | ✅ | Versioned storage |
| Settings | ✅ | - | Configuration management |

---

## Best Practices

### For Learning
1. **Complete Assessment First**: Get personalized profile
2. **Use Multiple Features**: Combine flashcards, memory palace, mind maps
3. **Track Progress**: Review analytics regularly
4. **Reflect Daily**: Use reflection journal
5. **Practice Spaced Repetition**: Review flashcards consistently

### For Development
1. **Use API Documentation**: Visit `/docs` endpoint
2. **Test Incrementally**: Test each feature separately
3. **Monitor Performance**: Check LLM performance metrics
4. **Track Agent Evolution**: Monitor agent improvements
5. **Use Version Control**: Artifacts are versioned automatically

### For Configuration
1. **Start with Simulators**: Quantum simulators work without setup
2. **Add API Keys Gradually**: Start with one provider
3. **Test Connections**: Use test buttons in Settings
4. **Monitor Costs**: Check LLM performance for cost tracking
5. **Backup Settings**: Export configuration regularly

---

## Troubleshooting

### Common Issues

**Issue**: API calls fail
- **Check**: Backend is running on port 8000
- **Check**: `VITE_API_URL` in frontend `.env` matches backend URL
- **Solution**: Verify backend logs for errors

**Issue**: LLM selection fails
- **Check**: At least one API key is configured
- **Check**: API keys are valid
- **Solution**: Router will use available models or fallback

**Issue**: Quantum operations slow
- **Note**: This is normal for simulators
- **Solution**: Use smaller problem sizes or real hardware

**Issue**: Agent evolution not working
- **Check**: Lemon AI integration is available
- **Note**: System works without Lemon AI (fallback mode)
- **Solution**: Check backend logs for Lemon AI status

**Issue**: Storage not persisting
- **Check**: File permissions for `./artifacts` directory
- **Check**: Database connection if using PostgreSQL
- **Solution**: Verify storage paths and permissions

---

## Next Steps

1. **Explore Features**: Try each feature from the Polymath Dashboard
2. **Read Documentation**: Check other guides in `/docs`
3. **Experiment**: Try different learning strategies
4. **Monitor Progress**: Use analytics to track improvement
5. **Customize**: Configure settings for your needs

---

## Support Resources

- **API Documentation**: `http://localhost:8000/docs`
- **Setup Guide**: `docs/SETUP_GUIDE.md`
- **Technical Docs**: `docs/TECHNICAL_DOCUMENTATION.md`
- **Debug Reports**: `DEBUG_REPORT_V2.1.md`
- **GitHub Issues**: Report problems or request features

---

**Happy Learning with PolyMathOS!** 🚀

*For questions or issues, check the troubleshooting section or open a GitHub issue.*

