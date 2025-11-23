# 🧠 PolyMathOS v2.1 - AI-Enhanced Genius Learning Platform

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-green.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Transform your learning with AI + Quantum Computing + Self-Evolving Agents to achieve genius-level intelligence**

PolyMathOS is a revolutionary learning platform that combines cutting-edge neuroscience research, quantum computing, multi-agent AI collaboration, and self-evolving intelligence to create the most advanced learning experience possible.

## 🌟 Key Features

*   **Holographic Associative Memory (HDAM)**: Quantum-enhanced memory system for instant knowledge retrieval and synthesis.
*   **Self-Evolving Agents**: 8 specialized AI agents (Researcher, Strategist, etc.) that improve over time using Lemon AI.
*   **Quantum Optimization**: Use quantum annealing to optimize learning paths for maximum efficiency.
*   **Multi-Modal Learning**: Upload PDFs, Docs, and connect to datasets for personalized curriculum generation.
*   **Neuroscience-Based**: RPE, spaced repetition, and interleaving built-in.

---

## 🛠️ Complete Setup Guide

### 1. Prerequisites
*   **Node.js** 18+ ([Download](https://nodejs.org/))
*   **Python** 3.9+ ([Download](https://www.python.org/))
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

### 3. Database & Storage Setup (Supabase)
PolyMathOS uses Supabase for vector storage and authentication.

1.  Go to [Supabase](https://supabase.com/) and create a new project.
2.  In the SQL Editor, run the script found in `backend/supabase_schema.sql` to set up tables and vector extensions.
3.  Go to **Project Settings > API** and copy your `Project URL` and `anon public` key.

### 4. API Key Configuration
To unlock the full power of PolyMathOS, you need API keys. You can configure these in the `.env` file or via the **Settings** UI in the app.

**Required Keys:**
*   **OpenAI API Key**: For core reasoning ([Get Key](https://platform.openai.com/api-keys))
*   **Supabase URL & Key**: For storage (From step 3)

**Optional (Recommended) Keys:**
*   **Anthropic API Key**: For advanced reasoning (Claude) ([Get Key](https://console.anthropic.com/))
*   **NVIDIA API Key**: For specialized models ([Get Key](https://build.nvidia.com/))
*   **Groq API Key**: For ultra-fast inference ([Get Key](https://console.groq.com/))
*   **Google Gemini API Key**: For multimodal processing ([Get Key](https://makersuite.google.com/app/apikey))
*   **D-Wave Leap Token**: For real quantum hardware access ([Get Key](https://cloud.dwavesys.com/leap/))

### 5. Environment Variables
Create a `.env` file in the `backend` folder:

```bash
# backend/.env
SUPABASE_URL="your_supabase_project_url"
SUPABASE_KEY="your_supabase_anon_key"
OPENAI_API_KEY="sk-..."
# Add other keys as needed
```

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
MIT License. See [LICENSE](LICENSE).

---
**PolyMathOS** - *Where Science Meets Learning, Quantum Meets Intelligence.*
