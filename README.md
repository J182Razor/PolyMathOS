# 🧠 PolyMathOS v2.1 - AI-Enhanced Genius Learning Platform

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-green.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Transform your learning with AI + Quantum Computing + Self-Evolving Agents to achieve genius-level intelligence**

PolyMathOS is a revolutionary learning platform that combines cutting-edge neuroscience research, quantum computing, multi-agent AI collaboration, and self-evolving intelligence to create the most advanced learning experience possible. Our platform uses advanced dopamine optimization, meta-learning techniques, quantum-enhanced optimization, and intelligent agent systems to adapt and evolve with your learning journey.

## 🌟 Key Features

### 🧠 **Neuroscience-Based Learning (Project 144 Research)**
- **Reward Prediction Error (RPE) System**: Confidence tracking before answers triggers optimal dopamine responses
- **Hyper-Correction Detection**: High-confidence errors create massive learning opportunities
- **Enhanced Spaced Repetition**: Research-based intervals (Day 0, 1, 3-4, 7, 14, 30, 3mo, 6mo, 1yr)
- **Learning State Management**: Alpha (8-12 Hz) for reading, Theta (4-8 Hz) for visualization
- **Image Streaming**: Win Wenger protocol for visual intelligence training
- **Variable Ratio Rewards**: Dice roll system for maximum engagement
- **Interleaving Practice**: 3×3 daily loop with domain switching
- **DARPA Problem-First Protocol**: Problem-first learning with knowledge gap identification

### ⚛️ **Quantum Computing Integration**
- **Quantum Optimization Engine**: QAOA and quantum annealing for learning path optimization
- **Quantum Pattern Recognition**: Quantum kernel methods and convolutional networks
- **Quantum Neural Networks**: Full quantum neural network implementation with backpropagation
- **Quantum Feature Selection**: Optimal feature selection using quantum algorithms
- **Multiple Backends**: D-Wave, IBM Qiskit, PennyLane, and simulators

### 🤖 **Intelligent AI Systems**
- **Intelligent LLM Router**: Dynamic model selection based on task requirements (quality, speed, cost)
- **Self-Evolving Agents**: All 8 specialized agents improve automatically using Lemon AI framework
- **Multi-Agent Collaboration**: 8 specialized agents working together for collective intelligence
- **Performance Tracking**: Comprehensive metrics and automatic optimization
- **Automatic Failover**: Smart model switching on errors

### 🎯 **Advanced Learning Features**
- **Memory Palaces**: Method of Loci with 144-grid structure
- **Mind Mapping**: Tony Buzan's radiant thinking for semantic networks
- **Deep Work Blocks**: Focused practice sessions with activity tracking
- **Cross-Domain Projects**: Synthesize knowledge across multiple fields
- **TRIZ Application**: 40 inventive principles for creative problem-solving
- **Reflection Journal**: Structured reflection with mood tracking
- **Flashcard System**: SM-2 spaced repetition algorithm
- **Brainwave Generator**: Binaural beats for optimal learning states

### 📊 **Storage & Persistence**
- **Local Filesystem**: Automatic versioning and organization
- **Supabase Cloud Storage**: Public URL generation for artifacts
- **PostgreSQL Database**: Task/execution history, agent evolution tracking
- **Artifact Management**: Versioned storage with automatic organization

### 🔧 **Automation & Integration**
- **n8n Integration**: Workflow automation and centralized agent management
- **Multiple LLM Providers**: OpenAI, Anthropic, Google, Groq, NVIDIA, DeepSeek, Ollama, Lemon AI
- **API-First Architecture**: 18+ RESTful API endpoints
- **Docker Support**: Complete containerization for easy deployment

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.9+ (for backend)
- **Docker** and Docker Compose (optional, for full stack)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/J182Razor/PolyMathOS.git
   cd PolyMathOS
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Frontend (.env)
   VITE_API_URL=http://localhost:8000
   VITE_N8N_WEBHOOK_URL=http://localhost:5678
   
   # Backend (backend/.env)
   DATABASE_URL=postgresql://user:pass@localhost:5432/polymathos
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   OPENAI_API_KEY=your-key
   ANTHROPIC_API_KEY=your-key
   # ... other API keys
   ```

5. **Start the services**
   ```bash
   # Option 1: Docker Compose (Recommended)
   docker-compose up --build
   
   # Option 2: Manual
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend
   cd backend
   uvicorn app.main:app --reload
   
   # Terminal 3: n8n (optional)
   docker-compose -f docker-compose.n8n.yml up
   ```

6. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`
   - n8n: `http://localhost:5678`

## 📖 Documentation

### Setup & Installation
- **[Comprehensive Setup Guide](docs/SETUP_GUIDE.md)** - Complete installation and configuration
- **[Docker Setup Guide](docs/DOCKER_SETUP.md)** - Container-based deployment
- **[n8n Integration Guide](README_N8N_INTEGRATION.md)** - Automation setup

### Usage Guides
- **[Comprehensive Usage Guide](docs/USAGE_GUIDE.md)** - Complete feature documentation with examples
- **[User Onboarding Guide](docs/USER_ONBOARDING_GUIDE.md)** - Getting started as a user
- **[Developer How-To Guide](docs/DEVELOPER_HOW_TO_GUIDE.md)** - Development and customization

