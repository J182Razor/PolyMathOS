import React, { useState, useEffect } from 'react';
import { Zap, Play, Pause, Square, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { PolymathFeaturesService } from '../services/PolymathFeaturesService';
import { PolymathUserService } from '../services/PolymathUserService';
import { DomainType } from '../types/polymath';

interface DeepWorkBlockProps {
  onComplete?: () => void;
  onBack?: () => void;
}

export const DeepWorkBlock: React.FC<DeepWorkBlockProps> = ({ onComplete, onBack }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(25);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // seconds
  const [selectedDomain, setSelectedDomain] = useState('');
  const [activityType, setActivityType] = useState<'active_recall' | 'problem_solving' | 'reading' | 'writing'>('active_recall');
  const [messages, setMessages] = useState<string[]>([]);

  const featuresService = PolymathFeaturesService.getInstance();
  const userService = PolymathUserService.getInstance();

  const user = userService.getCurrentUser();
  const domains = user ? Object.values(user.domains) : [];

  useEffect(() => {
    if (domains.length > 0 && !selectedDomain) {
      const primary = domains.find(d => d.type === DomainType.PRIMARY);
      setSelectedDomain(primary ? primary.name : domains[0].name);
    }
  }, [domains, selectedDomain]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleComplete = () => {
    setIsRunning(false);
    if (!selectedDomain) return;

    const minutes = Math.floor((duration * 60 - timeRemaining) / 60);
    const result = featuresService.startDeepWorkBlock(selectedDomain, minutes, activityType);
    setMessages(result);

    setTimeout(() => {
      setMessages([]);
      if (onComplete) onComplete();
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeRemaining) / (duration * 60)) * 100;

  return (
    <div className="min-h-screen bg-dark-base p-4">
      <div className="max-w-2xl mx-auto">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <Icon icon={Square} size="sm" className="mr-2" />
            Back
          </Button>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <Card className="p-4 mb-6 border-2 border-silver-base">
            {messages.map((msg, idx) => (
              <p key={idx} className="text-silver-light">{msg}</p>
            ))}
          </Card>
        )}

        <Card className="p-8">
          <div className="text-center mb-8">
            <Icon icon={Zap} size="xl" className="text-silver-base mx-auto mb-4" />
            <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
              Deep Work Block
            </h1>
            <p className="text-text-secondary">
              Focused, distraction-free learning session
            </p>
          </div>

          {/* Configuration */}
          {!isRunning && (
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-silver-base mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={duration}
                  onChange={(e) => {
                    const newDuration = parseInt(e.target.value);
                    setDuration(newDuration);
                    setTimeRemaining(newDuration * 60);
                  }}
                  className="w-full h-2 bg-dark-elevated rounded-lg appearance-none cursor-pointer accent-silver-base"
                />
                <div className="flex justify-between text-xs text-text-tertiary mt-2">
                  <span>15 min</span>
                  <span className="text-silver-base font-medium">{duration} min</span>
                  <span>90 min</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-silver-base mb-2">
                  Domain
                </label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-800 text-white"
                >
                  {domains.map((domain) => (
                    <option key={domain.name} value={domain.name}>
                      {domain.type === DomainType.PRIMARY ? '⭐' : '🔹'} {domain.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-silver-base mb-2">
                  Activity Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'active_recall', label: 'Active Recall' },
                    { value: 'problem_solving', label: 'Problem Solving' },
                    { value: 'reading', label: 'Focused Reading' },
                    { value: 'writing', label: 'Knowledge Synthesis' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setActivityType(type.value as any)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        activityType === type.value
                          ? 'border-silver-base/50 bg-silver-base/10 text-silver-light'
                          : 'border-silver-dark/30 hover:border-silver-base/50 text-text-secondary hover:text-text-primary bg-dark-surface/50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timer Display */}
          <div className="text-center mb-8">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-dark-elevated"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                  className="text-silver-base transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-shimmer mb-2">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-sm text-text-tertiary">
                    {Math.round(progress)}% Complete
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {!isRunning ? (
              <Button variant="primary" size="lg" onClick={handleStart}>
                <Icon icon={Play} size="sm" className="mr-2" />
                Start Session
              </Button>
            ) : (
              <>
                <Button variant="secondary" size="lg" onClick={handlePause}>
                  <Icon icon={Pause} size="sm" className="mr-2" />
                  Pause
                </Button>
                <Button variant="primary" size="lg" onClick={handleComplete}>
                  <Icon icon={Square} size="sm" className="mr-2" />
                  Complete
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

