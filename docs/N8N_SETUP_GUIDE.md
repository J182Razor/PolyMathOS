# n8n Setup Guide for PolyMathOS

This guide will walk you through setting up n8n automation workflows for PolyMathOS, including environment variable management, LLM agent services, and data tracking.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [n8n Installation](#n8n-installation)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Workflow Import](#workflow-import)
6. [Credentials Setup](#credentials-setup)
7. [Testing Workflows](#testing-workflows)
8. [Integration with PolyMathOS](#integration-with-polymathos)

---

## Prerequisites

- Docker and Docker Compose installed
- Supabase account and project (or PostgreSQL database)
- API keys for:
  - NVIDIA API (from build.nvidia.com)
  - Gemini API (optional)
  - Groq API (optional)
- Access to your VPS/server

---

## n8n Installation

### Option 1: Docker Compose (Recommended)

Create a `docker-compose.n8n.yml` file:

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-poly
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=${N8N_HOST:-localhost}
      - N8N_PROTOCOL=${N8N_PROTOCOL:-http}
      - N8N_PORT=5678
      - WEBHOOK_URL=${N8N_WEBHOOK_URL:-http://localhost:5678}
      - GENERIC_TIMEZONE=UTC
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=${SUPABASE_DB_HOST}
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=${SUPABASE_DB_NAME}
      - DB_POSTGRESDB_USER=${SUPABASE_DB_USER}
      - DB_POSTGRESDB_PASSWORD=${SUPABASE_DB_PASSWORD}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - polymathos-network

volumes:
  n8n_data:

networks:
  polymathos-network:
    external: true
```

### Option 2: Standalone Installation

```bash
npm install n8n -g
n8n start
```

---

## Database Setup

### Create Required Tables in Supabase

Run the following SQL in your Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Learning sessions table
CREATE TABLE IF NOT EXISTS learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_type VARCHAR(50),
  topic VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  rpe_events INTEGER DEFAULT 0,
  confidence_scores JSONB,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_minutes INTEGER,
  final_score DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RPE events table
CREATE TABLE IF NOT EXISTS rpe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES learning_sessions(id) ON DELETE CASCADE,
  item_id VARCHAR(255),
  confidence DECIMAL(5,2),
  was_correct BOOLEAN,
  rpe_value DECIMAL(5,2),
  is_hyper_correction BOOLEAN DEFAULT FALSE,
  dopamine_impact DECIMAL(5,2),
  learning_value DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Spaced repetition items table
CREATE TABLE IF NOT EXISTS spaced_repetition_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id VARCHAR(255) NOT NULL,
  content TEXT,
  current_stage VARCHAR(20) DEFAULT 'learning',
  next_review_date TIMESTAMP,
  last_review_date TIMESTAMP,
  review_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- LLM interactions table
CREATE TABLE IF NOT EXISTS llm_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID,
  provider VARCHAR(50),
  message TEXT,
  response TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  total_sessions INTEGER DEFAULT 0,
  avg_score DECIMAL(5,2),
  total_minutes INTEGER DEFAULT 0,
  total_rpe_events INTEGER DEFAULT 0,
  avg_rpe DECIMAL(5,2),
  hyper_corrections INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Environment variables table
CREATE TABLE IF NOT EXISTS environment_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  is_secret BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_status ON learning_sessions(status);
CREATE INDEX IF NOT EXISTS idx_rpe_events_user_id ON rpe_events(user_id);
CREATE INDEX IF NOT EXISTS idx_rpe_events_session_id ON rpe_events(session_id);
CREATE INDEX IF NOT EXISTS idx_spaced_repetition_user_id ON spaced_repetition_items(user_id);
CREATE INDEX IF NOT EXISTS idx_spaced_repetition_next_review ON spaced_repetition_items(next_review_date);
CREATE INDEX IF NOT EXISTS idx_llm_interactions_user_id ON llm_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_env_vars_user_id ON environment_variables(user_id);
```

---

## Environment Configuration

### Create `.env` file for n8n

```env
# n8n Configuration
N8N_PASSWORD=your_secure_password_here
N8N_HOST=your-domain.com
N8N_PROTOCOL=https
N8N_WEBHOOK_URL=https://your-domain.com:5678
N8N_ENCRYPTION_KEY=your_32_character_encryption_key_here

# Supabase Database
SUPABASE_DB_HOST=db.your-project.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your_supabase_password

# API Keys (stored securely in n8n)
NVIDIA_API_KEY=your_nvidia_api_key
NVIDIA_MODEL=meta/llama-3.1-70b-instruct
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
```

### Generate Encryption Key

```bash
# Generate a secure 32-character key
openssl rand -hex 16
```

---

## Workflow Import

### Step 1: Access n8n

1. Navigate to `http://your-domain.com:5678` (or `http://localhost:5678` for local)
2. Login with your credentials (admin / your password)

### Step 2: Import Workflows

1. Click **"Workflows"** in the left sidebar
2. Click **"Import from File"** or **"Import from URL"**
3. Import each workflow file in order:
   - `01-user-authentication.json`
   - `02-llm-agent.json`
   - `03-learning-session-tracking.json`
   - `04-rpe-tracking.json`
   - `05-spaced-repetition.json`
   - `06-analytics-aggregation.json`
   - `07-environment-manager.json`

### Step 3: Activate Workflows

1. For each imported workflow, click the toggle switch to **activate** it
2. Ensure webhooks are accessible (check the webhook URLs)

---

## Credentials Setup

### 1. Supabase Database Credentials

1. In n8n, go to **Credentials** → **Add Credential**
2. Select **Postgres**
3. Fill in:
   - **Host**: Your Supabase database host
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: Your Supabase password
   - **Port**: `5432`
   - **SSL**: Enable (required for Supabase)
4. Name it: **"Supabase Database"**
5. Test the connection

### 2. Environment Variables in n8n

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:
   - `NVIDIA_API_KEY`
   - `GEMINI_API_KEY`
   - `GROQ_API_KEY`
   - `JWT_SECRET`
   - `N8N_WEBHOOK_URL`

### 3. Update Workflow Credentials

After importing workflows, update each workflow to use:
- The Supabase credentials you created
- Environment variables for API keys

---

## Testing Workflows

### Test User Authentication

```bash
# Sign Up
curl -X POST http://your-domain.com:5678/webhook/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Sign In
curl -X POST http://your-domain.com:5678/webhook/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Test LLM Agent

```bash
curl -X POST http://your-domain.com:5678/webhook/agent-chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "nvidia",
    "message": "Help me set learning goals",
    "userId": "user-id-here",
    "sessionId": "session-id-here"
  }'
```

### Test RPE Tracking

```bash
curl -X POST http://your-domain.com:5678/webhook/rpe-record \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-here",
    "sessionId": "session-id-here",
    "itemId": "item-123",
    "confidence": 85,
    "wasCorrect": false
  }'
```

---

## Integration with PolyMathOS

### Update Frontend to Use n8n Webhooks

Create a service file `src/services/N8NService.ts`:

```typescript
const N8N_BASE_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678';

export class N8NService {
  static async signUp(email: string, password: string, firstName: string, lastName: string) {
    const response = await fetch(`${N8N_BASE_URL}/webhook/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
    return response.json();
  }

  static async signIn(email: string, password: string) {
    const response = await fetch(`${N8N_BASE_URL}/webhook/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  static async chatWithAgent(message: string, provider: string = 'nvidia', userId?: string) {
    const response = await fetch(`${N8N_BASE_URL}/webhook/agent-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, provider, userId }),
    });
    return response.json();
  }

  static async recordRPE(userId: string, sessionId: string, itemId: string, confidence: number, wasCorrect: boolean) {
    const response = await fetch(`${N8N_BASE_URL}/webhook/rpe-record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, sessionId, itemId, confidence, wasCorrect }),
    });
    return response.json();
  }

  static async startSession(userId: string, sessionType: string, topic: string) {
    const response = await fetch(`${N8N_BASE_URL}/webhook/session-start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, sessionType, topic }),
    });
    return response.json();
  }

  static async getEnvVariables(userId?: string) {
    const url = userId 
      ? `${N8N_BASE_URL}/webhook/get-env?userId=${userId}`
      : `${N8N_BASE_URL}/webhook/get-env`;
    const response = await fetch(url);
    return response.json();
  }

  static async setEnvVariable(userId: string, key: string, value: string, description?: string, isSecret: boolean = false) {
    const response = await fetch(`${N8N_BASE_URL}/webhook/set-env`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, key, value, description, isSecret }),
    });
    return response.json();
  }
}
```

---

## Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Authentication**: Enable n8n basic auth
3. **API Keys**: Store API keys in n8n environment variables, not in code
4. **Database**: Use SSL connections to Supabase
5. **Webhooks**: Consider adding webhook authentication tokens
6. **Rate Limiting**: Implement rate limiting for webhooks

---

## Troubleshooting

### Workflow Not Triggering

- Check if workflow is **activated**
- Verify webhook URL is correct
- Check n8n execution logs

### Database Connection Issues

- Verify Supabase credentials
- Check if SSL is enabled
- Ensure database host is accessible

### API Key Errors

- Verify environment variables are set in n8n
- Check API key format
- Ensure keys are valid and not expired

---

## Next Steps

1. Set up monitoring for n8n workflows
2. Configure backup for n8n data
3. Set up alerts for failed workflows
4. Document custom workflows you create

For more information, visit [n8n documentation](https://docs.n8n.io/).

