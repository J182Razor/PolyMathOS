import React, { useState, useEffect } from 'react';
import { Brain, Target, Zap, Eye, Clock, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

interface AssessmentData {
  dopamineProfile: {
    motivationLevel: number;
    rewardSensitivity: number;
    goalOrientation: number;
    procrastinationTendency: number;
  };
  metaLearningSkills: {
    planningAbility: number;
    selfMonitoring: number;
    reflectionPractice: number;
    strategyAdaptation: number;
  };
  learningStylePreferences: {
    firstPrinciplesThinking: number;
    feynmanTechnique: number;
    observationalLearning: number;
    visualProcessing: number;
  };
  personalGoals: {
    primaryObjective: string;
    timeframe: string;
    motivationSource: string;
    successMetrics: string[];
  };
}

interface CognitiveAssessmentProps {
  onComplete: (data: AssessmentData) => void;
  onBack: () => void;
}

export const CognitiveAssessment: React.FC<CognitiveAssessmentProps> = ({ onComplete, onBack }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    dopamineProfile: {
      motivationLevel: 0,
      rewardSensitivity: 0,
      goalOrientation: 0,
      procrastinationTendency: 0,
    },
    metaLearningSkills: {
      planningAbility: 0,
      selfMonitoring: 0,
      reflectionPractice: 0,
      strategyAdaptation: 0,
    },
    learningStylePreferences: {
      firstPrinciplesThinking: 0,
      feynmanTechnique: 0,
      observationalLearning: 0,
      visualProcessing: 0,
    },
    personalGoals: {
      primaryObjective: '',
      timeframe: '',
      motivationSource: '',
      successMetrics: [],
    },
  });

  const sections = [
    {
      title: "Dopamine & Motivation Profile",
      subtitle: "Understanding your brain's reward system",
      icon: Zap,
      questions: [
        {
          id: 'motivationLevel',
          question: "How would you describe your typical motivation levels throughout the day?",
          type: 'scale',
          options: [
            "Very low - I struggle to get started on tasks",
            "Low - I need external pressure to begin",
            "Moderate - I can start but sometimes lose steam",
            "High - I'm generally self-motivated",
            "Very high - I'm consistently driven and energized"
          ]
        },
        {
          id: 'rewardSensitivity',
          question: "How do you respond to small achievements and progress milestones?",
          type: 'scale',
          options: [
            "I barely notice small wins",
            "Small achievements provide minimal satisfaction",
            "I appreciate progress but need bigger wins",
            "Small victories give me good energy boosts",
            "Every small win significantly motivates me"
          ]
        },
        {
          id: 'goalOrientation',
          question: "How do you typically approach long-term goals?",
          type: 'scale',
          options: [
            "I rarely set or stick to long-term goals",
            "I set goals but often abandon them",
            "I work toward goals inconsistently",
            "I pursue goals steadily with occasional setbacks",
            "I'm highly focused and persistent with goals"
          ]
        },
        {
          id: 'procrastinationTendency',
          question: "How often do you delay starting important but challenging tasks?",
          type: 'scale',
          options: [
            "Almost always - I procrastinate constantly",
            "Often - I delay most challenging tasks",
            "Sometimes - I procrastinate on difficult items",
            "Rarely - I usually start tasks promptly",
            "Never - I tackle challenges immediately"
          ]
        }
      ]
    },
    {
      title: "Meta-Learning Skills Assessment",
      subtitle: "Evaluating your 'learning how to learn' abilities",
      icon: Brain,
      questions: [
        {
          id: 'planningAbility',
          question: "Before starting a new learning project, how thoroughly do you plan your approach?",
          type: 'scale',
          options: [
            "I dive in without any planning",
            "I do minimal planning, mostly just start",
            "I plan somewhat but keep it flexible",
            "I create detailed plans and strategies",
            "I extensively plan with multiple contingencies"
          ]
        },
        {
          id: 'selfMonitoring',
          question: "During learning sessions, how aware are you of your comprehension and progress?",
          type: 'scale',
          options: [
            "I rarely check my understanding",
            "I occasionally notice if I'm confused",
            "I sometimes assess my progress",
            "I regularly monitor my comprehension",
            "I constantly evaluate my understanding"
          ]
        },
        {
          id: 'reflectionPractice',
          question: "After completing learning sessions, how often do you reflect on what worked well?",
          type: 'scale',
          options: [
            "I never reflect on my learning process",
            "I rarely think about what worked",
            "I sometimes consider my methods",
            "I regularly reflect on my approach",
            "I always analyze and document insights"
          ]
        },
        {
          id: 'strategyAdaptation',
          question: "When a learning method isn't working, how quickly do you try different approaches?",
          type: 'scale',
          options: [
            "I stick with the same method regardless",
            "I'm slow to change my approach",
            "I eventually try different methods",
            "I adapt my strategies fairly quickly",
            "I immediately experiment with new approaches"
          ]
        }
      ]
    },
    {
      title: "Learning Style Preferences",
      subtitle: "Identifying your optimal genius learning methods",
      icon: Eye,
      questions: [
        {
          id: 'firstPrinciplesThinking',
          question: "How much do you enjoy breaking down complex topics to their fundamental components?",
          type: 'scale',
          options: [
            "I prefer to accept information as presented",
            "I occasionally question underlying assumptions",
            "I sometimes break things down to basics",
            "I often analyze fundamental principles",
            "I always deconstruct to first principles"
          ]
        },
        {
          id: 'feynmanTechnique',
          question: "How comfortable are you explaining complex concepts in simple terms?",
          type: 'scale',
          options: [
            "I struggle to explain things simply",
            "I can explain but often use complex language",
            "I can simplify with some effort",
            "I'm good at making things understandable",
            "I excel at simple, clear explanations"
          ]
        },
        {
          id: 'observationalLearning',
          question: "How much do you learn through careful observation and detailed analysis?",
          type: 'scale',
          options: [
            "I rarely learn through observation",
            "I occasionally notice important details",
            "I sometimes learn by watching carefully",
            "I often gain insights through observation",
            "I'm highly observational and detail-oriented"
          ]
        },
        {
          id: 'visualProcessing',
          question: "How important are visual elements (diagrams, charts, images) in your learning?",
          type: 'scale',
          options: [
            "I prefer text-only information",
            "Visuals are occasionally helpful",
            "I appreciate some visual elements",
            "Visuals significantly enhance my learning",
            "I need visual elements to understand effectively"
          ]
        }
      ]
    },
    {
      title: "Personal Learning Goals",
      subtitle: "Setting up your dopamine-optimized learning journey",
      icon: Target,
      questions: [
        {
          id: 'primaryObjective',
          question: "What is your primary learning objective with NeuroAscend?",
          type: 'text',
          placeholder: "e.g., Master machine learning fundamentals, Improve memory retention, Develop critical thinking skills"
        },
        {
          id: 'timeframe',
          question: "What timeframe do you have in mind for achieving this goal?",
          type: 'select',
          options: [
            "1-2 weeks (intensive sprint)",
            "1 month (focused effort)",
            "3 months (steady progress)",
            "6 months (comprehensive mastery)",
            "1 year+ (long-term development)"
          ]
        },
        {
          id: 'motivationSource',
          question: "What motivates you most about achieving this learning goal?",
          type: 'text',
          placeholder: "e.g., Career advancement, Personal satisfaction, Solving specific problems, Intellectual curiosity"
        },
        {
          id: 'successMetrics',
          question: "How will you know when you've succeeded? (Select all that apply)",
          type: 'multiselect',
          options: [
            "I can explain the concepts to others clearly",
            "I can apply the knowledge to real problems",
            "I feel confident in my understanding",
            "I can teach or mentor others in this area",
            "I can create original work or solutions",
            "I receive recognition or certification",
            "I achieve specific performance metrics"
          ]
        }
      ]
    }
  ];

  const handleAnswer = (questionId: string, value: any) => {
    const section = sections[currentSection];
    const sectionKey = Object.keys(assessmentData)[currentSection] as keyof AssessmentData;
    
    if (sectionKey === 'personalGoals') {
      setAssessmentData(prev => ({
        ...prev,
        personalGoals: {
          ...prev.personalGoals,
          [questionId]: value
        }
      }));
    } else {
      setAssessmentData(prev => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          [questionId]: value
        }
      }));
    }
  };

  const canProceed = () => {
    const section = sections[currentSection];
    const sectionKey = Object.keys(assessmentData)[currentSection] as keyof AssessmentData;
    const sectionData = assessmentData[sectionKey];
    
    return section.questions.every(q => {
      const value = (sectionData as any)[q.id];
      if (q.type === 'multiselect') {
        return Array.isArray(value) && value.length > 0;
      }
      return value !== undefined && value !== '' && value !== 0;
    });
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      onComplete(assessmentData);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    } else {
      onBack();
    }
  };

  const currentSectionData = sections[currentSection];
  const progress = ((currentSection + 1) / sections.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Icon icon={Brain} size="lg" className="text-indigo-600 dark:text-indigo-400 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              NeuroAscend Cognitive Assessment
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            This science-backed assessment will help us understand your unique learning profile and create 
            a personalized AI-powered learning experience optimized for your brain's reward system.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Section {currentSection + 1} of {sections.length}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Section */}
        <Card className="max-w-4xl mx-auto">
          <div className="p-8">
            {/* Section Header */}
            <div className="flex items-center mb-6">
              <Icon icon={currentSectionData.icon} size="lg" className="text-indigo-600 dark:text-indigo-400 mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentSectionData.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {currentSectionData.subtitle}
                </p>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-8">
              {currentSectionData.questions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {index + 1}. {question.question}
                  </h3>
                  
                  {question.type === 'scale' && (
                    <div className="space-y-3">
                      {question.options?.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={question.id}
                            value={optionIndex + 1}
                            onChange={(e) => handleAnswer(question.id, parseInt(e.target.value))}
                            className="mr-3 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'text' && (
                    <input
                      type="text"
                      placeholder={question.placeholder}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  )}

                  {question.type === 'select' && (
                    <select
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select an option...</option>
                      {question.options?.map((option, optionIndex) => (
                        <option key={optionIndex} value={option}>{option}</option>
                      ))}
                    </select>
                  )}

                  {question.type === 'multiselect' && (
                    <div className="space-y-3">
                      {question.options?.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              const currentValues = (assessmentData.personalGoals as any)[question.id] || [];
                              const newValues = e.target.checked 
                                ? [...currentValues, option]
                                : currentValues.filter((v: string) => v !== option);
                              handleAnswer(question.id, newValues);
                            }}
                            className="mr-3 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                className="flex items-center"
              >
                <Icon icon={ArrowLeft} size="sm" className="mr-2" />
                {currentSection === 0 ? 'Back to Dashboard' : 'Previous'}
              </Button>

              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center"
              >
                {currentSection === sections.length - 1 ? 'Complete Assessment' : 'Next Section'}
                <Icon icon={currentSection === sections.length - 1 ? CheckCircle : ArrowRight} size="sm" className="ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

