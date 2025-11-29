import React, { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import InterestDiscovery from './InterestDiscovery';
import ResourceScanner from './ResourceScanner';
import CurriculumBuilder from './CurriculumBuilder';
import OnboardingComplete from './OnboardingComplete';

interface OnboardingControllerProps {
  onComplete: (program: any) => void;
}

const OnboardingController: React.FC<OnboardingControllerProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({});
  const [program, setProgram] = useState(null);

  const handleNext = (data: any) => {
    setUserData(prev => ({ ...prev, ...data }));
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = (createdProgram: any) => {
    setProgram(createdProgram);
    setStep(5);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <WelcomeScreen onNext={handleNext} />;
      case 2:
        return <InterestDiscovery userData={userData} onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <ResourceScanner userData={userData} onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <CurriculumBuilder userData={userData} onComplete={handleComplete} onBack={handleBack} />;
      case 5:
        return <OnboardingComplete program={program} onStartLearning={onComplete} onBack={handleBack} />;
      default:
        return <WelcomeScreen onNext={handleNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-background-dark">
      {renderStep()}
    </div>
  );
};

export default OnboardingController;
