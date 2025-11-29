import React, { useState, useEffect } from 'react';
import { DynamicWorkflowService } from '../../services/DynamicWorkflowService';
import { ApiErrorHandler, ApiError } from '../../utils/apiErrorHandler';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

interface CurriculumBuilderProps {
  userData: any;
  onComplete: (program: any) => void;
  onBack?: () => void;
}

interface Module {
  id: number;
  title: string;
  description: string;
  expanded: boolean;
}

const CurriculumBuilder: React.FC<CurriculumBuilderProps> = ({ userData, onComplete, onBack }) => {
  const [timeline, setTimeline] = useState('1 Month');
  const [modules, setModules] = useState<Module[]>([
    {
      id: 1,
      title: 'Introduction to Quantum States',
      description: 'Grasp the fundamental concepts of qubits, superposition, and the principles that govern quantum systems.',
      expanded: false,
    },
    {
      id: 2,
      title: 'The EPR Paradox',
      description: 'Explore the famous thought experiment by Einstein, Podolsky, and Rosen that questioned quantum mechanics.',
      expanded: false,
    },
    {
      id: 3,
      title: "Bell's Theorem & Non-Locality",
      description: "Understand the mathematical proof that demonstrates the inconsistencies of local hidden-variable theories.",
      expanded: false,
    },
  ]);
  const [topic, setTopic] = useState('Quantum Entanglement');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const workflowService = new DynamicWorkflowService();

  useEffect(() => {
    // Generate curriculum based on user data
    if (userData.domains && userData.domains.length > 0) {
      const primaryDomain = userData.domains[0];
      setTopic(primaryDomain.charAt(0).toUpperCase() + primaryDomain.slice(1).replace(/-/g, ' '));
    }
  }, [userData]);

  const toggleModule = (id: number) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, expanded: !m.expanded } : m));
  };

  const handleStartLearningPath = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // Integrate with DynamicWorkflowService to create learning plan workflow
      const workflow = await workflowService.generateWorkflow({
        type: 'learning_plan',
        topic,
        timeline,
        modules: modules.length,
        user_id: userData.userId || 'guest',
      });

      const program = {
        name: `${topic} Learning Path`,
        topic,
        timeline,
        modules,
        workflow_id: workflow.workflow_id,
        userId: userData.userId || 'guest',
        createdAt: new Date(),
      };

      setIsGenerating(false);
      onComplete(program);
    } catch (err) {
      const apiError = ApiErrorHandler.handleError(err);
      setError(apiError);
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark antialiased font-display">
      {/* Top App Bar */}
      <header className="flex items-center bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10">
        <button onClick={onBack} className="text-text-main flex size-10 shrink-0 items-center justify-center">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-text-title text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Curriculum Builder
        </h2>
        <div className="size-10 shrink-0"></div>
      </header>

      <main className="flex-1 flex flex-col px-4 pt-4 pb-28">
        {/* Headline Text */}
        <h1 className="text-text-title tracking-tight text-[32px] font-bold leading-tight text-left pb-4">
          {topic}
        </h1>

        {/* Section Header for Timeline */}
        <h3 className="text-text-title text-lg font-bold leading-tight tracking-[-0.015em] pt-4 pb-3">
          Select Your Timeline
        </h3>

        {/* Chips for Timeline Selection */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {['1 Week', '1 Month', '6 Months', '1 Year'].map((option) => (
            <div
              key={option}
              onClick={() => setTimeline(option)}
              className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 cursor-pointer transition-all ${
                timeline === option
                  ? 'bg-accent ring-2 ring-accent/50'
                  : 'bg-surface-dark'
              }`}
            >
              <p className={`text-sm font-medium leading-normal ${
                timeline === option ? 'text-background-dark font-bold' : 'text-text-main'
              }`}>
                {option}
              </p>
            </div>
          ))}
        </div>

        {/* Body Text (Dynamic Summary) */}
        <p className="text-text-main text-base font-normal leading-normal pt-4 pb-6">
          AI recommends {modules.length} modules, approximately 2 hours/week.
        </p>

        {/* Section Header for Modules */}
        <h3 className="text-text-title text-lg font-bold leading-tight tracking-[-0.015em] pb-3">
          Generated Modules
        </h3>

        {/* AI-Generated Curriculum List */}
        <div className="flex flex-col gap-3">
          {modules.map((module) => (
            <div key={module.id} className="flex flex-col rounded-xl bg-surface-dark p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-accent">Module {module.id}</span>
                  <h4 className="text-text-title font-bold text-base leading-tight">{module.title}</h4>
                </div>
                <button
                  onClick={() => toggleModule(module.id)}
                  className="text-text-main"
                >
                  <span className="material-symbols-outlined">
                    {module.expanded ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
              </div>
              {module.expanded && (
                <p className="text-text-main text-sm mt-2">{module.description}</p>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Error Message */}
      {error && (
        <div className="px-4 mt-4">
          <ErrorMessage 
            error={error} 
            onDismiss={() => setError(null)}
            retryable={ApiErrorHandler.isRetryable(error)}
            onRetry={handleStartLearningPath}
          />
        </div>
      )}

      {/* Bottom CTA Bar */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent">
        <button
          onClick={handleStartLearningPath}
          disabled={isGenerating}
          className="w-full h-14 bg-accent text-background-dark font-bold text-base rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_theme(colors.accent/0.5)] disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Creating Learning Path...</span>
            </>
          ) : (
            'Start Learning Path'
          )}
        </button>
      </footer>
    </div>
  );
};

export default CurriculumBuilder;
