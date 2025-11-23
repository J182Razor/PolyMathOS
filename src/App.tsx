import React, { useState, useEffect } from 'react';
import { Header } from './components/sections/Header';
import { Hero } from './components/sections/Hero';
import { Features } from './components/sections/Features';
import { HowItWorks } from './components/sections/HowItWorks';
import { Testimonials } from './components/sections/Testimonials';
import { Pricing } from './components/sections/Pricing';
import { CTA } from './components/sections/CTA';
import { Footer } from './components/sections/Footer';
import { Dashboard } from './pages/Dashboard';
import { PolymathDashboard } from './pages/PolymathDashboard';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { LearningSession } from './pages/LearningSession';
import { EnhancedLearningSession } from './pages/EnhancedLearningSession';
import { CognitiveAssessment } from './components/CognitiveAssessment';
import { DomainSelection } from './components/DomainSelection';
import { MemoryPalaceBuilder } from './components/MemoryPalaceBuilder';
import { FlashcardReview } from './components/FlashcardReview';
import { DeepWorkBlock } from './components/DeepWorkBlock';
import { ReflectionJournal } from './components/ReflectionJournal';
import { TRIZApplication } from './components/TRIZApplication';
import { CrossDomainProject } from './components/CrossDomainProject';
import { MindMapBuilder } from './components/MindMapBuilder';
import { BrainwaveGenerator } from './components/BrainwaveGenerator';
import { PolymathAIAssistant } from './components/PolymathAIAssistant';
import { PolymathAIAssistantEnhanced } from './components/PolymathAIAssistantEnhanced';
import { InstallationWizard } from './components/InstallationWizard';
import OnboardingController from './components/onboarding/OnboardingController';
import ResourceLibrary from './components/ResourceLibrary';

type AppState = 'home' | 'signin' | 'signup' | 'dashboard' | 'polymath_dashboard' | 'learning' | 'assessment' | 'domain_selection' | 'memory_palace' | 'flashcards' | 'deep_work' | 'projects' | 'reflection' | 'mind_map' | 'triz' | 'brainwave_generator' | 'polymath_ai' | 'onboarding' | 'portfolio' | 'resource_library';

interface User {
  email: string;
  firstName: string;
  lastName: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<AppState>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [showInstallationWizard, setShowInstallationWizard] = useState(false);

