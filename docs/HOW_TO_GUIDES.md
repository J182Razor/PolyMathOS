# PolyMathOS How-To Guides

Step-by-step guides for common tasks and features.

## Table of Contents

1. [How to Create a Learning Plan](#how-to-create-a-learning-plan)
2. [How to Upload and Process Documents](#how-to-upload-and-process-documents)
3. [How to Use the AI Assistant](#how-to-use-the-ai-assistant)
4. [How to Execute Agent Patterns](#how-to-execute-agent-patterns)
5. [How to Create Workflows](#how-to-create-workflows)
6. [How to Configure HDAM](#how-to-configure-hdam)
7. [How to Use Quantum Features](#how-to-use-quantum-features)
8. [How to Integrate with n8n](#how-to-integrate-with-n8n)
9. [How to Deploy to Production](#how-to-deploy-to-production)

## How to Create a Learning Plan

### Step 1: Complete Onboarding

1. Sign up or log in to PolyMathOS
2. Complete the onboarding flow:
   - Select your learning domains
   - Upload knowledge resources (optional)
   - Set your learning preferences

### Step 2: Navigate to Curriculum Builder

1. Go to **Dashboard** → **Curriculum Builder**
2. Or use the **Onboarding** flow → **Curriculum Builder** step

### Step 3: Define Your Goal

Enter a clear learning goal:
- "Master Generative AI"
- "Learn Spanish to B2 Level"
- "Understand Quantum Computing Fundamentals"

### Step 4: Select Timeline

Choose your learning duration:
- **1 Day**: Crash course
- **1 Week**: Intensive sprint
- **1 Month**: Solid foundation
- **3 Months**: Proficiency
- **6 Months**: Mastery
- **1 Year**: Expert/PhD level

### Step 5: Generate Plan

1. Click **"Generate Plan"**
2. The system will:
   - Analyze your uploaded resources
   - Create a structured curriculum
   - Optimize using quantum algorithms
   - Generate daily lesson plans

### Step 6: Review and Customize

1. Review the generated modules
2. Adjust difficulty if needed
3. Add or remove topics
4. Save the plan

## How to Upload and Process Documents

### Supported Formats

- **PDF**: Textbooks, research papers
- **DOCX**: Word documents, notes
- **TXT**: Plain text files
- **Markdown**: Documentation, notes

### Upload Methods

#### Method 1: Resource Scanner (Recommended)

1. Go to **Onboarding** → **Resource Scanner**
2. Or **Dashboard** → **Resource Library** → **Upload**

3. **Drag & Drop** files into the upload zone
4. Or click to **Browse** and select files

5. Files are automatically processed:
   - Text extraction
   - Vector embedding generation
   - Metadata extraction
   - Domain classification

#### Method 2: API Upload

```bash
curl -X POST http://localhost:8000/api/documents/upload \
  -F "file=@document.pdf" \
  -F "domains=Machine Learning,AI"
```

### Processing Status

Check processing status:
1. Go to **Resource Library**
2. View **Processing** tab
3. Files show status: Uploading → Processing → Ready

### Using Processed Documents

Processed documents are automatically:
- Indexed in HDAM
- Available for RAG queries
- Used in curriculum generation
- Searchable in Resource Library

## How to Use the AI Assistant

### Accessing the Assistant

1. Click **AI Assistant** icon in navigation
2. Or use **Dashboard** → **AI Assistant**

### Basic Usage

1. **Type your question** in the chat input
2. **Press Enter** or click Send
3. The assistant uses multiple agents:
   - **Researcher**: Gathers information
   - **Strategist**: Plans approach
   - **Critic**: Reviews for errors
   - **Synthesizer**: Combines into answer

### Advanced Features

#### Voice Input

1. Click **microphone icon**
2. Speak your question
3. Voice is transcribed and processed

#### Agent Selection

1. Click **agent selector**
2. Choose specific agent:
   - Researcher only
   - Strategist only
   - Full collaboration

#### Context Awareness

The assistant remembers:
- Your learning plan
- Uploaded documents
- Previous conversations
- Learning progress

### Example Queries

- "Explain quantum entanglement in simple terms"
- "How does backpropagation work in neural networks?"
- "What are the key concepts in Spanish grammar?"
- "Create a study plan for calculus"

## How to Execute Agent Patterns

### Available Patterns

1. **AdvancedResearch**: Orchestrator-worker research
2. **LlamaIndexRAG**: RAG query with LlamaIndex
3. **ChromaDBMemory**: ChromaDB memory operations
4. **AgentRearrange**: Sequential agent flow
5. **MALT**: Multi-Agent Learning Tree
6. **HierarchicalSwarm**: Director-agent pattern
7. **GroupChat**: Collaborative discussion
8. **MultiAgentRouter**: Intelligent routing
9. **FederatedSwarm**: Swarm of swarms
10. **DFSSwarm**: Depth-first search swarm
11. **AgentMatrix**: Matrix-based coordination

### Using Agent Pattern Executor

1. Go to **Dashboard** → **Agent Patterns**
2. Select a pattern from the dropdown
3. Enter your task/query
4. Configure pattern settings (optional)
5. Click **Execute**

### API Usage

```python
import requests

response = requests.post(
    "http://localhost:8000/api/agents/orchestrate",
    json={
        "pattern_type": "advanced_research",
        "task": "Research quantum computing applications",
        "pattern_config": {},
        "context": {}
    }
)
```

### Pattern Status

Check execution status:
1. Go to **Agent Pattern Dashboard**
2. View execution history
3. See results and metrics

## How to Create Workflows

### Using Zero Workflow Builder

1. Go to **Dashboard** → **Workflows**
2. Click **Create New Workflow**

### Workflow Steps

1. **Define Trigger**: When should workflow run?
   - Manual trigger
   - Scheduled
   - Event-based

2. **Add Steps**: Drag and drop workflow steps
   - Agent patterns
   - Document processing
   - Research tasks
   - Learning plan generation

3. **Configure Steps**: Set parameters for each step

4. **Connect Steps**: Define flow between steps

5. **Save Workflow**: Name and save your workflow

### Example Workflow

**Daily Learning Session Workflow**:
1. Trigger: Daily at 9 AM
2. Step 1: Generate daily lesson
3. Step 2: Research additional resources
4. Step 3: Create practice exercises
5. Step 4: Schedule spaced repetition

### API Workflow Creation

```python
import requests

workflow = {
    "name": "Daily Learning",
    "description": "Automated daily learning session",
    "workflow_def": {
        "steps": [
            {"type": "generate_lesson", "config": {}},
            {"type": "research", "config": {"query": "..."}},
            {"type": "create_exercises", "config": {}}
        ]
    }
}

response = requests.post(
    "http://localhost:8000/api/workflows/zero/create",
    json=workflow
)
```

## How to Configure HDAM

### What is HDAM?

HDAM (Holographic Associative Memory) provides:
- Quantum-enhanced memory storage
- Instant knowledge retrieval
- Associative learning
- Pattern recognition

### Setup Steps

1. **Configure Supabase** (Recommended):
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-key
   ```

2. **Or Use ChromaDB Only**:
   ```env
   CHROMADB_PATH=./chromadb
   ```

3. **Initialize HDAM**:
   - HDAM initializes automatically on backend start
   - Check status: `GET /api/hdam/health`

### Using HDAM

HDAM is used automatically for:
- Document embeddings
- Knowledge retrieval
- Learning path optimization
- Pattern recognition

### Manual HDAM Operations

```python
# Store knowledge
POST /api/hdam/learn
{
    "content": "Quantum mechanics principle...",
    "domain": "Physics",
    "metadata": {}
}

# Query knowledge
POST /api/hdam/query
{
    "query": "What is quantum entanglement?",
    "top_k": 5
}
```

## How to Use Quantum Features

### Prerequisites

1. **Get API Keys**:
   - D-Wave: [cloud.dwavesys.com/leap](https://cloud.dwavesys.com/leap/)
   - IBM Quantum: [quantum-computing.ibm.com](https://quantum-computing.ibm.com/)

2. **Configure**:
   ```env
   DWAVE_API_TOKEN=your-token
   IBM_QUANTUM_TOKEN=your-token
   ENABLE_QUANTUM=true
   ```

### Enabling Quantum Features

1. Go to **Settings** → **Features**
2. Toggle **"Enable Quantum Computing"**
3. Save settings

### Using Quantum Optimization

1. **Learning Path Optimization**:
   - Create learning plan
   - Click **"Quantum Optimize"**
   - System uses quantum annealing to find optimal path

2. **Pattern Recognition**:
   - Go to **Genius Mode**
   - Enable **"Quantum Pattern Recognition"**
   - System finds hidden patterns in your learning data

### Quantum Features Available

- **Path Optimization**: Optimal learning sequences
- **Pattern Recognition**: Hidden connections
- **Problem Solving**: Complex logic puzzles
- **Resource Allocation**: Optimal study time distribution

## How to Integrate with n8n

### Setup n8n

1. **Install n8n**:
   ```bash
   docker-compose -f docker-compose.n8n.yml up -d
   ```

2. **Access n8n**: http://localhost:5678

### Configure PolyMathOS

1. **Enable n8n**:
   ```env
   USE_N8N=true
   N8N_WEBHOOK_URL=http://localhost:5678
   ```

2. **Frontend**:
   ```env
   VITE_USE_N8N=true
   VITE_N8N_WEBHOOK_URL=http://localhost:5678
   ```

### Create Workflows in n8n

1. **Import Workflows**:
   - Go to n8n → Workflows
   - Import from `n8n-workflows/` directory

2. **Configure Webhooks**:
   - Each workflow has a webhook URL
   - Add to PolyMathOS configuration

### Example Workflows

- **User Authentication**: Handle sign up/login
- **Learning Session Tracking**: Track study sessions
- **RPE Tracking**: Monitor reward prediction error
- **Spaced Repetition**: Schedule reviews
- **Analytics**: Aggregate learning data

## How to Deploy to Production

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] API keys secured
- [ ] `SECRET_KEY` changed
- [ ] `DEBUG=false`
- [ ] `ENV=production`
- [ ] HTTPS configured
- [ ] CORS origins restricted
- [ ] Database backups configured

### Docker Deployment

1. **Build Images**:
   ```bash
   docker-compose build
   ```

2. **Start Services**:
   ```bash
   docker-compose up -d
   ```

3. **Check Logs**:
   ```bash
   docker-compose logs -f
   ```

### Manual Deployment

1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

2. **Frontend**:
   ```bash
   npm run build
   # Serve with nginx or similar
   ```

### Production Environment Variables

```env
ENV=production
DEBUG=false
SECRET_KEY=<strong-random-key>
CORS_ORIGINS=https://yourdomain.com
DATABASE_URL=<production-db-url>
```

### Monitoring

1. **Health Checks**:
   - Backend: `GET /health`
   - Frontend: Check HTTP status

2. **Logs**:
   - Backend: Check uvicorn logs
   - Frontend: Check nginx/server logs

3. **Metrics**:
   - Database connection pool
   - API response times
   - Error rates

## Additional Resources

- [Quick Start Guide](../QUICKSTART.md)
- [Configuration Guide](../CONFIGURATION.md)
- [API Documentation](http://localhost:8000/docs)
- [Technical Documentation](TECHNICAL_DOCUMENTATION.md)

