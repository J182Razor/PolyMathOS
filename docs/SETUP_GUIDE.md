# PolyMathOS - Comprehensive Setup Guide

This guide will walk you through setting up PolyMathOS from scratch, including all components: frontend, backend, quantum computing, multi-agent systems, and storage.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Frontend Setup](#frontend-setup)
4. [Backend Setup](#backend-setup)
5. [Database Setup](#database-setup)
6. [n8n Setup](#n8n-setup)
7. [Quantum Computing Setup](#quantum-computing-setup)
8. [Lemon AI Setup](#lemon-ai-setup)
9. [Environment Configuration](#environment-configuration)
10. [Docker Setup (Recommended)](#docker-setup-recommended)
11. [Verification & Testing](#verification--testing)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **Node.js 18+**
   ```bash
   # Check version
   node --version  # Should be 18.0.0 or higher
   npm --version
   ```

2. **Python 3.9+**
   ```bash
   # Check version
   python3 --version  # Should be 3.9.0 or higher
   pip3 --version
   ```

3. **Docker & Docker Compose** (Optional but recommended)
   ```bash
   # Check installation
   docker --version
   docker-compose --version
   ```

4. **Git**
   ```bash
   git --version
   ```

### Optional but Recommended

- **PostgreSQL 14+** (for database persistence)
- **Supabase Account** (for cloud storage)
- **n8n** (for workflow automation)
- **Quantum Computing Access** (D-Wave, IBM Quantum, etc.)

---

## System Requirements

### Minimum Requirements
- **CPU**: 4 cores
- **RAM**: 4GB
- **Storage**: 5GB free space
- **OS**: macOS 10.15+, Ubuntu 20.04+, Windows 10+ (with WSL2)

### Recommended Requirements
- **CPU**: 8+ cores
- **RAM**: 16GB+
- **GPU**: NVIDIA RTX 3080+ (for quantum simulations)
- **Storage**: 20GB+ SSD
- **Network**: Stable internet connection

---

## Frontend Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/J182Razor/PolyMathOS.git
cd PolyMathOS
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- React 19
- TypeScript
- Tailwind CSS
- Vite
- All frontend dependencies

### Step 3: Configure Environment

Create `.env` file in the root directory:

```bash
cp .env.example .env  # If example exists
# Or create manually
```

Add configuration:

```env
# Frontend Configuration
VITE_API_URL=http://localhost:8000
VITE_N8N_WEBHOOK_URL=http://localhost:5678
VITE_USE_N8N=true

# Optional: Supabase (if using)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: Start Development Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Step 5: Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

---

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Create Virtual Environment (Recommended)

```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

**Note**: Some dependencies may require system libraries:
- **PyTorch**: May need CUDA for GPU support
- **Quantum libraries**: May need additional setup (see Quantum Computing Setup)
- **PostgreSQL**: Requires `psycopg2-binary` (included)
- **PyAudio**: Optional - requires PortAudio (see troubleshooting if needed)

**If you encounter PyAudio installation errors**, it's safe to skip it as it's not used in the core system. See [Troubleshooting](#troubleshooting) section for details.

### Step 4: Configure Environment

Create `backend/.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/polymathos

# Supabase (Optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# LLM API Keys (Optional - router will use available ones)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
GROQ_API_KEY=...
NVIDIA_API_KEY=...

# Quantum Computing (Optional)
DWAVE_API_TOKEN=...
IBM_QUANTUM_TOKEN=...

# Lemon AI (Optional)
LEMON_AI_PATH=./lemonai

# Application
ENV=development
DEBUG=true
```

### Step 5: Start Backend Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Backend API will be available at:
- API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Database Setup

### Option 1: PostgreSQL (Recommended)

#### Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from [PostgreSQL website](https://www.postgresql.org/download/windows/)

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE polymathos;

# Create user (optional)
CREATE USER polymathos_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE polymathos TO polymathos_user;

# Exit
\q
```

#### Update Connection String

In `backend/.env`:
```env
DATABASE_URL=postgresql://polymathos_user:your_password@localhost:5432/polymathos
```

The backend will automatically create tables on first run.

### Option 2: Supabase (Cloud)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Project Settings > Database
4. Update `DATABASE_URL` in `backend/.env`

---

## n8n Setup

### Option 1: Docker (Recommended)

```bash
# Create Docker network
docker network create polymathos-network

# Start n8n
docker-compose -f docker-compose.n8n.yml up -d
```

### Option 2: Manual Installation

```bash
npm install -g n8n
n8n start
```

### Configure n8n

1. Access n8n at `http://localhost:5678`
2. Create admin account
3. Import workflows from `n8n-workflows/` directory
4. Activate workflows
5. Get webhook URLs from each workflow

### Update Frontend Configuration

In frontend `.env`:
```env
VITE_N8N_WEBHOOK_URL=http://localhost:5678
```

Or configure in Settings Modal after starting the app.

---

## Quantum Computing Setup

### Option 1: Simulators (No Setup Required)

The system works with quantum simulators out of the box:
- **PennyLane**: Default simulator
- **Qiskit Aer**: IBM simulator
- **D-Wave dimod**: Classical solver fallback

### Option 2: D-Wave (Real Hardware)

1. Sign up at [D-Wave Leap](https://www.dwavesys.com/take-leap)
2. Get API token
3. Add to `backend/.env`:
   ```env
   DWAVE_API_TOKEN=your-token
   ```
4. Update backend code to use `quantum_backend='dwave'`

### Option 3: IBM Quantum

1. Sign up at [IBM Quantum](https://quantum-computing.ibm.com/)
2. Get API token
3. Install Qiskit:
   ```bash
   pip install qiskit[visualization] qiskit-ibm-provider
   ```
4. Configure in code (see Qiskit documentation)

### Option 4: PennyLane Cloud

1. Sign up at [PennyLane Cloud](https://pennylane.ai/cloud)
2. Configure access (see PennyLane docs)

**Note**: Quantum hardware access is optional. The system works perfectly with simulators.

---

## Lemon AI Setup

### Option 1: Use Built-in Integration (Recommended)

The system includes Lemon AI integration that works without additional setup. Agents will evolve automatically.

### Option 2: Full Lemon AI Framework

1. Clone Lemon AI:
   ```bash
   git clone https://github.com/hexdocom/lemonai.git
   cd lemonai
   ```

2. Follow Lemon AI setup instructions

3. Set path in `backend/.env`:
   ```env
   LEMON_AI_PATH=/path/to/lemonai
   ```

**Note**: Lemon AI is optional. The system has fallback implementations.

---

## Environment Configuration

### Complete `.env` Template

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:8000
VITE_N8N_WEBHOOK_URL=http://localhost:5678
VITE_USE_N8N=true
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Backend `backend/.env`:**
```env
# Application
ENV=development
DEBUG=true

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/polymathos

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# LLM API Keys (at least one recommended)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
GROQ_API_KEY=...
NVIDIA_API_KEY=...

# Quantum (optional)
DWAVE_API_TOKEN=...
IBM_QUANTUM_TOKEN=...

# Lemon AI (optional)
LEMON_AI_PATH=./lemonai
```

---

## Docker Setup (Recommended)

### Quick Start with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services Included

- **Frontend**: React app on port 80
- **Backend**: FastAPI on port 8000
- **n8n**: Automation on port 5678 (if configured)

### Custom Configuration

Edit `docker-compose.yml` to customize:
- Ports
- Environment variables
- Volume mounts
- Resource limits

---

## Verification & Testing

### Step 1: Check Frontend

1. Open `http://localhost:5173`
2. You should see the PolyMathOS homepage
3. Try signing up or signing in

### Step 2: Check Backend API

1. Open `http://localhost:8000/docs`
2. You should see the FastAPI documentation
3. Test the root endpoint:
   ```bash
   curl http://localhost:8000/
   ```
   Should return: `{"status":"active","system":"PolyMathOS Genius Engine"}`

### Step 3: Check System Status

```bash
curl http://localhost:8000/system/status
```

Should return system capabilities and module status.

### Step 4: Test User Enrollment

```bash
curl -X POST http://localhost:8000/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "interests": ["machine learning", "quantum computing"]
  }'
```

### Step 5: Test LLM Router

```bash
curl -X POST http://localhost:8000/llm/select \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "research_analysis",
    "priority": "quality",
    "requires_reasoning": true
  }'
```

### Step 6: Test Multi-Agent Collaboration

```bash
curl -X POST http://localhost:8000/collaboration/solve \
  -H "Content-Type: application/json" \
  -d '{
    "problem_statement": {
      "description": "Design an optimal learning path for quantum computing",
      "domain": "education"
    },
    "user_id": "test_user"
  }'
```

### Step 7: Test Frontend Settings

1. Sign in to the app
2. Click "Settings" button
3. Configure n8n URL
4. Add API keys
5. Test n8n connection

---

## Troubleshooting

### Frontend Issues

**Problem**: `npm install` fails
- **Solution**: Clear cache and retry
  ```bash
  npm cache clean --force
  rm -rf node_modules package-lock.json
  npm install
  ```

**Problem**: Port 5173 already in use
- **Solution**: Change port in `vite.config.ts` or kill process
  ```bash
  lsof -ti:5173 | xargs kill -9
  ```

**Problem**: Build errors
- **Solution**: Check Node.js version (need 18+)
  ```bash
  node --version
  ```

### Backend Issues

**Problem**: Import errors
- **Solution**: Ensure virtual environment is activated
  ```bash
  source venv/bin/activate  # macOS/Linux
  pip install -r requirements.txt
  ```

**Problem**: Database connection fails
- **Solution**: Check PostgreSQL is running and credentials are correct
  ```bash
  psql -U postgres -c "SELECT version();"
  ```

**Problem**: Quantum libraries fail to import
- **Solution**: Install optional dependencies or use simulator mode
  ```bash
  pip install pennylane qiskit dimod
  ```

**Problem**: PyAudio installation fails (`Failed to build pyaudio`)
- **Solution**: PyAudio is optional and not used in core system. You can skip it:
  - The error is safe to ignore - PyAudio is commented out in requirements.txt
  - If you need audio features later, install system dependencies first:
    ```bash
    # macOS
    brew install portaudio
    pip install pyaudio
    
    # Ubuntu/Debian
    sudo apt-get install portaudio19-dev
    pip install pyaudio
    
    # Windows
    # Use conda: conda install pyaudio
    ```
  - See `backend/INSTALL_PYAUDIO.md` for detailed instructions

**Problem**: Port 8000 already in use
- **Solution**: Change port or kill process
  ```bash
  lsof -ti:8000 | xargs kill -9
  # Or use different port
  uvicorn app.main:app --port 8001
  ```

### n8n Issues

**Problem**: n8n won't start
- **Solution**: Check Docker network exists
  ```bash
  docker network create polymathos-network
  ```

**Problem**: Webhooks not working
- **Solution**: Ensure workflows are activated and webhook URLs are correct

### General Issues

**Problem**: CORS errors
- **Solution**: Backend CORS is configured, but check frontend URL matches `VITE_API_URL`

**Problem**: API keys not working
- **Solution**: Verify keys are correct and have proper permissions

**Problem**: Quantum simulations slow
- **Solution**: This is normal. Use smaller problem sizes or real hardware for speed

---

## Next Steps

After setup is complete:

1. **Read the Usage Guide**: See `docs/USAGE_GUIDE.md` for detailed feature documentation
2. **Configure Settings**: Use the Settings Modal to add API keys
3. **Take Assessment**: Complete cognitive assessment for personalization
4. **Start Learning**: Begin your first learning session
5. **Explore Features**: Try all the learning tools and features

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review [Debug Reports](DEBUG_REPORT_V2.1.md)
3. Check [GitHub Issues](https://github.com/J182Razor/PolyMathOS/issues)
4. Review API documentation at `http://localhost:8000/docs`

---

**Setup Complete!** 🎉 You're ready to start using PolyMathOS!

