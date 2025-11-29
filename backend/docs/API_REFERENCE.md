# API Reference

## Base URL
```
http://localhost:8000/api
```

## Authentication
Most endpoints require authentication. Include authentication token in headers:
```
Authorization: Bearer <token>
```

## HDAM API

### Learn Facts
```http
POST /api/hdam/learn
Content-Type: application/json

{
  "facts": ["Fact 1", "Fact 2"],
  "metadata": [{"source": "book1"}, {"source": "book2"}],
  "context": "general",
  "verbose": false,
  "quantum_enhanced": false
}
```

### Reason
```http
POST /api/hdam/reason
Content-Type: application/json

{
  "query": "What is machine learning?",
  "context": "general",
  "top_k": 5,
  "quantum_assisted": false,
  "reasoning_mode": "associative"
}
```

### Analogy
```http
POST /api/hdam/analogy
Content-Type: application/json

{
  "a": "dog",
  "b": "puppy",
  "c": "cat",
  "context": "general",
  "top_k": 5
}
```

## Swarms API

### Run MonteCarloSwarm
```http
POST /api/swarms/monte-carlo/run
Content-Type: application/json

{
  "task": "Analyze this problem",
  "parallel": true,
  "aggregator": "consensus"
}
```

### Generate Education Workflow
```http
POST /api/swarms/education/generate
Content-Type: application/json

{
  "subjects": "Mathematics, Physics",
  "learning_style": "Visual",
  "challenge_level": "Moderate",
  "initial_task": "Create a curriculum"
}
```

## Documents API

### Read File
```http
POST /api/documents/read
Content-Type: multipart/form-data

file: <file>
```

### Parse Document
```http
POST /api/documents/parse
Content-Type: application/json

{
  "content": "Document text...",
  "document_type": "pdf"
}
```

## Research API

### Discover Papers
```http
POST /api/research/papers/discover
Content-Type: application/json

{
  "query": "machine learning",
  "max_results": 10,
  "filters": {"year": 2023}
}
```

### Orchestrate Research
```http
POST /api/research/advanced/orchestrate
Content-Type: application/json

{
  "research_query": "What are the latest advances in AI?",
  "max_workers": 5,
  "strategy": "comprehensive"
}
```

## RAG API

### Index Documents
```http
POST /api/rag/agent/index
Content-Type: application/json

{
  "documents": ["Document 1", "Document 2"],
  "metadata": [{"title": "Doc1"}, {"title": "Doc2"}]
}
```

### Query RAG
```http
POST /api/rag/agent/query
Content-Type: application/json

{
  "query": "What is the main topic?",
  "top_k": 5,
  "filters": {}
}
```

## Security API

### Protect Message
```http
POST /api/security/shield/protect-message
Content-Type: application/json

{
  "agent_name": "Agent1",
  "message": "Sensitive message"
}
```

## Workflows API

### Create Workflow
```http
POST /api/workflows/zero/create
Content-Type: application/json

{
  "workflow_def": {
    "name": "My Workflow",
    "triggers": [...],
    "actions": [...]
  }
}
```

## Health Check API

### Overall Health
```http
GET /api/health/
```

### Component Health
```http
GET /api/health/component/{component_name}
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "detail": "Error message"
}
```

Status codes:
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

