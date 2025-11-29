# Swarm Corporation Components Integration Guide

## Overview

This guide documents the integration of all Swarm Corporation components into PolyMathOS. Each component has been integrated with graceful degradation, health checks, and comprehensive API endpoints.

## Components

### 1. HDAM (Holographic Associative Memory)
**Location**: `backend/app/modules/hdam.py`  
**API**: `/api/hdam/*`  
**Features**:
- Quantum-enhanced holographic memory
- Multidimensional associative learning
- Analogy reasoning and extrapolation
- Learning path optimization

**Usage**:
```python
from app.modules.hdam import initialize_hdam

hdam = initialize_hdam(
    supabase_url="your_url",
    supabase_key="your_key",
    enable_quantum=False
)

# Learn facts
await hdam.learn(["Fact 1", "Fact 2"], context="general")

# Reason
result = await hdam.reason("What is machine learning?", top_k=5)
```

### 2. MonteCarloSwarm
**Location**: `backend/app/modules/monte_carlo_swarm.py`  
**API**: `/api/swarms/monte-carlo/run`  
**Features**:
- Sequential and parallel agent execution
- Multiple result aggregators
- Dynamic agent selection

**Usage**:
```python
from app.modules.monte_carlo_swarm import MonteCarloSwarm
from swarms import Agent

agents = [Agent(...) for _ in range(3)]
swarm = MonteCarloSwarm(agents, parallel=True)
result = swarm.run("Your task")
```

### 3. Education Swarm
**Location**: `backend/app/modules/education_swarm.py`  
**API**: `/api/swarms/education/generate`  
**Features**:
- Personalized curriculum generation
- Interactive learning workflows
- Sample test generation

### 4. SwarmShield
**Location**: `backend/app/modules/swarm_shield_integration.py`  
**API**: `/api/security/shield/*`  
**Features**:
- AES-256-GCM encryption
- Secure conversation management
- Audit logging

### 5. Zero
**Location**: `backend/app/modules/zero_integration.py`  
**API**: `/api/workflows/zero/*`  
**Features**:
- Production-grade workflow automation
- Trigger-action workflows
- Zapier alternative

### 6. Document Processing
**Components**: doc-master, OmniParse, AgentParse  
**Location**: `backend/app/modules/doc_master_integration.py`, etc.  
**API**: `/api/documents/*`  
**Features**:
- File reading and extraction
- Unstructured to structured parsing
- Agent-ready data blocks

### 7. Research Systems
**Components**: Research-Paper-Hive, AdvancedResearch  
**Location**: `backend/app/modules/research_paper_hive_integration.py`, etc.  
**API**: `/api/research/*`  
**Features**:
- Paper discovery and engagement
- Orchestrator-worker research patterns

### 8. RAG Systems
**Components**: AgentRAGProtocol, Multi-Agent-RAG  
**Location**: `backend/app/modules/agent_rag_protocol_integration.py`, etc.  
**API**: `/api/rag/*`  
**Features**:
- Vector-based retrieval
- Multi-agent document processing
- Context generation for agents

### 9. OmniDB
**Location**: `backend/app/modules/omnidb_integration.py`  
**API**: `/api/database/omnidb/*`  
**Features**:
- Hybrid database (SQL + NoSQL + file storage)
- Service-based integration (Rust backend)

### 10. Utilities
**Components**: swarms-utils, Custom-Swarms-Spec  
**Location**: `backend/app/modules/swarms_utils_integration.py`, etc.  
**Features**:
- JSON formatting
- Swarm matching
- Custom swarm specifications

## Installation

### Automatic Installation
```bash
cd backend
python scripts/install_swarm_components.py
```

### Manual Installation
```bash
# Install from pip (if available)
pip install swarm-shield doc-master omniparse agentparse

# Or install from source
git clone https://github.com/The-Swarm-Corporation/<component>.git
cd <component>
pip install -e .
```

## Configuration

