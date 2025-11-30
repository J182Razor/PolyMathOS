# 🧠 PolyMathOS v2.1 - AI-Enhanced Genius Learning Platform

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-green.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)


> **Transform your learning with AI + Quantum Computing + Self-Evolving Agents to achieve genius-level intelligence**

PolyMathOS is a revolutionary learning platform that combines cutting-edge neuroscience research, quantum computing, multi-agent AI collaboration, and self-evolving intelligence to create the most advanced learning experience possible.

## 🌟 Key Features

*   **Holographic Associative Memory (HDAM)**: Quantum-enhanced memory system for instant knowledge retrieval and synthesis.
*   **Self-Evolving Agents**: 8 specialized AI agents (Researcher, Strategist, etc.) that improve over time using Lemon AI.
*   **Quantum Optimization**: Use quantum annealing to optimize learning paths for maximum efficiency.
*   **Multi-Modal Learning**: Upload PDFs, Docs, and connect to datasets for personalized curriculum generation.
*   **Neuroscience-Based**: RPE, spaced repetition, and interleaving built-in.

---

## 📚 Documentation

**Quick Links:**
- **[Quick Start Guide](QUICKSTART.md)** - Get up and running in 5 minutes
- **[Configuration Guide](CONFIGURATION.md)** - Complete configuration reference
- **[Setup Guide](docs/SETUP_GUIDE.md)** - Comprehensive setup instructions
- **[How-To Guides](docs/HOW_TO_GUIDES.md)** - Step-by-step guides for common tasks
- **[Docker Setup](docs/DOCKER_SETUP.md)** - Containerized deployment guide

## 🛠️ Quick Setup

### 1. Prerequisites
*   **Node.js** 18+ ([Download](https://nodejs.org/))
*   **Python** 3.11+ ([Download](https://www.python.org/))
*   **Docker** (Optional, for containerized deployment)
*   **Git**

### 2. Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/J182Razor/PolyMathOS.git
    cd PolyMathOS
    ```

2.  **Install Frontend Dependencies**
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies**
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

### 3. Configuration

**Backend Configuration:**
```bash
cp backend/env.example backend/.env
# Edit backend/.env with your settings
```

**Frontend Configuration:**
```bash
cp env.example .env
# Edit .env with your settings
```

**Minimum Required Configuration:**
- `DATABASE_URL` - Database connection string
- `OPENAI_API_KEY` - At least one LLM API key

See [Configuration Guide](CONFIGURATION.md) for complete details.

### 4. Initialize Database

```bash
cd backend
python scripts/init_tigerdb.py
```

### 5. Start Servers

**Backend:**
```bash
cd backend
python scripts/start_server.py
```

**Frontend:**
```bash
npm run dev
```

Access at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

For detailed setup instructions, see the [Quick Start Guide](QUICKSTART.md) or [Complete Setup Guide](docs/SETUP_GUIDE.md).

---

## 🚀 How to Use PolyMathOS

### Step 1: Start the System
Open two terminals:

**Terminal 1 (Backend):**
```bash
cd backend
uvicorn app.main:app --reload
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```
Visit `http://localhost:5173` in your browser.

### Step 2: Setting Up Your First Domain
1.  **Onboarding**: When you first log in, you'll be guided through an onboarding process.
2.  **Select Interests**: Choose your primary domains (e.g., "Quantum Physics", "Machine Learning").
3.  **Assessment**: (Optional) Take a brief cognitive assessment to tailor the difficulty.

### Step 3: Adding Knowledge Sources
PolyMathOS learns from what you provide.
1.  Go to the **Learning Dashboard**.
2.  Click **"Upload Resources"**.
3.  **Upload Files**: Drag & drop PDF textbooks, research papers (DOCX), or notes (TXT). The system will extract text and generate vector embeddings.
4.  **Add Links**: Paste URLs to YouTube playlists, Coursera courses, or GitHub repositories.
5.  **Search Datasets**: Use the **Resource Library** to find free datasets from Kaggle, arXiv, and more directly within the app.

### Step 4: Creating a Learning Plan
1.  Navigate to **"Curriculum Builder"**.
2.  **Define Goal**: Enter a goal like "Master Generative AI" or "Learn Spanish".
3.  **Select Timeline**: Choose your duration:
    *   **1 Day** (Crash Course)
    *   **1 Week** (Intensive Sprint)
    *   **1 Month** (Solid Foundation)
    *   **3 Months** (Proficiency)
    *   **6 Months** (Mastery)
    *   **1 Year** (Expert/PhD Level)
4.  **Generate**: Click "Generate Plan". The **Quantum Optimization Engine** will create the most efficient path, balancing theory, practice, and spaced repetition.

### Step 5: Daily Lesson Plans (AI Generated)
1.  Start your **Daily Session** from the dashboard.
2.  **AI Lesson**: The AI creates a personalized lesson for today based on your plan.
    *   It explains concepts using analogies from your known domains.
    *   It quizzes you to check understanding (RPE protocol).
    *   It adjusts difficulty in real-time.
3.  **Feedback**: Rate the lesson. The **Self-Evolving Agents** use this feedback to improve future lessons.

---

## 🧠 Advanced Features

### Quantum-Enhanced Reasoning
Enable "Genius Mode" to use simulated (or real) quantum annealing for:
*   **Pattern Recognition**: Finding hidden connections between disparate topics.
*   **Problem Solving**: Using multi-agent swarms to solve complex logic puzzles.

### Multi-Agent Collaboration
For complex queries, use the **"Collaborate"** feature.
*   **Researcher Agent**: Gathers data.
*   **Strategist Agent**: Plans the approach.
*   **Critic Agent**: Reviews for errors.
*   **Synthesizer Agent**: Combines everything into a final answer.

---

## 📊 API Documentation

Full API docs are available at `http://localhost:8000/docs` when the backend is running.

### Key Endpoints
*   `POST /learning/onboard`: Upload files and set interests.
*   `POST /learning/path`: Generate a personalized learning path.
*   `POST /quantum/optimize-path`: Optimize curriculum using quantum algorithms.
*   `POST /agents/evolve`: Trigger agent self-improvement.

---

## 🤝 Contributing
We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License
See [LICENSE](LICENSE).

---
**PolyMathOS** - *Where Science Meets Learning, Quantum Meets Intelligence.*
