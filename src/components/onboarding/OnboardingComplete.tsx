import React from 'react';

interface OnboardingCompleteProps {
  program: any;
  onStartLearning: (program: any) => void;
  onBack?: () => void;
}

const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({ program, onStartLearning, onBack }) => {
  const concepts = [
    { name: 'Quantum Entanglement', type: 'Core Concept', icon: 'hub' },
    { name: 'Neural Networks', type: 'Core Concept', icon: 'grain' },
  ];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-brand-charcoal dark group/design-root overflow-x-hidden font-display">
      <div className="flex flex-col grow justify-between p-6">
        <div className="flex flex-col items-center">
          {/* Animated Completion Icon Placeholder */}
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent/10 mb-6 mt-8">
            <span className="material-symbols-outlined text-5xl text-accent">
              verified
            </span>
          </div>

          {/* HeadlineText */}
          <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight px-4 text-center pb-2 pt-0">
            Your Path is Synthesized
          </h1>

          {/* BodyText */}
          <p className="text-[#A0A0A0] text-base font-normal leading-normal pb-8 pt-1 px-4 text-center">
            Your personalized AI-driven curriculum is ready.
          </p>
        </div>

        <div className="flex flex-col w-full gap-4">
          {/* Program Overview Card */}
          <div className="flex flex-col w-full gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
            {/* TitleText */}
            <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-0 text-left pb-0 pt-0">
              {program?.name || 'Quantum Cognition Path'}
            </h1>

            {/* TextGrid */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
              {concepts.map((concept, index) => (
                <div key={index} className="flex flex-1 gap-3 rounded-lg border border-white/10 bg-black/20 p-4 flex-col">
                  <span className="material-symbols-outlined text-accent text-2xl">
                    {concept.icon}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-white text-base font-bold leading-tight">{concept.name}</h2>
                    <p className="text-[#A0A0A0] text-sm font-normal leading-normal">{concept.type}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Milestone */}
            <div className="mt-2 flex items-center gap-3 rounded-lg bg-black/20 px-4 py-3">
              <span className="material-symbols-outlined text-accent text-2xl">
                flag
              </span>
              <p className="text-white text-base font-medium leading-normal">First Milestone: 7 Days</p>
            </div>
          </div>
        </div>

        {/* CTA and Secondary Action */}
        <div className="flex w-full flex-col items-center gap-4 pt-8 pb-4">
          {/* Primary Call-to-Action (CTA) Button */}
          <button
            onClick={() => onStartLearning(program)}
            className="flex w-full items-center justify-center rounded-lg bg-accent px-6 py-4 text-center text-lg font-bold text-black shadow-[0_4px_14px_0_rgba(0,191,255,0.3)] hover:bg-opacity-90 transition-opacity"
          >
            Begin Your Journey
          </button>

          {/* Secondary Action Link */}
          <a
            onClick={(e) => {
              e.preventDefault();
              // Navigate to dashboard
            }}
            className="text-[#A0A0A0] text-sm font-medium hover:text-white transition-colors cursor-pointer"
            href="#"
          >
            Or, Explore the Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default OnboardingComplete;
