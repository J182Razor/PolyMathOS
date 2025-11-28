import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
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
import { PolymathAIAssistantEnhanced } from './components/PolymathAIAssistantEnhanced';
import { InstallationWizard } from './components/InstallationWizard';
import OnboardingController from './components/onboarding/OnboardingController';
import ResourceLibrary from './components/ResourceLibrary';
import { MobileNavigation } from './components/MobileNavigation';
import { PolymathUserService } from './services/PolymathUserService';

type AppState = 'home' | 'signin' | 'signup' | 'dashboard' | 'polymath_dashboard' | 'learning' | 'assessment' | 'domain_selection' | 'memory_palace' | 'flashcards' | 'deep_work' | 'projects' | 'reflection' | 'mind_map' | 'triz' | 'brainwave_generator' | 'polymath_ai' | 'onboarding' | 'portfolio' | 'resource_library';

interface User {
  email: string;
  firstName: string;
  lastName: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<AppState>('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [showInstallationWizard, setShowInstallationWizard] = useState(false);

  // Initialize dark mode
  useEffect(() => {
    // Always start in dark mode for this design
    document.documentElement.classList.add('dark');

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
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Navigation handlers
  const handleSignIn = (email: string, password: string) => {
    setUser({
      email,
      firstName: 'Alex',
      lastName: 'Johnson'
    });
    setCurrentPage('dashboard');
  };

  const handleSignUp = (userData: any) => {
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

  // Handle navigation from mobile nav
  const handleMobileNavigate = (page: string) => {
    setCurrentPage(page as AppState);
  };

  // Hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      const validPages: AppState[] = ['polymath_dashboard', 'memory_palace', 'flashcards', 'deep_work', 'projects', 'reflection', 'domain_selection', 'mind_map', 'triz', 'portfolio', 'brainwave_generator', 'polymath_ai', 'resource_library'];
      if (hash && validPages.includes(hash as AppState)) {
        setCurrentPage(hash as AppState);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleCompleteAssessment = async (assessmentData: any) => {
    setAssessmentData(assessmentData);
    const userService = PolymathUserService.getInstance();
    let currentUser = await userService.getCurrentUser();
    if (!currentUser) {
      currentUser = await userService.createUser('Demo User', 'demo@example.com');
    }
    await userService.updateAssessmentData(currentUser, assessmentData);
    setCurrentPage('dashboard');
  };

  // Determine if mobile nav should show
  const showMobileNav = user && !['home', 'signin', 'signup', 'onboarding'].includes(currentPage);

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'signin':
        return <SignIn onSignIn={handleSignIn} onBack={() => setCurrentPage('home')} />;

      case 'signup':
        return <SignUp onSignUp={handleSignUp} onBack={() => setCurrentPage('home')} />;

      case 'dashboard':
        return (
          <Dashboard
            onStartLearning={() => setCurrentPage('learning')}
            onStartAssessment={() => setCurrentPage('assessment')}
            onSignOut={handleSignOut}
            onOpenBrainwaveGenerator={() => setCurrentPage('brainwave_generator')}
            user={user}
          />
        );

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
            onComplete={() => setCurrentPage('dashboard')}
            onHome={() => setCurrentPage('dashboard')}
            userProfile={assessmentData}
          />
        ) : (
          <LearningSession onComplete={() => setCurrentPage('dashboard')} onHome={() => setCurrentPage('dashboard')} />
        );

      case 'assessment':
        return <CognitiveAssessment onComplete={handleCompleteAssessment} onBack={() => setCurrentPage('dashboard')} />;

      case 'brainwave_generator':
        return <BrainwaveGenerator onBack={() => setCurrentPage('dashboard')} />;

      case 'onboarding':
        return (
          <OnboardingController
            onComplete={() => setCurrentPage('dashboard')}
          />
        );

      case 'resource_library':
        return (
          <div className="min-h-screen bg-slate-950">
            <div className="p-4 max-w-7xl mx-auto">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="mb-4 flex items-center text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>
            <ResourceLibrary />
            <div className="h-20 md:hidden" />
          </div>
        );

      case 'polymath_ai':
        return (
          <div className="min-h-screen bg-slate-950">
            <div className="container mx-auto p-4">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="mb-4 text-slate-400 hover:text-white flex items-center transition-colors"
              >
                <span className="mr-2">←</span> Back to Dashboard
              </button>
              <div className="h-[calc(100vh-8rem)]">
                <PolymathAIAssistantEnhanced
                  onNavigate={(target) => {
                    window.location.hash = `#${target}`;
                    window.dispatchEvent(new HashChangeEvent('hashchange'));
                  }}
                />
              </div>
            </div>
            <div className="h-20 md:hidden" />
          </div>
        );

      case 'portfolio':
        return <PolymathDashboard onSignOut={handleSignOut} user={user} />;

      default:
        return (
          <div className="min-h-screen bg-slate-950 text-white">
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
      <AnimatePresence mode="wait">
        {renderCurrentPage()}
      </AnimatePresence>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {showMobileNav && (
          <MobileNavigation
            currentPage={currentPage}
            onNavigate={handleMobileNavigate}
          />
        )}
      </AnimatePresence>

      {/* Installation Wizard */}
      {showInstallationWizard && (
        <InstallationWizard
          onComplete={async (userData) => {
            localStorage.setItem('polymathos_installation_completed', 'true');
            setShowInstallationWizard(false);

            if (userData) {
              const userService = PolymathUserService.getInstance();
              let newUser = await userService.getCurrentUser();
              if (!newUser) {
                newUser = await userService.createUser(
                  `${userData.firstName} ${userData.lastName}`,
                  userData.email
                );
              }

              if (userData.learningStyle) {
                await userService.updateAssessmentData(newUser, {
                  learningStylePreferences: {
                    primaryStyle: userData.learningStyle,
                    secondaryStyle: 'None',
                    environment: 'Quiet',
                    timeOfDay: 'Morning',
                    groupPreference: 'Solo'
                  }
                });
              }

              setUser({
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName
              });

              if (userData.email === 'demo@example.com') {
                localStorage.setItem('polymathos_demo_mode', 'true');
              } else {
                localStorage.removeItem('polymathos_demo_mode');
              }
            }
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
