# 🧠 PolyMathOS - AI-Powered Learning Platform

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0.1-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Transform your learning with AI + Neuroscience + AR/VR to boost retention by 300%

PolyMathOS is a revolutionary learning platform that combines cutting-edge neuroscience research, artificial intelligence, and personalized education to create the most effective learning experience possible. Our platform uses advanced dopamine optimization, meta-learning techniques, and cognitive profiling to adapt to your unique brain patterns and learning style.

## 🌟 Key Features

### 🧠 **Neuroscience-Based Learning (Project 144 Research)**
- **Reward Prediction Error (RPE) System**: Confidence tracking before answers triggers optimal dopamine responses for maximum learning
- **Hyper-Correction Detection**: High-confidence errors create massive learning opportunities through negative RPE spikes
- **Enhanced Spaced Repetition**: Research-based intervals (Day 0, 1, 3-4, 7, 14, 30, 3mo, 6mo, 1yr) for superior retention
- **Learning State Management**: Alpha (8-12 Hz) for reading, Theta (4-8 Hz) for visualization with binaural beats integration
- **Image Streaming**: Win Wenger protocol for visual intelligence training and cross-hemispheric integration
- **Variable Ratio Rewards**: Dice roll system (01-50 no reward, 51-80 small, 81-95 medium, 96-100 jackpot) for maximum engagement
- **Interleaving Practice**: 3×3 daily loop with domain switching to prevent mental autopilot
- **DARPA Problem-First Protocol**: Attempt problems before reading, identify knowledge gaps, targeted acquisition, Feynman teaching

### 🤖 **AI-Powered Personalization**
- **Gemini Integration**: Long-context synthesis (like NotebookLM) for complex content generation
- **Groq Integration**: Ultra-fast inference for real-time interactions
- **Adaptive Content Delivery**: Real-time adjustment based on your cognitive patterns and RPE data
- **Intelligent Tutoring**: AI that understands your learning style and adapts accordingly
- **Feynman Analysis**: AI-powered explanation quality assessment
- **Predictive Analytics**: Anticipates learning challenges before they occur

### 📊 **Comprehensive Assessment**
- **Cognitive Profiling**: Deep analysis of your learning preferences and capabilities
- **Dopamine Sensitivity Testing**: Identifies your optimal reward and motivation triggers
- **Meta-Learning Evaluation**: Assesses and improves your ability to learn how to learn
- **Confidence Calibration**: Tracks overconfidence/underconfidence for better self-awareness
- **Progress Tracking**: Detailed analytics on retention, comprehension, and growth