### Technical Documentation
- **[Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)** - System architecture
- **[API Documentation](http://localhost:8000/docs)** - Interactive API reference
- **[Debug Reports](DEBUG_REPORT_V2.1.md)** - System status and completion

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
src/
├── components/          # UI components
│   ├── ui/             # Basic elements (Button, Card, Icon)
│   ├── sections/       # Page sections
│   └── [Features]      # Learning feature components
├── pages/              # Main application pages
├── services/           # Business logic and AI integration
└── types/              # TypeScript definitions
```

### Backend (Python + FastAPI)
```
backend/app/
├── core/               # Core system classes
│   ├── polymath_os.py  # Main PolyMathOS system
│   └── enhanced_system.py  # Enhanced with quantum & agents
├── modules/            # Feature modules
│   ├── quantum_optimization.py
│   ├── quantum_patterns.py
│   ├── multi_agent.py
│   ├── llm_router.py
│   ├── lemon_ai_integration.py
│   ├── storage_persistence.py
│   └── [Other modules]
└── main.py             # FastAPI application
```

### Technology Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS (Sky Blue/Silver/Gold theme)
- Vite for build tooling
- React Router for navigation

**Backend:**
- FastAPI (Python)
- PyTorch for ML models
- Quantum libraries (Qiskit, PennyLane, D-Wave)
- PostgreSQL for database
- Supabase for cloud storage

**AI & Automation:**
- n8n for workflow automation
- Multiple LLM providers (OpenAI, Anthropic, Google, etc.)
- Lemon AI for self-evolving agents
- Sentence Transformers for embeddings

## 🎯 Core Capabilities

### 1. Intelligent Learning Path Generation
- AI-powered curriculum creation
- Quantum-optimized learning sequences
- Personalized based on cognitive profile
- Multi-domain integration

### 2. Self-Evolving Agent System
- 8 specialized AI agents
- Automatic performance tracking
- Evolution based on feedback
- Continuous improvement

### 3. Quantum-Enhanced Optimization
- Learning path optimization
- Pattern recognition
- Feature selection
- Neural network training

### 4. Multi-Agent Collaboration
- Collective problem-solving
- Specialized agent coordination
- Emergent intelligence detection
- Ethical evaluation

### 5. Comprehensive Storage
- Local filesystem with versioning
- Cloud storage (Supabase)
- Database persistence (PostgreSQL)
- Artifact management

## 📊 API Endpoints

### Core Endpoints
- `GET /` - System status
- `POST /enroll` - User enrollment
- `GET /activity/{user_id}` - Get next activity
- `POST /genius/activate` - Activate genius mode
- `GET /progress/{user_id}` - Progress report

### Quantum Computing
- `POST /quantum/optimize-path` - Quantum path optimization
- `POST /quantum/pattern-recognition` - Quantum pattern recognition

### Multi-Agent Collaboration
- `POST /collaboration/solve` - Collaborative problem solving

### LLM Router
- `POST /llm/select` - Intelligent LLM selection
- `GET /llm/performance` - Performance metrics

### Agent Evolution
- `POST /agents/evolve` - Evolve an agent
- `GET /agents/{agent_id}/evolution` - Evolution history

### Storage
- `POST /storage/artifact` - Store artifact
- `GET /storage/artifact/{artifact_id}` - Retrieve artifact
- `GET /storage/task/{task_id}/artifacts` - List artifacts

**Full API Documentation**: Visit `http://localhost:8000/docs` when the backend is running

## 🧪 Scientific Foundation

PolyMathOS is built on rigorous scientific research:

- **Project 144 Research**: Comprehensive cognitive engineering
- **DARPA Education Dominance**: Problem-first learning protocols
- **Neuroscience**: RPE, dopamine optimization, neuroplasticity
- **Quantum Computing**: Optimization and pattern recognition
- **Multi-Agent Systems**: Collective intelligence and emergence
- **Meta-Learning**: Learning how to learn

## 🔒 Privacy & Security

- **Local-First**: Core functionality works offline
- **Encrypted Storage**: All sensitive data encrypted
- **API Key Management**: Secure storage via Settings
- **GDPR Compliant**: Privacy by design

## 🌍 System Requirements

### Minimum
- **CPU**: Modern multi-core processor
- **RAM**: 4GB (8GB recommended)
- **Storage**: 2GB free space
- **OS**: macOS, Linux, or Windows with WSL

### Recommended
- **CPU**: 8+ cores
- **RAM**: 16GB+
- **GPU**: NVIDIA RTX 3080+ (for quantum simulations)
- **Storage**: SSD with 10GB+ free space

## 📈 Roadmap

### ✅ v2.1 (Current)
- Intelligent LLM Router
- Self-Evolving Agents (Lemon AI)
- Quantum Computing Integration
- Multi-Agent Collaboration
- Storage & Persistence

### 🔄 v2.2 (Planned)
- Advanced quantum hardware integration
- Real-time neurofeedback
- Enhanced agent capabilities
- Mobile app

### 🔮 v3.0 (Future)
- Brain-computer interface
- AR/VR learning experiences
- Global collaboration network
- Autonomous research capabilities

## 🤝 Contributing

We welcome contributions! Please see:
- [Developer How-To Guide](docs/DEVELOPER_HOW_TO_GUIDE.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 📞 Support

- **Documentation**: Comprehensive guides in `/docs`
- **Issues**: [GitHub Issues](https://github.com/J182Razor/PolyMathOS/issues)
- **API Docs**: `http://localhost:8000/docs`

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built on the shoulders of giants:
- **Project 144 Research**
- **Lemon AI Framework** ([GitHub](https://github.com/hexdocom/lemonai))
- **Quantum Computing Libraries** (Qiskit, PennyLane, D-Wave)
- **Open Source Community**

---

**Ready to achieve genius-level learning?** [Get started with PolyMathOS today!](https://github.com/J182Razor/PolyMathOS)

*PolyMathOS - Where Science Meets Learning, Quantum Meets Intelligence*
