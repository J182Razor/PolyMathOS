# PolyMathOS - n8n Integration Guide

This document provides a complete guide for setting up and using n8n automation workflows with PolyMathOS.

## 🎯 Overview

PolyMathOS now integrates with n8n for:
- **Centralized Agent Management**: All LLM interactions routed through n8n
- **Environment Variable Management**: Secure storage and retrieval of API keys
- **Automated Workflows**: Learning session tracking, RPE events, spaced repetition scheduling
- **Analytics Aggregation**: Automated data processing and insights

## 📦 Quick Start

### 1. Prerequisites

- Docker and Docker Compose
- Supabase account (or PostgreSQL database)
- API keys for NVIDIA, Gemini, Groq (optional)

### 2. Database Setup

Run the SQL schema in `docs/database-schema.sql` in your Supabase SQL Editor.

### 3. Start n8n

```bash
# Create network if it doesn't exist
docker network create polymathos-network

# Start n8n
docker-compose -f docker-compose.n8n.yml up -d
```

### 4. Configure Environment Variables

Create a `.env` file for n8n:

```env
N8N_PASSWORD=your_secure_password
N8N_HOST=your-domain.com
N8N_PROTOCOL=https
N8N_WEBHOOK_URL=https://your-domain.com:5678
N8N_ENCRYPTION_KEY=your_32_char_key
SUPABASE_DB_HOST=db.your-project.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your_password
```

### 5. Import Workflows

1. Access n8n at `http://your-domain.com:5678`
2. Login with your credentials
3. Import all workflows from `n8n-workflows/` directory
4. Activate each workflow

### 6. Configure Frontend

Add to your `.env` file:

```env
VITE_USE_N8N=true
VITE_N8N_WEBHOOK_URL=https://your-domain.com:5678
```

## 🔧 Workflow Details

### 1. User Authentication (`01-user-authentication.json`)

**Endpoints:**
- `POST /webhook/signup` - User registration
- `POST /webhook/signin` - User login

**Usage:**
```typescript
import { N8NService } from './services/N8NService';

// Sign up
const signUpResult = await N8NService.signUp({
  email: 'user@example.com',
  password: 'secure123',
  firstName: 'John',
  lastName: 'Doe'
});

// Sign in
const signInResult = await N8NService.signIn({
  email: 'user@example.com',
  password: 'secure123'
});
```

### 2. LLM Agent Service (`02-llm-agent.json`)

**Endpoints:**
- `POST /webhook/agent-chat` - Chat with AI agent

**Usage:**
```typescript
const response = await N8NService.chatWithAgent({
  message: 'Help me understand quantum physics',
  provider: 'nvidia', // or 'gemini', 'groq'
  userId: 'user-id',
  sessionId: 'session-id'
});
```

**Features:**
- Automatic provider routing
- Response normalization
- Interaction logging
- Token usage tracking

### 3. Learning Session Tracking (`03-learning-session-tracking.json`)

**Endpoints:**
- `POST /webhook/session-start` - Start a learning session
- `POST /webhook/session-update` - Update session progress
- `POST /webhook/session-complete` - Complete a session

**Usage:**
```typescript
// Start session
const session = await N8NService.startSession({
  userId: 'user-id',
  sessionType: 'lesson',
  topic: 'Quantum Physics'
});

// Update session
await N8NService.updateSession(session.sessionId, {
  questionsAnswered: 10,
  correctAnswers: 8,
  rpeEvents: 5
});

// Complete session
await N8NService.completeSession(session.sessionId, {
  durationMinutes: 30,
  finalScore: 80
});
```

### 4. RPE Tracking (`04-rpe-tracking.json`)

**Endpoints:**
- `POST /webhook/rpe-record` - Record a reward prediction error event

**Usage:**
```typescript
const rpeResult = await N8NService.recordRPE({
  userId: 'user-id',
  sessionId: 'session-id',
  itemId: 'item-123',
  confidence: 85,
  wasCorrect: false
});

// Returns:
// {
//   success: true,
//   rpe: {
//     value: -0.85,
//     isHyperCorrection: true,
//     dopamineImpact: -0.8,
//     learningValue: 1.0
//   }
// }
```