  // Initialize dark mode - default to dark for premium experience
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Default to dark mode for premium dark minimalist design
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Check if installation is needed
    const installationCompleted = localStorage.getItem('polymathos_installation_completed');
    const n8nUrl = localStorage.getItem('n8n_webhook_url');
    if (!installationCompleted && !n8nUrl) {
      setShowInstallationWizard(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Navigation handlers
  const handleSignIn = (email: string, password: string) => {
    // Simulate authentication
    setUser({
      email,
      firstName: 'Alex',
      lastName: 'Johnson'
    });
    setCurrentPage('dashboard');
  };

  const handleSignUp = (userData: any) => {
    // Simulate registration
    setUser({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName
    });
    setCurrentPage('onboarding');
  };

  const handleSignOut = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const handleStartJourney = () => {
    if (user) {
      setCurrentPage('learning');
    } else {
      setCurrentPage('signup');
    }
  };

  const handleGetStarted = () => {
    if (user) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('signup');
    }
  };

  const handleSignInClick = () => {
    setCurrentPage('signin');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  const handleStartLearning = () => {
    setCurrentPage('learning');
  };

  const handleStartAssessment = () => {
    setCurrentPage('assessment');
  };

  const handleGoToPolymathDashboard = () => {
    setCurrentPage('polymath_dashboard');
  };

  // Handle hash-based navigation for Polymath features
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      const validPages: AppState[] = ['polymath_dashboard', 'memory_palace', 'flashcards', 'deep_work', 'projects', 'reflection', 'domain_selection', 'mind_map', 'triz', 'portfolio', 'brainwave_generator', 'polymath_ai', 'resource_library'];
      if (hash && validPages.includes(hash as AppState)) {
        setCurrentPage(hash as AppState);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check on mount

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleCompleteAssessment = (assessmentData: any) => {
    // Store assessment data for AI personalization
    setAssessmentData(assessmentData);
    // In a real app, this would be sent to the backend
    if (import.meta.env.DEV) {
      console.log('Assessment completed:', assessmentData);
    }
    setCurrentPage('dashboard');
  };

  const handleCompleteLearning = () => {
    setCurrentPage('dashboard');
  };

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'signin':
        return <SignIn onSignIn={handleSignIn} onBack={handleBackToHome} />;
      
      case 'signup':
        return <SignUp onSignUp={handleSignUp} onBack={handleBackToHome} />;
      
      case 'dashboard':
        return <Dashboard onStartLearning={handleStartLearning} onStartAssessment={handleStartAssessment} onSignOut={handleSignOut} onOpenBrainwaveGenerator={() => setCurrentPage('brainwave_generator')} user={user} />;
      
      case 'polymath_dashboard':
        return <PolymathDashboard onSignOut={handleSignOut} user={user} />;
      
      case 'domain_selection':
        return <DomainSelection onComplete={() => setCurrentPage('polymath_dashboard')} onBack={() => setCurrentPage('polymath_dashboard')} />;
      
      case 'memory_palace':
        return <MemoryPalaceBuilder onComplete={() => setCurrentPage('polymath_dashboard')} onBack={() => setCurrentPage('polymath_dashboard')} />;
      
      case 'flashcards':
        return <FlashcardReview onComplete={() => setCurrentPage('polymath_dashboard')} onBack={() => setCurrentPage('polymath_dashboard')} />;
      
      case 'deep_work':
        return <DeepWorkBlock onComplete={() => setCurrentPage('polymath_dashboard')} onBack={() => setCurrentPage('polymath_dashboard')} />;
      
      case 'reflection':
        return <ReflectionJournal onComplete={() => setCurrentPage('polymath_dashboard')} onBack={() => setCurrentPage('polymath_dashboard')} />;
      
      case 'triz':
        return <TRIZApplication onComplete={() => setCurrentPage('polymath_dashboard')} onBack={() => setCurrentPage('polymath_dashboard')} />;
      
      case 'projects':
        return <CrossDomainProject onComplete={() => setCurrentPage('polymath_dashboard')} onBack={() => setCurrentPage('polymath_dashboard')} />;
      
      case 'mind_map':
        return <MindMapBuilder onComplete={() => setCurrentPage('polymath_dashboard')} onBack={() => setCurrentPage('polymath_dashboard')} />;
      
      case 'learning':
        return assessmentData ? (
          <EnhancedLearningSession 
            onComplete={handleCompleteLearning} 
            onHome={() => setCurrentPage('dashboard')} 
            userProfile={assessmentData}
          />
        ) : (
          <LearningSession onComplete={handleCompleteLearning} onHome={() => setCurrentPage('dashboard')} />
        );
      
      case 'assessment':
        return <CognitiveAssessment onComplete={handleCompleteAssessment} onBack={() => setCurrentPage('dashboard')} />;
      
      case 'brainwave_generator':
        return <BrainwaveGenerator onBack={() => setCurrentPage('dashboard')} />;
      
      case 'onboarding':
        return <OnboardingController onComplete={(program) => {
          // Here we would typically save the program to the backend/user state
          // For now, we'll just navigate to the dashboard
          setCurrentPage('dashboard');
        }} />;

      case 'resource_library':
        return (
          <div className="min-h-screen bg-poly-neutral-50">
            <div className="p-4 max-w-7xl mx-auto">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="mb-4 flex items-center text-poly-neutral-600 hover:text-poly-primary-600 transition-colors px-4 py-2 rounded-lg hover:bg-poly-neutral-100"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>
            <ResourceLibrary />
          </div>
        );

      case 'polymath_ai':
        return (
          <div className="min-h-screen bg-poly-neutral-900">
            <div className="container mx-auto p-4">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="mb-4 text-poly-neutral-400 hover:text-poly-neutral-100 flex items-center transition-colors"
              >
                <span className="mr-2">←</span> Back to Dashboard
              </button>
              <div className="h-[calc(100vh-8rem)]">
                <PolymathAIAssistantEnhanced
                  onNavigate={(target, config) => {
                    window.location.hash = `#${target}`;
                    window.dispatchEvent(new HashChangeEvent('hashchange'));
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 'portfolio':
        return <PolymathDashboard onSignOut={handleSignOut} user={user} />;
      
      default:
        return (
          <div className="min-h-screen bg-light-base dark:bg-dark-base transition-colors duration-300">
            <Header 
              onSignIn={() => setCurrentPage('signin')} 
              onGetStarted={() => setCurrentPage('signup')}
              toggleDarkMode={toggleDarkMode}
              darkMode={isDarkMode}
              user={user}
              onSignOut={handleSignOut}
            />
            <main>
              <Hero onStartJourney={handleStartJourney} />
              <Features />
              <HowItWorks />
              <Testimonials />
              <Pricing onGetStarted={handleGetStarted} />
              <CTA onStartTrial={handleStartJourney} />
            </main>
            <Footer />
          </div>
        );
    }
  };

  return (
    <>
      {renderCurrentPage()}
      {showInstallationWizard && (
        <InstallationWizard
          onComplete={() => {
            localStorage.setItem('polymathos_installation_completed', 'true');
            setShowInstallationWizard(false);
          }}
          onSkip={() => {
            localStorage.setItem('polymathos_installation_completed', 'true');
            setShowInstallationWizard(false);
          }}
        />
      )}
    </>
  );
}

export default App;

