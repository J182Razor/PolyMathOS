# PolyMathOS Quick Start Guide

Get PolyMathOS up and running in 5 minutes!

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/))
- **Git**

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/J182Razor/PolyMathOS.git
cd PolyMathOS
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Configure Environment Variables

**Backend Configuration:**

Copy the example environment file:
```bash
cp backend/env.example backend/.env
```

Edit `backend/.env` and add at minimum:
```env
# Required: Database
DATABASE_URL=postgresql://user:password@localhost:5432/polymathos
TIGERDB_URL=postgresql://user:password@localhost:5432/polymathos

# Required: At least one LLM API key
OPENAI_API_KEY=sk-your-key-here

# Optional but recommended
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
```

**Frontend Configuration:**

Copy the example environment file:
```bash
cp env.example .env
```

Edit `.env` and add:
```env
VITE_API_URL=http://localhost:8000
```

### 5. Initialize Database

```bash
cd backend
python scripts/init_tigerdb.py
```

Or if using TigerDB CLI:
```bash
tiger db init
```

### 6. Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
python scripts/start_server.py
```

Or manually:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 7. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## First Steps

1. **Sign Up**: Create your account
2. **Onboarding**: Complete the onboarding flow
   - Select your learning domains
   - Upload knowledge resources (optional)
   - Generate your first learning plan
3. **Start Learning**: Begin your first session!

## Docker Quick Start (Alternative)

If you prefer Docker:

```bash
# Copy environment files
cp backend/env.example backend/.env
cp env.example .env

# Edit .env files with your configuration

# Start services
docker-compose up -d
```

Access at:
- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:8000

## Troubleshooting

### Backend won't start

1. Check Python version: `python --version` (should be 3.11+)
2. Verify dependencies: `pip list | grep torch`
3. Check port 8000 is available: `netstat -ano | findstr :8000` (Windows) or `lsof -i :8000` (Mac/Linux)

### Frontend won't start

1. Check Node version: `node --version` (should be 18+)
2. Clear cache: `rm -rf node_modules package-lock.json && npm install`
3. Check port 5173 is available

### Database connection errors

1. Verify database is running
2. Check `DATABASE_URL` in `backend/.env`
3. Test connection: `python backend/scripts/verify_tigerdb_integration.py`

## Next Steps

- Read the [Configuration Guide](CONFIGURATION.md) for advanced setup
- Check [How-To Guides](docs/HOW_TO_GUIDES.md) for common tasks
- Explore the [API Documentation](http://localhost:8000/docs)

## Need Help?

- Check [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- Review [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)
- Open an issue on GitHub