### Environment Variables
```bash
# HDAM
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
ENABLE_QUANTUM=false

# Zero
OMNIDB_SERVICE_URL=http://localhost:8080

# SwarmShield
SWARM_SHIELD_ENCRYPTION_STRENGTH=MAXIMUM
```

### Settings Modal
Configure all components through the Settings Modal:
- SwarmShield: Encryption strength settings
- Zero: Workflow automation configuration
- Document Processing: Parser preferences
- RAG: Vector store and top-K settings
- Custom Swarms: Enable/disable custom swarm creation

## Health Checks

### Check All Components
```bash
curl http://localhost:8000/api/health/
```

### Check Specific Component
```bash
curl http://localhost:8000/api/health/component/hdam
```

## API Endpoints

### HDAM
- `POST /api/hdam/learn` - Learn facts
- `POST /api/hdam/reason` - Perform reasoning
- `POST /api/hdam/analogy` - Analogical reasoning
- `POST /api/hdam/extrapolate` - Conceptual extrapolation
- `POST /api/hdam/optimize-path` - Optimize learning path
- `GET /api/hdam/metrics` - Get memory metrics

### Swarms
- `POST /api/swarms/monte-carlo/run` - Run MonteCarloSwarm
- `POST /api/swarms/education/generate` - Generate education workflow
- `POST /api/swarms/custom/create` - Create custom swarm
- `GET /api/swarms/custom/list` - List custom swarms

### Documents
- `POST /api/documents/read` - Read file
- `POST /api/documents/parse` - Parse document
- `POST /api/documents/parse/agent` - Parse for agent
- `GET /api/documents/formats` - Get supported formats

### Research
- `POST /api/research/papers/discover` - Discover papers
- `POST /api/research/papers/engage` - Engage with paper
- `POST /api/research/advanced/orchestrate` - Orchestrate research

### RAG
- `POST /api/rag/agent/index` - Index documents
- `POST /api/rag/agent/query` - Query RAG system
- `POST /api/rag/multi-agent/process` - Process with multi-agent RAG

### Security
- `POST /api/security/shield/protect-message` - Protect message
- `POST /api/security/shield/conversations` - Create conversation
- `GET /api/security/shield/status` - Get security status

### Workflows
- `POST /api/workflows/zero/create` - Create workflow
- `POST /api/workflows/zero/execute` - Execute workflow
- `GET /api/workflows/zero/list` - List workflows

## Database Schema

New tables added to TigerDB:
- `swarm_conversations` - SwarmShield encrypted conversations
- `document_metadata` - Document processing metadata
- `research_papers` - Research paper storage
- `rag_vectors` - RAG vector embeddings (pgvector)
- `workflow_definitions` - Zero workflow specs
- `custom_swarm_specs` - Custom swarm configurations

## Frontend Services

TypeScript services available in `src/services/`:
- `HDAMService.ts`
- `MonteCarloSwarmService.ts`
- `EducationSwarmService.ts`
- `SwarmShieldService.ts`
- `DocumentService.ts`
- `ResearchService.ts`
- `RAGService.ts`
- `ZeroService.ts`
- `CustomSwarmService.ts`

## Error Handling

All components implement graceful degradation:
- Components check availability on initialization
- Fallback behavior when dependencies unavailable
- Clear error messages with component status
- Health check endpoints for monitoring

## Testing

### Unit Tests
```bash
pytest backend/tests/unit/test_*_integration.py
```

### Integration Tests
```bash
pytest backend/tests/integration/test_*_api.py
```

### Health Check Tests
```bash
pytest backend/tests/integration/test_health_checks.py
```

## Troubleshooting

### Component Not Available
1. Check health endpoint: `/api/health/component/<component>`
2. Verify installation: `python scripts/install_swarm_components.py`
3. Check logs for import errors
4. Verify environment variables

### API Errors
1. Check component health status
2. Verify API endpoint exists
3. Check request/response format
4. Review error logs

## Support

For issues or questions:
1. Check component-specific documentation
2. Review health check endpoints
3. Check integration logs
4. Verify component availability