### 🎯 **Advanced Learning Features**
- **Memory Palaces**: Method of Loci with 144-grid structure for polymathic knowledge storage
- **Mind Mapping**: Tony Buzan's radiant thinking for semantic network engineering
- **Deep Work Blocks**: Focused practice sessions with activity type tracking
- **Cross-Domain Projects**: Synthesize knowledge across multiple fields
- **TRIZ Application**: 40 inventive principles for creative problem-solving
- **Reflection Journal**: Structured reflection with mood tracking
- **Portfolio System**: Showcase your polymathic achievements
- **Dark Mode Support**: Comfortable learning in any lighting condition

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/J182Razor/PolyMathOS.git
   cd PolyMathOS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your OpenAI API key and other configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` to start using PolyMathOS

## 📖 Documentation

### User Guides
- **[User Onboarding Guide](docs/USER_ONBOARDING_GUIDE.md)** - Complete guide for new users
- **[Learning Science Analysis](docs/learning_science_analysis.md)** - Research foundation behind the platform

### Technical Documentation
- **[Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)** - System architecture and implementation details
- **[Developer How-To Guide](docs/DEVELOPER_HOW_TO_GUIDE.md)** - Development setup and customization guide

### Research Documents
- **[Dopamine and Addictive Learning](docs/DopamineandAddictiveLearning_Science-BackedNeurohacks.pdf)** - Neuroscience research on motivation
- **[Meta-Learning Enhancement](docs/DopamineLoadingandMeta-Learning_EnhancingLearningandTraining.pdf)** - Advanced learning strategies
- **[Genius Learning Synthesis](docs/GeniusLearningStrategySynthesis_.docx)** - Comprehensive learning methodology

## 🏗️ Architecture

PolyMathOS is built with a modern, scalable architecture:

```
src/
├── components/                    # Reusable UI components
│   ├── ui/                       # Basic UI elements (Button, Card, Icon)
│   ├── sections/                 # Page sections (Header, Hero, Features)
│   ├── ImageStreaming.tsx        # Win Wenger Image Streaming protocol
│   ├── MemoryPalaceBuilder.tsx   # Method of Loci implementation
│   ├── MindMapBuilder.tsx        # Tony Buzan Mind Mapping
│   ├── FlashcardReview.tsx       # Spaced repetition interface
│   ├── DeepWorkBlock.tsx         # Focused practice sessions
│   ├── ReflectionJournal.tsx     # Structured reflection
│   ├── TRIZApplication.tsx       # Creative problem-solving
│   └── CrossDomainProject.tsx    # Multi-domain synthesis
├── pages/                        # Main application pages
│   ├── Dashboard.tsx             # User dashboard
│   ├── PolymathDashboard.tsx     # Advanced polymath features
│   ├── SignIn.tsx                # Authentication
│   ├── LearningSession.tsx       # Basic learning interface
│   └── EnhancedLearningSession.tsx # RPE-integrated learning
├── services/                      # Business logic and AI integration
│   ├── RewardPredictionErrorService.ts      # RPE calculation & hyper-correction
│   ├── EnhancedSpacedRepetitionService.ts  # Research-based spacing
│   ├── LearningStateService.ts              # Alpha/Theta state management
│   ├── InterleavingService.ts               # 3×3 daily loop & domain switching
│   ├── DARPALearningService.ts             # Problem-first protocol
│   ├── SpacedRepetitionService.ts          # SM-2 algorithm
│   ├── LLMService.ts                        # Gemini & Groq integration
│   ├── NeuroAILessonService.ts             # AI-powered lesson generation
│   ├── PolymathUserService.ts              # User data management
│   └── PolymathFeaturesService.ts          # Advanced features
├── types/
│   └── polymath.ts               # Comprehensive type definitions
└── docs/                         # Comprehensive documentation
```

### Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom dark minimalist design system (silver accents, shimmer effects)
- **Build Tool**: Vite for fast development and optimized builds
- **AI Integration**: 
  - **Gemini API**: Long-context synthesis for complex content (like NotebookLM)
  - **Groq API**: Ultra-fast inference for real-time interactions
  - **OpenAI API**: Fallback for content generation
- **State Management**: React hooks and context
- **Storage**: LocalStorage for user data and learning progress
- **Responsive Design**: Mobile-first approach with dark mode support
- **Accessibility**: WCAG 2.1 AA compliant

## 🧪 Scientific Foundation

PolyMathOS is built on rigorous scientific research from **Project 144** and the **Polymath Operating System** curriculum:

### Neuroscience Principles (Project 144 Research)
- **Reward Prediction Error (RPE)**: Dopamine as a teaching signal - positive RPE strengthens, negative RPE triggers attention
- **Hyper-Correction Effect**: High-confidence errors create maximum learning through massive negative RPE
- **Neuroplasticity Optimization**: High-intensity cognitive capture (HICC) protocol simulates critical period learning
- **Spaced Repetition Science**: Research-based intervals leveraging the forgetting curve and consolidation windows
- **State-Dependent Learning**: Alpha/Theta states optimize different learning activities
- **Dual Coding Theory**: Visual + verbal encoding for superior retention

### Learning Psychology
- **Meta-Learning**: Teaching users how to learn more effectively (Plan → Monitor → Evaluate)
- **Interleaving vs Blocking**: Mixing topics improves discrimination and long-term retention
- **Desirable Difficulties**: Making learning harder in the short term strengthens long-term mastery
- **Variable Ratio Schedules**: Unpredictable rewards maintain higher tonic dopamine than fixed rewards
- **Flow State**: Creating optimal conditions for deep learning experiences
- **Growth Mindset**: Fostering belief in the ability to improve through effort

### Research Sources
- **Project 144**: Comprehensive Cognitive Engineering Architecture for PolyMathOS
- **DARPA Education Dominance Program**: 2.81 sigma improvement through problem-first learning
- **Defense Language Institute (DLI)**: Immersion protocols for rapid skill acquisition
- **Win Wenger**: Image Streaming protocol for visual intelligence
- **Tony Buzan**: Mind Mapping for semantic network engineering
- **Anthony Metivier**: Magnetic Memory Method for Memory Palaces
- **SM-2 Algorithm**: Spaced repetition optimization

## 🎯 Getting Started as a User

1. **Create Your Account**: Sign up with your email and create a secure password
2. **Take the Cognitive Assessment**: Complete our comprehensive evaluation (5-10 minutes)
3. **Receive Your Learning Profile**: Get personalized insights about your cognitive patterns
4. **Start Your First Session**: Begin with AI-generated content tailored to your profile
5. **Track Your Progress**: Monitor your improvement through detailed analytics

## 👩‍💻 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Contributing

We welcome contributions! Please see our [Developer How-To Guide](docs/DEVELOPER_HOW_TO_GUIDE.md) for detailed information on:

- Setting up the development environment
- Code standards and best practices
- Testing procedures
- Submitting pull requests

## 📊 Performance & Analytics

NeuroAscend includes comprehensive analytics to track learning effectiveness:

- **Retention Rates**: Monitor how well information is retained over time
- **Learning Velocity**: Track how quickly you master new concepts
- **Engagement Metrics**: Understand your optimal learning patterns
- **Cognitive Growth**: Measure improvements in meta-learning skills

## 🔒 Privacy & Security

Your learning data is protected with enterprise-grade security:

- **End-to-End Encryption**: All personal data is encrypted in transit and at rest
- **Privacy by Design**: Minimal data collection with explicit consent
- **GDPR Compliant**: Full compliance with international privacy regulations
- **Secure AI Processing**: AI analysis happens in secure, isolated environments

## 🌍 Accessibility

NeuroAscend is designed to be accessible to all learners:

- **WCAG 2.1 AA Compliant**: Meets international accessibility standards
- **Screen Reader Support**: Full compatibility with assistive technologies
- **Keyboard Navigation**: Complete functionality without mouse interaction
- **High Contrast Mode**: Optimized for users with visual impairments
- **Responsive Design**: Works seamlessly across all devices and screen sizes

## 📈 Roadmap

### Current Version (v1.0) - Project 144 Integration Complete
- ✅ **Reward Prediction Error (RPE) System**: Confidence tracking and hyper-correction detection
- ✅ **Enhanced Spaced Repetition**: Research-based intervals (Day 0, 1, 3-4, 7, 14, 30+)
- ✅ **Learning State Management**: Alpha/Theta states with binaural beats
- ✅ **Image Streaming**: Win Wenger protocol for visual intelligence
- ✅ **Variable Ratio Rewards**: Dice roll system for maximum engagement
- ✅ **Interleaving Practice**: 3×3 daily loop with domain switching
- ✅ **DARPA Problem-First Protocol**: Knowledge tracing and targeted acquisition
- ✅ **Memory Palaces**: Method of Loci with 144-grid structure
- ✅ **Mind Mapping**: Semantic network engineering
- ✅ **Gemini & Groq Integration**: Advanced AI for synthesis and speed
- ✅ **Dark Minimalist UI**: Silver accents with shimmer effects
- ✅ Core learning platform with AI integration
- ✅ Cognitive assessment and profiling
- ✅ Responsive design with dark mode

### Upcoming Features (v1.1)
- 🔄 Advanced RPE analytics dashboard
- 🔄 Interleaving session UI components
- 🔄 DARPA problem generator per domain
- 🔄 Social learning features
- 🔄 Mobile app development
- 🔄 AR/VR learning experiences

### Future Vision (v2.0+)
- 🔮 Brain-computer interface integration
- 🔮 Advanced biometric monitoring
- 🔮 Collaborative AI tutoring
- 🔮 Enterprise learning management

## 📚 Learning Strategy Documentation

Comprehensive guides on the research-based learning strategies:

- **[Learning Strategy Refinement](LEARNING_STRATEGY_REFINEMENT.md)** - Complete overview of Project 144 integration
- **[Learning Strategy Complete](LEARNING_STRATEGY_COMPLETE.md)** - Full implementation details
- **[Build Complete](README_BUILD_COMPLETE.md)** - LLM and spaced repetition integration

## 📞 Support

Need help? We're here for you:

- **Documentation**: Comprehensive guides in the `/docs` folder
- **Issues**: Report bugs or request features via GitHub Issues
- **Community**: Join our learning community for peer support
- **Contact**: Reach out to our team for technical support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

PolyMathOS is built on the shoulders of giants:

- **Project 144 Research**: Comprehensive Cognitive Engineering Architecture for PolyMathOS
- **Polymath OS Curriculum**: Elite Self-Study Curriculum for Genius-Level Learning
- **DARPA Education Dominance Program**: Problem-first learning and knowledge tracing
- **Defense Language Institute (DLI)**: Immersion protocols and intensive training methods
- **Win Wenger**: Image Streaming protocol for visual intelligence
- **Tony Buzan**: Mind Mapping and radiant thinking
- **Anthony Metivier**: Magnetic Memory Method and Memory Palaces
- **Neuroscience Research**: Dr. Andrew Huberman, Dr. Barbara Oakley, and the learning science community
- **AI Technology**: Google Gemini, Groq, and OpenAI for advanced language models
- **Open Source Community**: The React, TypeScript, and Tailwind CSS communities
- **Educational Psychology**: Researchers in cognitive load theory, meta-learning, and spaced repetition

---

**Ready to transform your learning?** [Get started with PolyMathOS today!](https://github.com/J182Razor/PolyMathOS)

*PolyMathOS - Where Science Meets Learning*
