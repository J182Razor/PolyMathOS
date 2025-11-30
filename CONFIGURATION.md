# PolyMathOS Configuration Guide

Complete guide to configuring PolyMathOS for optimal performance.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Database Configuration](#database-configuration)
3. [API Keys Setup](#api-keys-setup)
4. [Feature Flags](#feature-flags)
5. [Docker Configuration](#docker-configuration)
6. [Performance Tuning](#performance-tuning)

## Environment Variables

### Backend Configuration (`backend/.env`)

#### Database Configuration

```env
# TigerDB (TimescaleDB) - Primary database
DATABASE_URL=postgresql://user:password@localhost:5432/polymathos
TIGERDB_URL=postgresql://user:password@localhost:5432/polymathos
```

#### Supabase Configuration (Optional but Recommended)

```env
# Required for HDAM vector storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

#### LLM API Keys

At least one LLM API key is required for full functionality:

```env
# OpenAI - Core reasoning and content generation
OPENAI_API_KEY=sk-your-openai-api-key

# Anthropic Claude - Advanced reasoning
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key

# Google Gemini - Multimodal processing
GOOGLE_API_KEY=your-google-api-key

# Groq - Ultra-fast inference
GROQ_API_KEY=your-groq-api-key

# NVIDIA - Specialized models
NVIDIA_API_KEY=your-nvidia-api-key

# Cohere - Embeddings and classification
COHERE_API_KEY=your-cohere-api-key
```

#### Quantum Computing (Optional)

```env
# D-Wave Leap Token - Real quantum hardware access
DWAVE_API_TOKEN=your-dwave-token

# IBM Quantum Token - IBM quantum computers
IBM_QUANTUM_TOKEN=your-ibm-quantum-token

# Enable quantum features
ENABLE_QUANTUM=false
```

#### Advanced Features

```env
# SwarmDB - Message queue system
SWARMDB_URL=http://localhost:9092

# Zero Workflow Automation
ZERO_API_URL=http://localhost:8080
ZERO_API_KEY=your-zero-api-key

# Exa API - Required for AdvancedResearch web search
EXA_API_KEY=your-exa-api-key

# OmniDB Service
OMNIDB_SERVICE_URL=http://localhost:8080
```

#### Storage Configuration

```env
# LlamaIndex data directory
LLAMA_INDEX_DATA_DIR=./docs

# ChromaDB persistent storage path
CHROMADB_PATH=./chromadb
CHROMADB_COLLECTION=polymathos_memory
```

#### Application Settings

```env
# Environment
ENV=development  # or 'production'
DEBUG=true

# Secret key for JWT and encryption (CHANGE IN PRODUCTION!)
SECRET_KEY=polymath_secret_key_change_me_in_prod

# Server configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

# CORS origins (comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Integration Settings

```env
# Lemon AI - Self-evolving agents
LEMON_AI_PATH=./lemonai

# n8n Integration
N8N_WEBHOOK_URL=http://localhost:5678
USE_N8N=false
```

### Frontend Configuration (`.env`)

```env
# Backend API URL
VITE_API_URL=http://localhost:8000

# Supabase (Optional)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# n8n Integration (Optional)
VITE_N8N_WEBHOOK_URL=http://localhost:5678
VITE_USE_N8N=false

# Feature Flags
VITE_ENABLE_QUANTUM=false
VITE_ENABLE_HDAM=true
```

## Database Configuration

### TigerDB Setup

1. **Install TigerDB CLI**:
   ```bash
   curl -fsSL https://cli.tigerdata.com | sh
   ```

2. **Create Service**:
   ```bash
   tiger service create
   ```

3. **Get Connection String**:
   ```bash
   tiger db connection-string --with-password
   ```

4. **Initialize Schema**:
   ```bash
   cd backend
   python scripts/init_tigerdb.py
   ```

### Supabase Setup

1. **Create Project**: Go to [Supabase](https://supabase.com/) and create a new project

2. **Run Schema**: In SQL Editor, run `backend/supabase_schema.sql`

3. **Get Credentials**: 
   - Project Settings → API
   - Copy `Project URL` and `anon public` key

4. **Enable Extensions**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   ```

## API Keys Setup

### Required Keys

**OpenAI API Key** (Minimum requirement):
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new secret key
3. Add to `backend/.env`: `OPENAI_API_KEY=sk-...`

### Recommended Keys

**Anthropic Claude**:
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create API key
3. Add to `backend/.env`: `ANTHROPIC_API_KEY=sk-ant-...`

**Google Gemini**:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to `backend/.env`: `GOOGLE_API_KEY=...`

**Exa API** (For research features):
1. Go to [Exa AI](https://exa.ai/)
2. Sign up and get API key
3. Add to `backend/.env`: `EXA_API_KEY=...`

## Feature Flags

### Backend Feature Flags

Control which features are enabled:

```env
# Quantum computing features
ENABLE_QUANTUM=false

# n8n workflow integration
USE_N8N=false

# Debug mode
DEBUG=true
```

### Frontend Feature Flags

```env
# Enable quantum features in UI
VITE_ENABLE_QUANTUM=false

# Enable HDAM features
VITE_ENABLE_HDAM=true

# Use n8n for workflows
VITE_USE_N8N=false
```

## Docker Configuration

### Environment Variables in Docker Compose

The `docker-compose.yml` file supports all environment variables. Set them in:

1. **`.env` file** (recommended):
   ```bash
   # Create .env in project root
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=sk-...
   # ... other variables
   ```

2. **Docker Compose directly**:
   Edit `docker-compose.yml` and add variables under `environment:` section

### Volume Mounts

Configure persistent storage:

```yaml
volumes:
  - ./backend/data:/app/data
  - ./backend/workspace:/app/workspace
  - ./backend/agent_workspace:/app/agent_workspace
```

## Performance Tuning

### Backend Performance

1. **Database Connection Pooling**:
   ```env
   DATABASE_POOL_SIZE=20
   DATABASE_MAX_OVERFLOW=10
   ```

2. **Caching**:
   ```env
   REDIS_URL=redis://localhost:6379  # Optional
   CACHE_TTL=3600
   ```

3. **Worker Processes**:
   ```bash
   uvicorn app.main:app --workers 4 --host 0.0.0.0 --port 8000
   ```

### Frontend Performance

1. **Build Optimization**:
   ```bash
   npm run build
   ```

2. **Production Mode**:
   ```env
   NODE_ENV=production
   ```

## Security Configuration

### Production Checklist

- [ ] Change `SECRET_KEY` to a strong random string
- [ ] Set `ENV=production`
- [ ] Set `DEBUG=false`
- [ ] Use HTTPS for API URLs
- [ ] Configure proper CORS origins
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Use environment-specific API keys

### Secret Key Generation

```python
import secrets
print(secrets.token_urlsafe(32))
```

## Verification

### Test Configuration

1. **Backend Health Check**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **Database Connection**:
   ```bash
   python backend/scripts/verify_tigerdb_integration.py
   ```

3. **API Endpoints**:
   ```bash
   python backend/scripts/test_api_connections.py
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Verify `DATABASE_URL` is correct
   - Check database is running
   - Verify network connectivity

2. **API Keys Not Working**:
   - Check key format (no extra spaces)
   - Verify key is active
   - Check API quota/limits

3. **HDAM Not Working**:
   - Verify Supabase credentials
   - Check vector extension is enabled
   - Verify ChromaDB path is writable

## Next Steps

- [Quick Start Guide](QUICKSTART.md)
- [How-To Guides](docs/HOW_TO_GUIDES.md)
- [API Documentation](http://localhost:8000/docs)

