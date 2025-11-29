import React, { useState } from 'react';

interface LearningSessionProps {
  onComplete: () => void;
  onHome: () => void;
}

export const LearningSession: React.FC<LearningSessionProps> = ({ onComplete, onHome }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'optimal' | 'hard' | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const progress = 25; // 25% complete

  const question = {
    text: "What does the principle of superposition state?",
    options: [
      "A system exists in one definite state.",
      "A system can exist in multiple states at once.",
      "Measurement does not affect a system's state.",
    ],
    correctAnswer: 1,
  };

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    if (index === question.correctAnswer) {
      setIsCalibrating(true);
      setTimeout(() => setIsCalibrating(false), 2000);
    }
  };

  const handleDifficultySelect = (level: 'easy' | 'optimal' | 'hard') => {
    setDifficulty(level);
  };

  return (
    <div className="relative flex h-screen w-full flex-col font-display group/design-root overflow-hidden bg-background-dark">
      {/* Header Bar */}
      <header className="flex-shrink-0">
        <div className="flex items-center bg-background-dark p-4 pb-2 justify-between">
          <div className="flex size-12 shrink-0 items-center justify-start">
            <button onClick={onHome} className="material-symbols-outlined text-text-secondary text-3xl">close</button>
          </div>
          <h2 className="text-text-primary text-lg font-bold leading-tight tracking-[-0.015em] text-center flex-1">
            Quantum Entanglement Basics
          </h2>
          <div className="flex w-12 items-center justify-end">
            <p className="text-text-secondary text-sm font-normal leading-normal whitespace-nowrap">~8 min left</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4">
          <div className="w-full bg-surface rounded-full">
            <div className="h-1.5 rounded-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center p-4 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Text Block */}
          <div className="bg-surface p-5 rounded-xl border border-white/10">
            <h1 className="text-text-primary tracking-light text-[32px] font-bold leading-tight text-left pb-3">
              Understanding Superposition
            </h1>
            <p className="text-text-primary text-base font-normal leading-relaxed">
              In quantum mechanics, superposition is a fundamental principle where a quantum system can exist in multiple states at once until it is measured. Imagine a spinning coin; until it lands, it's both heads and tails simultaneously.
            </p>
          </div>

          {/* Interactive Quiz Module */}
          <div className="bg-surface p-5 rounded-xl border border-white/10">
            <h1 className="text-text-primary text-[22px] font-bold leading-tight tracking-[-0.015em] text-left pb-4">
              Knowledge Check
            </h1>
            <p className="text-text-primary text-base font-normal leading-relaxed pb-6">
              {question.text}
            </p>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors duration-200 ${
                    selectedAnswer === index
                      ? index === question.correctAnswer
                        ? 'border-accent bg-accent/10'
                        : 'border-red-500/50 bg-red-500/10'
                      : 'border-white/20 hover:border-accent'
                  }`}
                >
                  <input
                    className="form-radio bg-transparent border-white/30 text-accent focus:ring-accent focus:ring-offset-surface"
                    name="quiz-option"
                    type="radio"
                    checked={selectedAnswer === index}
                    onChange={() => handleAnswerSelect(index)}
                  />
                  <span className="ml-4 text-text-primary">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Difficulty Adjustment Toast */}
      {isCalibrating && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-sm border border-white/10 text-text-primary text-sm py-2 px-4 rounded-full flex items-center gap-2 shadow-lg shadow-black/30 z-50">
          <span className="material-symbols-outlined text-base animate-spin" style={{ animationDuration: '2s' }}>
            sync
          </span>
          <span>Calibrating Difficulty...</span>
        </div>
      )}

      {/* Footer and Feedback */}
      <footer className="flex-shrink-0 p-4 pt-0 bg-background-dark">
        <div className="max-w-md mx-auto space-y-5">
          {/* RPE Feedback System */}
          <div className="flex flex-col items-center">
            <p className="text-text-secondary text-sm mb-3">How challenging was this section?</p>
            <div className="flex justify-center items-center gap-4 w-full">
              <button
                onClick={() => handleDifficultySelect('easy')}
                className={`flex-1 text-center py-2.5 rounded-lg text-sm transition-colors ${
                  difficulty === 'easy'
                    ? 'bg-accent/20 border border-accent text-accent'
                    : 'bg-surface hover:bg-white/10'
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => handleDifficultySelect('optimal')}
                className={`flex-1 text-center py-2.5 rounded-lg text-sm transition-colors ${
                  difficulty === 'optimal'
                    ? 'bg-accent/20 border border-accent text-accent'
                    : 'bg-surface hover:bg-white/10'
                }`}
              >
                Optimal
              </button>
              <button
                onClick={() => handleDifficultySelect('hard')}
                className={`flex-1 text-center py-2.5 rounded-lg text-sm transition-colors ${
                  difficulty === 'hard'
                    ? 'bg-accent/20 border border-accent text-accent'
                    : 'bg-surface hover:bg-white/10'
                }`}
              >
                Hard
              </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4">
            <button className="flex items-center justify-center h-14 w-14 rounded-full bg-surface hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-3xl text-text-primary">pause</span>
            </button>
            <button
              onClick={onComplete}
              className="flex-1 text-center py-4 rounded-full text-lg font-bold bg-accent text-black hover:bg-cyan-200 transition-colors"
            >
              Continue
            </button>
            <button className="flex items-center justify-center h-14 w-14 rounded-full bg-surface hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-3xl text-text-primary">skip_next</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
