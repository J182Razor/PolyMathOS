import React, { useState, useEffect } from 'react';
import { Brain, Target, ArrowRight, Check } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { PolymathUserService } from '../services/PolymathUserService';
import { DomainType, LearningStyle, PolymathUser } from '../types/polymath';

interface DomainSelectionProps {
  onComplete: () => void;
  onBack?: () => void;
}

export const DomainSelection: React.FC<DomainSelectionProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState<'domains' | 'learning_style' | 'commitment'>('domains');
  const [primaryDomain, setPrimaryDomain] = useState('');
  const [secondaryDomain1, setSecondaryDomain1] = useState('');
  const [secondaryDomain2, setSecondaryDomain2] = useState('');
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(LearningStyle.VISUAL);
  const [dailyCommitment, setDailyCommitment] = useState(60);

  const [user, setUser] = useState<PolymathUser | null>(null);
  const [loading, setLoading] = useState(true);
  const userService = PolymathUserService.getInstance();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await userService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleComplete = () => {
    if (!user) return; // Use the state variable 'user'

    // Add domains
    if (primaryDomain) {
      userService.addDomain(user, primaryDomain, DomainType.PRIMARY);
    }
    if (secondaryDomain1) {
      userService.addDomain(user, secondaryDomain1, DomainType.SECONDARY);
    }
    if (secondaryDomain2) {
      userService.addDomain(user, secondaryDomain2, DomainType.SECONDARY);
    }

    // Update learning style and commitment
    user.learningStyle = learningStyle;
    user.dailyCommitment = dailyCommitment;
    userService.updateUser(user);

    onComplete();
  };

  const canProceed = () => {
    if (step === 'domains') {
      return primaryDomain && secondaryDomain1 && secondaryDomain2;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-dark-base flex items-center justify-center p-4">
      <Card className="p-8 max-w-2xl w-full">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-tertiary">
              Step {step === 'domains' ? 1 : step === 'learning_style' ? 2 : 3} of 3
            </span>
            <span className="text-sm text-silver-base">
              {step === 'domains' ? '33' : step === 'learning_style' ? '66' : '100'}%
            </span>
          </div>
          <div className="w-full bg-dark-elevated rounded-full h-2 border border-silver-dark/20">
            <div
              className="bg-shimmer h-2 rounded-full transition-all duration-300"
              style={{ width: `${step === 'domains' ? 33 : step === 'learning_style' ? 66 : 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Domain Selection */}
        {step === 'domains' && (
          <div>
            <div className="text-center mb-8">
              <Icon icon={Brain} size="xl" className="text-silver-base mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
                Select Your Domains
              </h2>
              <p className="text-text-secondary">
                Choose your primary domain and two supporting domains for your polymath journey
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-silver-base mb-2">
                  Primary Domain ⭐
                </label>
                <input
                  type="text"
                  value={primaryDomain}
                  onChange={(e) => setPrimaryDomain(e.target.value)}
                  placeholder="e.g., Neuroscience, Computer Science, Music Theory"
                  className="w-full px-4 py-3 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary placeholder-text-tertiary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-silver-base mb-2">
                  Secondary Domain 1 🔹
                </label>
                <input
                  type="text"
                  value={secondaryDomain1}
                  onChange={(e) => setSecondaryDomain1(e.target.value)}
                  placeholder="e.g., Mathematics, Philosophy, Art"
                  className="w-full px-4 py-3 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary placeholder-text-tertiary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-silver-base mb-2">
                  Secondary Domain 2 🔹
                </label>
                <input
                  type="text"
                  value={secondaryDomain2}
                  onChange={(e) => setSecondaryDomain2(e.target.value)}
                  placeholder="e.g., History, Psychology, Design"
                  className="w-full px-4 py-3 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary placeholder-text-tertiary"
                />
              </div>
            </div>

            {primaryDomain && secondaryDomain1 && secondaryDomain2 && (
              <div className="mt-6 p-4 glass rounded-lg border border-silver-base/20">
                <p className="text-sm text-silver-light font-medium mb-2">Your Mission Statement:</p>
                <p className="text-text-secondary italic">
                  "I will master {primaryDomain} through {secondaryDomain1} and {secondaryDomain2}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Learning Style */}
        {step === 'learning_style' && (
          <div>
            <div className="text-center mb-8">
              <Icon icon={Target} size="xl" className="text-silver-base mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
                Your Learning Style
              </h2>
              <p className="text-text-secondary">
                How do you learn best?
              </p>
            </div>

            <div className="space-y-3">
              {Object.values(LearningStyle).map((style) => (
                <button
                  key={style}
                  onClick={() => setLearningStyle(style)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${learningStyle === style
                    ? 'border-silver-base/50 bg-silver-base/10 text-silver-light'
                    : 'border-silver-dark/30 hover:border-silver-base/50 text-text-secondary hover:text-text-primary bg-dark-surface/50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{style}</span>
                    {learningStyle === style && (
                      <Icon icon={Check} size="sm" className="text-silver-base" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Daily Commitment */}
        {step === 'commitment' && (
          <div>
            <div className="text-center mb-8">
              <Icon icon={Target} size="xl" className="text-silver-base mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
                Daily Commitment
              </h2>
              <p className="text-text-secondary">
                How many minutes per day can you commit to learning?
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium text-text-primary">
                    {dailyCommitment} minutes/day
                  </span>
                  <span className="text-sm text-text-tertiary">
                    {Math.round(dailyCommitment * 7 / 60)} hours/week
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="15"
                  value={dailyCommitment}
                  onChange={(e) => setDailyCommitment(parseInt(e.target.value))}
                  className="w-full h-2 bg-dark-elevated rounded-lg appearance-none cursor-pointer accent-silver-base"
                />
                <div className="flex justify-between text-xs text-text-tertiary mt-2">
                  <span>30 min</span>
                  <span>2 hours</span>
                </div>
              </div>

              <div className="p-4 glass rounded-lg border border-silver-dark/20">
                <p className="text-sm text-text-secondary mb-2">Weekly Breakdown:</p>
                <div className="grid grid-cols-7 gap-2 text-xs">
                  {Object.entries({
                    Mon: dailyCommitment,
                    Tue: dailyCommitment,
                    Wed: dailyCommitment,
                    Thu: dailyCommitment,
                    Fri: dailyCommitment,
                    Sat: Math.round(dailyCommitment * 1.5),
                    Sun: Math.round(dailyCommitment * 0.5),
                  }).map(([day, mins]) => (
                    <div key={day} className="text-center">
                      <div className="text-text-tertiary">{day}</div>
                      <div className="text-silver-base font-medium">{mins}m</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-silver-dark/20">
          {onBack && step === 'domains' ? (
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
          ) : step !== 'domains' ? (
            <Button variant="ghost" onClick={() => {
              if (step === 'commitment') setStep('learning_style');
              else if (step === 'learning_style') setStep('domains');
            }}>
              Previous
            </Button>
          ) : (
            <div />
          )}

          {step === 'commitment' ? (
            <Button variant="primary" onClick={handleComplete} disabled={!canProceed()}>
              Complete Setup
              <Icon icon={Check} size="sm" className="ml-2" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                if (step === 'domains') setStep('learning_style');
                else if (step === 'learning_style') setStep('commitment');
              }}
              disabled={!canProceed()}
            >
              Next
              <Icon icon={ArrowRight} size="sm" className="ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