### 5. Spaced Repetition Scheduler (`05-spaced-repetition.json`)

**Endpoints:**
- `POST /webhook/sr-process` - Process a spaced repetition review

**Features:**
- Automatic scheduling (runs hourly)
- User notifications for due items
- SM-2 algorithm implementation

**Usage:**
```typescript
const result = await N8NService.processSpacedRepetition({
  itemId: 'item-123',
  wasCorrect: true,
  confidence: 90,
  item: { /* item data */ }
});
```

### 6. Analytics Aggregation (`06-analytics-aggregation.json`)

**Features:**
- Runs every 6 hours
- Aggregates session data
- Calculates RPE statistics
- Stores in `user_analytics` table

### 7. Environment Variable Manager (`07-environment-manager.json`)

**Endpoints:**
- `GET /webhook/get-env?userId=xxx` - Get environment variables
- `POST /webhook/set-env` - Set environment variable

**Usage:**
```typescript
// Get variables
const vars = await N8NService.getEnvVariables('user-id');

// Set variable
await N8NService.setEnvVariable({
  userId: 'user-id',
  key: 'NVIDIA_API_KEY',
  value: 'your-key',
  description: 'NVIDIA API Key',
  isSecret: true
});
```

## 🔐 Security Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **Authentication**: Enable n8n basic auth
3. **API Keys**: Store in n8n environment variables, not code
4. **Database SSL**: Always use SSL for Supabase connections
5. **Webhook Tokens**: Consider adding authentication tokens to webhooks
6. **Rate Limiting**: Implement rate limiting for public webhooks

## 🐳 Docker Deployment

### Full Stack Deployment

```bash
# Start PolyMathOS
docker-compose up -d

# Start n8n
docker-compose -f docker-compose.n8n.yml up -d
```

### Network Configuration

Both services use the `polymathos-network` Docker network for communication.

## 📊 Monitoring

### Check n8n Health

```bash
curl http://your-domain.com:5678/healthz
```

### View Workflow Executions

1. Access n8n UI
2. Go to "Executions" tab
3. View execution history and logs

### Database Monitoring

Monitor your Supabase dashboard for:
- Table growth
- Query performance
- Connection counts

## 🔄 Integration with Frontend

The `N8NService` class provides a clean interface for all n8n interactions:

```typescript
import { N8NService } from './services/N8NService';

// Check if n8n is available
const isAvailable = await N8NService.checkHealth();

if (isAvailable) {
  // Use n8n for all operations
  const response = await N8NService.chatWithAgent({
    message: 'Hello!',
    provider: 'nvidia'
  });
} else {
  // Fallback to direct API calls
  // ... existing code
}
```

## 🛠️ Troubleshooting

### Workflow Not Triggering

- Check if workflow is **activated**
- Verify webhook URL is correct
- Check n8n execution logs
- Verify database connection

### Database Connection Issues

- Verify Supabase credentials
- Check if SSL is enabled
- Ensure database host is accessible
- Check firewall rules

### API Key Errors

- Verify environment variables in n8n
- Check API key format
- Ensure keys are valid and not expired
- Check n8n execution logs for detailed errors

### Frontend Connection Issues

- Verify `VITE_N8N_WEBHOOK_URL` is set correctly
- Check CORS settings in n8n
- Verify network connectivity
- Check browser console for errors

## 📚 Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Supabase Documentation](https://supabase.com/docs)
- [PolyMathOS Main README](./README.md)
- [n8n Setup Guide](./docs/N8N_SETUP_GUIDE.md)

## 🚀 Next Steps

1. Set up monitoring and alerts
2. Configure backup for n8n data
3. Create custom workflows for your needs
4. Set up CI/CD for workflow updates
5. Implement webhook authentication tokens

## 📝 License

Same as PolyMathOS main project.

