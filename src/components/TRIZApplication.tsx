import React, { useState, useEffect } from 'react';
import { Lightbulb, Check, ArrowRight } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { PolymathFeaturesService } from '../services/PolymathFeaturesService';
import { PolymathUserService } from '../services/PolymathUserService';
import { DomainType, PolymathUser } from '../types/polymath';

interface TRIZApplicationProps {
  onComplete?: () => void;
  onBack?: () => void;
}

export const TRIZApplication: React.FC<TRIZApplicationProps> = ({ onComplete, onBack }) => {
  const [principleNumber, setPrincipleNumber] = useState<number>(1);
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const featuresService = PolymathFeaturesService.getInstance();
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

  const domains = user ? Object.values(user.domains) : [];
  const trizPrinciples = featuresService.getTRIZPrinciples();

  React.useEffect(() => {
    if (domains.length > 0 && !selectedDomain) {
      const primary = domains.find(d => d.type === DomainType.PRIMARY);
      setSelectedDomain(primary ? primary.name : domains[0].name);
    }
  }, [domains, selectedDomain]);

  const handleApply = async () => {
    if (!problemDescription || !selectedDomain) {
      setMessages(['Please provide a problem description and select a domain']);
      return;
    }

    const result = await featuresService.applyTRIZPrinciple(principleNumber, problemDescription, selectedDomain);
    setMessages(result);

    setTimeout(() => {
      setMessages([]);
      setProblemDescription('');
      if (onComplete) onComplete();
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-dark-base p-4">
      <div className="max-w-4xl mx-auto">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <Icon icon={ArrowRight} size="sm" className="mr-2" />
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
          <div className="flex items-center space-x-3 mb-6">
            <Icon icon={Lightbulb} size="xl" className="text-silver-base" />
            <h1 className="text-2xl font-display font-bold text-text-primary">
              Apply TRIZ Principle
            </h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-silver-base mb-2">
                TRIZ Principle
              </label>
              <select
                value={principleNumber}
                onChange={(e) => setPrincipleNumber(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-800 text-white"
              >
                {Object.entries(trizPrinciples).map(([num, name]) => (
                  <option key={num} value={num}>
                    #{num}: {name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-text-tertiary mt-2">
                Selected: {trizPrinciples[principleNumber]}
              </p>
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
                Problem Description
              </label>
              <textarea
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Describe the problem or challenge you want to solve using this TRIZ principle..."
                rows={6}
                className="w-full px-4 py-3 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary placeholder-text-tertiary"
              />
            </div>

            <Button variant="primary" size="lg" onClick={handleApply} className="w-full">
              <Icon icon={Check} size="sm" className="mr-2" />
              Apply TRIZ Principle
            </Button>
          </div>
        </Card>

        {/* TRIZ Principles Reference */}
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-display font-semibold text-text-primary mb-4">
            TRIZ Principles Reference
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {Object.entries(trizPrinciples).map(([num, name]) => (
              <div
                key={num}
                className={`p-2 rounded-lg border ${parseInt(num) === principleNumber
                  ? 'border-silver-base/50 bg-silver-base/10'
                  : 'border-silver-dark/20'
                  }`}
              >
                <div className="font-medium text-text-primary">#{num}</div>
                <div className="text-xs text-text-secondary">{name}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

