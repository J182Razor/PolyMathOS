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

  const handleStepClick = (stepNumber: number) => {
    // Allow clicking on progress indicators to go back to previous steps
    if (stepNumber < step) {
      setStep(stepNumber);
    }
  };

  const handleComplete = (createdProgram: any) => {
    setProgram(createdProgram);
    setStep(5);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <WelcomeScreen onNext={handleNext} onBack={undefined} />;
      case 2:
        return <InterestDiscovery userData={userData} onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <ResourceScanner userData={userData} onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <CurriculumBuilder userData={userData} onComplete={handleComplete} onBack={handleBack} />;
      case 5:
        return <OnboardingComplete program={program} onStartLearning={onComplete} onBack={handleBack} />;
      default:
        return <WelcomeScreen onNext={handleNext} onBack={undefined} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-poly-neutral-50 to-poly-neutral-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center max-w-md mx-auto mb-4">
            {[1, 2, 3, 4].map((num) => (
              <div 
                key={num} 
                className="flex flex-col items-center cursor-pointer"
                onClick={() => handleStepClick(num)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  step >= num 
                    ? 'bg-poly-primary-500 text-white' 
                    : 'bg-poly-neutral-200 text-poly-neutral-500'
                } ${num < step ? 'hover:bg-poly-primary-400 hover:scale-110' : ''}`}>
                  {num}
                </div>
                {num < 4 && (
                  <div className={`w-8 sm:w-16 h-1 mt-2 ${
                    step > num ? 'bg-poly-primary-500' : 'bg-poly-neutral-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <span className="text-body-medium text-poly-neutral-600">
              {step === 1 && 'Welcome'}
              {step === 2 && 'Interests'}
              {step === 3 && 'Discovery'}
              {step === 4 && 'Program'}
              {step === 5 && 'Complete'}
            </span>
          </div>
        </div>

        {/* Step Content */}
        {renderStep()}
      </div>
    </div>
  );
};

export default OnboardingController;

