/**
 * Installation Wizard Component
 * Guides users through initial setup: n8n instance and environment variables
 */

import React, { useState, useEffect } from 'react';
import { Settings, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Icon } from './ui/Icon';
import { N8NService } from '../services/N8NService';

interface InstallationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface EnvVariable {
  key: string;
  value: string;
  description: string;
  isSecret: boolean;
  required: boolean;
}

export const InstallationWizard: React.FC<{
  onComplete: () => void;
  onSkip?: () => void;
}> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [n8nUrl, setN8nUrl] = useState('');
  const [n8nConnected, setN8nConnected] = useState(false);
  const [envVariables, setEnvVariables] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const steps: InstallationStep[] = [
    {
      id: 'n8n',
      title: 'Connect n8n Instance',
      description: 'Enter your n8n webhook URL to enable automation features',
      completed: n8nConnected,
    },
    {
      id: 'env',
      title: 'Configure Environment Variables',
      description: 'Set up API keys and configuration for PolyMathOS',
      completed: Object.keys(envVariables).length > 0,
    },
  ];

  const requiredEnvVars: EnvVariable[] = [
    {
      key: 'OPENAI_API_KEY',
      value: '',
      description: 'OpenAI API key for AI reasoning',
      isSecret: true,
      required: true,
    },
    {
      key: 'NVIDIA_API_KEY',
      value: '',
      description: 'NVIDIA API key from build.nvidia.com',
      isSecret: true,
      required: false,
    },
    {
      key: 'GEMINI_API_KEY',
      value: '',
      description: 'Google Gemini API key (optional)',
      isSecret: true,
      required: false,
    },
    {
      key: 'GROQ_API_KEY',
      value: '',
      description: 'Groq API key (optional)',
      isSecret: true,
      required: false,
    },
    {
      key: 'TIMESCALE_PASSWORD',
      value: '',
      description: 'TimescaleDB password for Tiger Data',
      isSecret: true,
      required: true,
    },
  ];

  useEffect(() => {
    // Check if n8n is already configured
    const savedN8nUrl = localStorage.getItem('n8n_webhook_url');
    if (savedN8nUrl) {
      setN8nUrl(savedN8nUrl);
      checkN8nConnection(savedN8nUrl);
    }

    // Load saved env variables
    const savedEnv = localStorage.getItem('polymathos_env');
    if (savedEnv) {
      try {
        setEnvVariables(JSON.parse(savedEnv));
      } catch (e) {
        console.error('Error loading env variables:', e);
      }
    }
  }, []);

  const checkN8nConnection = async (url: string) => {
    setIsLoading(true);
    try {
      // Update N8N service URL
      const testUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      localStorage.setItem('n8n_webhook_url', testUrl);
      
      // Test connection
      const isHealthy = await N8NService.checkHealth();
      if (isHealthy) {
        setN8nConnected(true);
        // Update environment variable
        setEnvVariables((prev) => ({ ...prev, N8N_WEBHOOK_URL: testUrl }));
      } else {
        setN8nConnected(false);
      }
    } catch (error) {
      console.error('n8n connection error:', error);
      setN8nConnected(false);
    }
    setIsLoading(false);
  };

  const handleN8nConnect = async () => {
    if (!n8nUrl.trim()) {
      alert('Please enter a valid n8n URL');
      return;
    }

    await checkN8nConnection(n8nUrl);
  };

  const handleEnvVarChange = (key: string, value: string) => {
    setEnvVariables((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveEnvVars = async () => {
    setIsLoading(true);
    try {
      // Save to localStorage as backup
      localStorage.setItem('polymathos_env', JSON.stringify(envVariables));

      // Save to backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/setup/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config: envVariables }),
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration to backend');
      }

      // Save to n8n if connected
      if (n8nConnected) {
        try {
          for (const [key, value] of Object.entries(envVariables)) {
            if (value) {
              await N8NService.setEnvVariable({
                key,
                value,
                description: requiredEnvVars.find((v) => v.key === key)?.description || '',
                isSecret: requiredEnvVars.find((v) => v.key === key)?.isSecret || false,
              });
            }
          }
        } catch (error) {
          console.error('Error saving env vars to n8n:', error);
        }
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    // Save all configuration
    handleSaveEnvVars();
    onComplete();
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const renderN8nStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2 text-royal-600 dark:text-royal-400">
          Connect to n8n
        </h3>
        <p className="text-text-secondary mb-6">
          n8n enables automation and workflow management for PolyMathOS. Enter your n8n webhook URL below.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-text-primary">
            n8n Webhook URL
          </label>
          <input
            type="text"
            value={n8nUrl}
            onChange={(e) => setN8nUrl(e.target.value)}
            placeholder="https://your-n8n-instance.com:5678"
            className="w-full px-4 py-3 rounded-lg border border-silver-400 dark:border-silver-500 bg-light-surface dark:bg-dark-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent transition-all"
          />
          <p className="mt-2 text-sm text-text-tertiary">
            Example: http://localhost:5678 or https://n8n.yourdomain.com:5678
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleN8nConnect}
            disabled={isLoading || !n8nUrl.trim()}
            className="flex-1"
          >
            {isLoading ? 'Connecting...' : n8nConnected ? '✓ Connected' : 'Connect to n8n'}
          </Button>
          {!n8nConnected && (
            <Button
              variant="outline"
              onClick={() => {
                 // Allow manual bypass
                 setN8nConnected(true);
                 if (n8nUrl) {
                     setEnvVariables(prev => ({ ...prev, N8N_WEBHOOK_URL: n8nUrl }));
                     localStorage.setItem('n8n_webhook_url', n8nUrl);
                 }
              }}
              className="whitespace-nowrap"
            >
              Skip Check (Manual)
            </Button>
          )}
        </div>

        {n8nConnected && (
          <div className="p-4 rounded-lg bg-royal-50 dark:bg-royal-950/20 border border-royal-200 dark:border-royal-800">
            <p className="text-sm text-royal-700 dark:text-royal-300">
              ✓ Successfully connected to n8n! You can now proceed to configure environment variables.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderEnvStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2 text-royal-600 dark:text-royal-400">
          Environment Variables
        </h3>
        <p className="text-text-secondary mb-6">
          Configure API keys and settings. Required fields are marked with an asterisk (*).
        </p>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {requiredEnvVars.map((envVar) => (
          <div key={envVar.key} className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              {envVar.key}
              {envVar.required && <span className="text-royal-500 ml-1">*</span>}
            </label>
            <input
              type={envVar.isSecret ? 'password' : 'text'}
              value={envVariables[envVar.key] || ''}
              onChange={(e) => handleEnvVarChange(envVar.key, e.target.value)}
              placeholder={envVar.description}
              className="w-full px-4 py-3 rounded-lg border border-silver-400 dark:border-silver-500 bg-light-surface dark:bg-dark-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-text-tertiary">{envVar.description}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={handleSaveEnvVars} variant="primary" className="flex-1">
          Save Environment Variables
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-overlay/80 dark:bg-dark-overlay/90 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-gradient mb-4">
              <Icon icon={Settings} size="lg" className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-royal-600 dark:text-royal-400">
              PolyMathOS Setup
            </h2>
            <p className="text-text-secondary">
              Let's configure your PolyMathOS installation
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      index === currentStep
                        ? 'border-royal-500 bg-royal-500 text-white'
                        : step.completed
                        ? 'border-purple-500 bg-purple-500 text-white'
                        : 'border-silver-400 dark:border-silver-500 text-text-tertiary'
                    }`}
                  >
                    {step.completed ? (
                      <Icon icon={Check} size="sm" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-text-primary">{step.title}</p>
                    <p className="text-xs text-text-tertiary">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      step.completed ? 'bg-purple-500' : 'bg-silver-300 dark:bg-silver-600'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 0 && renderN8nStep()}
            {currentStep === 1 && renderEnvStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-silver-300 dark:border-silver-600">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="px-6"
            >
              Skip Setup
            </Button>
            <div className="flex gap-4">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6"
                >
                  Previous
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={currentStep === 0 && !n8nConnected}
                  className="px-6"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="px-6 bg-brand-gradient"
                >
                  Complete Setup
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

