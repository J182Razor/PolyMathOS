import React from 'react';

interface WelcomeScreenProps {
  onNext: (data: { userName: string }) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-between p-6 text-white bg-background-light dark:bg-background-dark font-display">
      {/* Step Indicator */}
      <div className="flex w-full flex-row items-center justify-center gap-3 py-5">
        <div className="h-2 w-2 rounded-full bg-primary"></div>
        <div className="h-2 w-2 rounded-full bg-gray-700"></div>
        <div className="h-2 w-2 rounded-full bg-gray-700"></div>
        <div className="h-2 w-2 rounded-full bg-gray-700"></div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col justify-center w-full max-w-md">
        {/* Headline Text */}
        <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight px-4 text-center pb-3 pt-6">
          Welcome to PolyMathOS Setup
        </h1>

        {/* Body Text */}
        <p className="text-gray-400 text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
          To unlock the full power of personalized AI learning, we need to connect to your AI provider.
        </p>
      </div>

      {/* Action Area */}
      <div className="w-full max-w-md py-4">
        {/* Single Button */}
        <div className="flex px-4 py-3">
          <button
            onClick={() => onNext({ userName: '' })}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
