import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, Home, Clock, Target, Zap, Eye, CheckCircle, 
  ArrowRight, ArrowLeft, Lightbulb, Star, Trophy,
  BarChart, Pause, Play, RotateCcw, MessageCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';

interface EnhancedLearningSessionProps {
  onComplete: () => void;
  onHome: () => void;
  userProfile?: any; // Assessment data from cognitive assessment
}

interface LearningState {
  currentSection: number;
  progress: number;
  dopamineLevel: number;
  engagementScore: number;
  comprehensionLevel: number;
  timeSpent: number;
  streakCount: number;
  achievementsUnlocked: string[];
}

interface MicroReward {
  id: string;
  type: 'visual' | 'text' | 'achievement';
  content: string;
  intensity: 'low' | 'medium' | 'high';
  triggered: boolean;
}

interface MetaLearningPrompt {
  id: string;
  timing: 'planning' | 'monitoring' | 'reflection';
  question: string;
  response?: string;
}

export const EnhancedLearningSession: React.FC<EnhancedLearningSessionProps> = ({ 
  onComplete, 
  onHome,
  userProfile 
}) => {
  const [learningState, setLearningState] = useState<LearningState>({
    currentSection: 0,
    progress: 0,
    dopamineLevel: 75,
    engagementScore: 80,
    comprehensionLevel: 0,
    timeSpent: 0,
    streakCount: 0,
    achievementsUnlocked: []
  });

  const [currentPhase, setCurrentPhase] = useState<'planning' | 'learning' | 'reflection'>('planning');
  const [microRewards, setMicroRewards] = useState<MicroReward[]>([]);
  const [metaPrompts, setMetaPrompts] = useState<MetaLearningPrompt[]>([]);
  const [showReward, setShowReward] = useState<MicroReward | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [feynmanMode, setFeynmanMode] = useState(false);
  const [userExplanation, setUserExplanation] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null); // RPE: confidence before answer
  const [rpeEvent, setRpeEvent] = useState<any>(null); // Store RPE event for display
  const [isHyperCorrection, setIsHyperCorrection] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Enhanced lesson content with neuroscience principles
  const lessonSections = [
    {
      id: 'anticipation',
      title: 'Curiosity Activation',
      type: 'hook',
      content: {
        hook: "What if I told you that your brain can literally rewire itself while you learn? Today, you'll discover the hidden mechanisms that make some people learn 10x faster than others.",
        preview: "By the end of this session, you'll understand how dopamine, neural plasticity, and meta-cognition work together to supercharge your learning.",
        personalConnection: "This knowledge will directly help you achieve your goal of mastering new skills faster and more effectively."
      }
    },
    {
      id: 'foundation',
      title: 'First Principles Breakdown',
      type: 'core_learning',
      content: {
        concept: "Neural Learning Mechanisms",
        fundamentals: [
          "Neurons communicate through electrical and chemical signals",
          "Learning creates new neural pathways through repetition",
          "Dopamine reinforces behaviors that lead to rewards",
          "Meta-cognition allows us to optimize our learning process"
        ],
        breakdown: "Let's deconstruct how your brain actually learns, starting from the most basic biological processes."
      }
    },
    {
      id: 'application',
      title: 'Active Practice',
      type: 'interactive',
      content: {
        challenge: "Apply the Feynman Technique",
        task: "Explain neural learning in simple terms, as if teaching a 12-year-old",
        guidance: "Use analogies, avoid jargon, and identify any gaps in your understanding"
      }
    },
    {
      id: 'synthesis',
      title: 'Neural Network Integration',
      type: 'synthesis',
      content: {
        connections: "How does this connect to your existing knowledge?",
        applications: "Where can you apply this in your daily learning?",
        insights: "What surprised you most about how your brain learns?"
      }
    }
  ];

  const questions = [
    {
      id: 1,
      question: "According to the lesson, what is the primary role of dopamine in learning?",
      options: [
        "It makes us feel happy when we learn",
        "It reinforces behaviors that lead to rewards",
        "It helps us remember information better",
        "It increases our attention span"
      ],
      correct: 1,
      explanation: "Dopamine acts as a reward-prediction signal, reinforcing behaviors that lead to positive outcomes. This creates a feedback loop that motivates us to repeat successful learning behaviors.",
      rewardTrigger: "Great! You understand how dopamine drives learning motivation! 🧠⚡"
    },
    {
      id: 2,
      question: "What is the key principle behind the Feynman Technique?",
      options: [
        "Learning through repetition and memorization",
        "Explaining complex concepts in simple terms",
        "Using visual aids to enhance understanding",
        "Breaking information into small chunks"
      ],
      correct: 1,
      explanation: "The Feynman Technique is based on the principle that true understanding is demonstrated by the ability to explain complex concepts simply. This process reveals gaps in knowledge and forces clarity of thought.",
      rewardTrigger: "Excellent! You've grasped the essence of genius-level learning! 🌟"
    },
    {
      id: 3,
      question: "Which meta-learning strategy involves continuously checking your understanding during learning?",
      options: [
        "Planning",
        "Monitoring", 
        "Evaluation",
        "Reflection"
      ],
      correct: 1,
      explanation: "Monitoring involves real-time awareness of your comprehension and progress. It's the 'thinking about thinking' that allows you to adjust your learning strategy on the fly.",
      rewardTrigger: "Perfect! You're developing meta-cognitive awareness! 🎯"
    }
  ];

  // Initialize micro-rewards based on user profile
  useEffect(() => {
    const rewards: MicroReward[] = [
      { id: 'progress_25', type: 'visual', content: '🎯 Quarter way there!', intensity: 'medium', triggered: false },
      { id: 'progress_50', type: 'achievement', content: 'MILESTONE: Neural Pathway Builder!', intensity: 'high', triggered: false },
      { id: 'progress_75', type: 'visual', content: '🚀 Almost there! Your brain is forming new connections!', intensity: 'high', triggered: false },
      { id: 'completion', type: 'achievement', content: 'LEGENDARY: Neural Network Master!', intensity: 'high', triggered: false },
      { id: 'streak_3', type: 'text', content: 'Amazing streak! Your dopamine is flowing!', intensity: 'medium', triggered: false },
      { id: 'perfect_answer', type: 'visual', content: '⚡ Perfect! Your neural networks are firing!', intensity: 'high', triggered: false }
    ];
    setMicroRewards(rewards);

    // Initialize meta-learning prompts
    const prompts: MetaLearningPrompt[] = [
      { id: 'planning_1', timing: 'planning', question: 'What specific outcome do you want from this learning session?' },
      { id: 'planning_2', timing: 'planning', question: 'How will you know if you\'ve truly understood the material?' },
      { id: 'monitoring_1', timing: 'monitoring', question: 'How confident do you feel about the material so far?' },
      { id: 'monitoring_2', timing: 'monitoring', question: 'What connections are you making to your existing knowledge?' },
      { id: 'reflection_1', timing: 'reflection', question: 'What was your biggest insight from this session?' },
      { id: 'reflection_2', timing: 'reflection', question: 'How will you apply this knowledge in the next 24 hours?' }
    ];
    setMetaPrompts(prompts);
  }, [userProfile]);

  // Timer for tracking engagement
  useEffect(() => {
    if (!isPaused && currentPhase === 'learning') {
      timerRef.current = setInterval(() => {
        setLearningState(prev => ({
          ...prev,
          timeSpent: prev.timeSpent + 1
        }));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, currentPhase]);

  // Trigger micro-rewards based on progress
  useEffect(() => {
    const progress = learningState.progress;
    const rewards = [...microRewards];
    
    if (progress >= 25 && !rewards.find(r => r.id === 'progress_25')?.triggered) {
      triggerReward('progress_25');
    }
    if (progress >= 50 && !rewards.find(r => r.id === 'progress_50')?.triggered) {
      triggerReward('progress_50');
    }
    if (progress >= 75 && !rewards.find(r => r.id === 'progress_75')?.triggered) {
      triggerReward('progress_75');
    }
    if (progress >= 100 && !rewards.find(r => r.id === 'completion')?.triggered) {
      triggerReward('completion');
    }
  }, [learningState.progress]);

  const triggerReward = (rewardId: string) => {
    const reward = microRewards.find(r => r.id === rewardId);
    if (reward && !reward.triggered) {
      setMicroRewards(prev => 
        prev.map(r => r.id === rewardId ? { ...r, triggered: true } : r)
      );
      setShowReward(reward);
      
      // Boost dopamine level
      setLearningState(prev => ({
        ...prev,
        dopamineLevel: Math.min(100, prev.dopamineLevel + 10)
      }));

      // Hide reward after 3 seconds
      setTimeout(() => setShowReward(null), 3000);
    }
  };

  const handleAnswerSelect = async (answerIndex: number) => {
    // If confidence wasn't set, prompt for it first (RPE requirement)
    if (confidence === null) {
      alert('Please set your confidence level before selecting an answer. This helps optimize your learning through Reward Prediction Error (RPE).');
      return;
    }

    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    const currentQ = questions[currentQuestion];
    
    // Process RPE
    try {
      const { RewardPredictionErrorService } = await import('../services/RewardPredictionErrorService');
      const rpeService = RewardPredictionErrorService.getInstance();
      
      // Record prediction (should have been done, but ensure it)
      rpeService.recordPrediction(
        `q_${currentQ.id}`,
        confidence,
        isCorrect ? 'correct' : 'incorrect'
      );
      
      // Process outcome
      const rpeEventResult = rpeService.processOutcome(
        `q_${currentQ.id}`,
        isCorrect ? 'correct' : 'incorrect'
      );
      
      if (rpeEventResult) {
        setRpeEvent(rpeEventResult);
        setIsHyperCorrection(rpeEventResult.learningValue >= 0.8 && !isCorrect);
        
        // Generate reward based on RPE
        const reward = rpeService.generateReward(rpeEventResult);
        if (reward.shouldReward) {
          triggerReward('perfect_answer');
          setLearningState(prev => ({
            ...prev,
            dopamineLevel: Math.min(100, prev.dopamineLevel + (reward.rewardType === 'large' ? 15 : reward.rewardType === 'medium' ? 10 : 5))
          }));
        }
      }
    } catch (error) {
      console.error('RPE processing error:', error);
    }
    
    if (isCorrect) {
      // Trigger success reward
      triggerReward('perfect_answer');
      
      // Update streak
      setLearningState(prev => ({
        ...prev,
        streakCount: prev.streakCount + 1,
        comprehensionLevel: Math.min(100, prev.comprehensionLevel + 20)
      }));

      // Check for streak rewards
      if (learningState.streakCount + 1 >= 3) {
        triggerReward('streak_3');
      }
    } else {
      // Reset streak on incorrect
      setLearningState(prev => ({
        ...prev,
        streakCount: 0
      }));
    }

    // Update progress
    const newProgress = ((currentQuestion + 1) / questions.length) * 100;
    setLearningState(prev => ({
      ...prev,
      progress: newProgress
    }));
  };

  const handleNextQuestion = async () => {
    // Save to enhanced spaced repetition before moving on
    if (selectedAnswer !== null && confidence !== null) {
      try {
        const { EnhancedSpacedRepetitionService } = await import('../services/EnhancedSpacedRepetitionService');
        const enhancedSR = EnhancedSpacedRepetitionService.getInstance();
        
        const currentQ = questions[currentQuestion];
        const isCorrect = selectedAnswer === currentQ.correct;
        
        // Create or update item in enhanced spaced repetition
        const itemId = `session_${Date.now()}_${currentQ.id}`;
        enhancedSR.createItem(
          itemId,
          currentQ.explanation,
          currentQ.question,
          currentQ.options[currentQ.correct],
          'Neuroscience',
          undefined, // visual encoding
          undefined // memory palace locus
        );
        
        // Process review
        enhancedSR.processReview(itemId, isCorrect, confidence, false);
      } catch (error) {
        console.error('Error saving to enhanced spaced repetition:', error);
      }
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setConfidence(null); // Reset confidence for next question
      setRpeEvent(null);
      setIsHyperCorrection(false);
    } else {
      setCurrentPhase('reflection');
    }
  };

  const handleFeynmanExplanation = () => {
    setFeynmanMode(true);
  };

  const submitFeynmanExplanation = async () => {
    // Use LLM service for Feynman analysis
    try {
      const { LLMService } = await import('../services/LLMService');
      const llmService = LLMService.getInstance();
      
      const currentQ = questions[currentQuestion];
      const analysis = await llmService.analyzeFeynmanExplanation(
        userExplanation,
        currentQ.question
      );
      
      if (analysis.clarity >= 80) {
        triggerReward('perfect_answer');
        setLearningState(prev => ({
          ...prev,
          comprehensionLevel: Math.min(100, prev.comprehensionLevel + 30)
        }));
      } else if (analysis.clarity >= 60) {
        setLearningState(prev => ({
          ...prev,
          comprehensionLevel: Math.min(100, prev.comprehensionLevel + 15)
        }));
      }
      
      // Show feedback
      if (analysis.suggestions.length > 0) {
        console.log('Feynman Analysis:', analysis);
      }
    } catch (error) {
      console.error('Feynman analysis error:', error);
      // Fallback to simple analysis
      const wordCount = userExplanation.split(' ').length;
      const hasSimpleLanguage = !userExplanation.match(/\b(neurotransmitter|synaptic|neuroplasticity)\b/);
      
      if (wordCount > 20 && hasSimpleLanguage) {
        triggerReward('perfect_answer');
        setLearningState(prev => ({
          ...prev,
          comprehensionLevel: Math.min(100, prev.comprehensionLevel + 30)
        }));
      }
    }
    
    setFeynmanMode(false);
    setCurrentPhase('reflection');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPlanningPhase = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Icon icon={Target} size="lg" className="text-silver-base mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
          Learning Session Planning
        </h2>
        <p className="text-text-secondary">
          Let's optimize your learning session for maximum effectiveness
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
          Set Your Learning Intentions
        </h3>
        <div className="space-y-4">
          {metaPrompts.filter(p => p.timing === 'planning').map(prompt => (
            <div key={prompt.id}>
              <label className="block text-sm font-medium text-silver-base mb-2">
                {prompt.question}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary placeholder-text-tertiary"
                rows={2}
                placeholder="Your response..."
                onChange={(e) => {
                  setMetaPrompts(prev => 
                    prev.map(p => p.id === prompt.id ? { ...p, response: e.target.value } : p)
                  );
                }}
              />
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button 
            variant="primary" 
            onClick={() => setCurrentPhase('learning')}
            className="px-8"
          >
            <Icon icon={ArrowRight} size="sm" className="mr-2" />
            Begin Learning Session
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderLearningPhase = () => (
    <div className="space-y-6">
      {/* Header with real-time metrics */}
      <div className="flex items-center justify-between glass border border-silver-base/30 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <Icon icon={Brain} size="md" className="text-silver-light" />
          <div>
            <h2 className="text-xl font-display font-bold text-text-primary">Neural Learning Session</h2>
            <p className="text-text-secondary">Question {currentQuestion + 1} of {questions.length}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-sm text-text-tertiary">Dopamine Level</div>
            <div className="text-lg font-bold text-shimmer">{learningState.dopamineLevel}%</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-text-tertiary">Time</div>
            <div className="text-lg font-bold text-shimmer">{formatTime(learningState.timeSpent)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-text-tertiary">Streak</div>
            <div className="text-lg font-bold text-shimmer">{learningState.streakCount}</div>
          </div>
        </div>
      </div>

      {/* Progress Bar with Neural Animation */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-secondary">
            Neural Network Formation
          </span>
          <span className="text-sm font-medium text-silver-base">
            {Math.round(learningState.progress)}%
          </span>
        </div>
        <div className="w-full bg-dark-elevated rounded-full h-3 relative overflow-hidden border border-silver-dark/20">
          <div 
            className="bg-shimmer h-3 rounded-full transition-all duration-500 relative"
            style={{ width: `${learningState.progress}%` }}
          >
            <div className="absolute inset-0 bg-shimmer animate-shimmer rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Current Question */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-display font-semibold text-text-primary mb-4">
            {questions[currentQuestion].question}
          </h3>
          
          {/* RPE: Confidence Rating Before Answer */}
          {!showExplanation && (
            <div className="mb-6 p-4 bg-silver-dark/10 rounded-lg border border-silver-dark/20">
              <label className="block text-sm font-medium text-silver-base mb-3">
                🎯 Confidence Level (Before Answering) - Critical for RPE Learning
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={confidence || 50}
                  onChange={(e) => setConfidence(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-lg font-bold text-shimmer w-16 text-right">
                  {confidence || 50}%
                </span>
              </div>
              <p className="text-xs text-text-tertiary mt-2">
                High confidence + error = Hyper-Correction (maximum learning opportunity)
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === index
                    ? index === questions[currentQuestion].correct
                      ? 'border-green-500/50 bg-green-500/10 text-green-400'
                      : 'border-red-500/50 bg-red-500/10 text-red-400'
                    : showExplanation && index === questions[currentQuestion].correct
                    ? 'border-green-500/50 bg-green-500/10 text-green-400'
                    : 'border-silver-dark/30 hover:border-silver-base/50 text-text-secondary hover:text-text-primary bg-dark-surface/50'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mr-3 text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </div>
              </button>
            ))}
          </div>
        </div>

        {showExplanation && (
          <div className="mt-6 space-y-4">
            {/* Hyper-Correction Highlight */}
            {isHyperCorrection && (
              <div className="p-4 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-lg">
                <div className="flex items-start">
                  <Icon icon={Zap} size="sm" className="text-yellow-400 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold text-yellow-400 mb-2">
                      🧠 Critical Learning Moment - Hyper-Correction Detected!
                    </h4>
                    <p className="text-text-secondary text-sm mb-2">
                      You were highly confident ({confidence}%) but got it wrong. This is a 
                      <strong className="text-yellow-400"> massive learning opportunity</strong> - 
                      your brain will encode this correction with maximum strength.
                    </p>
                    <p className="text-text-secondary text-sm">
                      RPE Value: {rpeEvent?.rpeValue?.toFixed(2)} | Learning Value: {rpeEvent?.learningValue?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* RPE Feedback */}
            {rpeEvent && !isHyperCorrection && (
              <div className="p-4 glass rounded-lg border border-silver-dark/20">
                <div className="flex items-start">
                  <Icon icon={BarChart} size="sm" className="text-silver-base mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold text-silver-light mb-2">Reward Prediction Error (RPE)</h4>
                    <p className="text-text-secondary text-sm">
                      Expected: {(rpeEvent.expectedOutcome * 100).toFixed(0)}% | 
                      Actual: {(rpeEvent.actualOutcome * 100).toFixed(0)}% | 
                      RPE: {rpeEvent.rpeValue > 0 ? '+' : ''}{rpeEvent.rpeValue.toFixed(2)}
                    </p>
                    {rpeEvent.rpeValue > 0.2 && (
                      <p className="text-green-400 text-sm mt-1">
                        ✨ Strong positive RPE - Your brain is reinforcing this learning!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Standard Explanation */}
            <div className="p-4 glass rounded-lg border border-silver-dark/20">
              <div className="flex items-start">
                <Icon icon={Lightbulb} size="sm" className="text-silver-base mr-3 mt-1" />
                <div>
                  <h4 className="font-semibold text-silver-light mb-2">Explanation</h4>
                  <p className="text-text-secondary mb-3">
                    {questions[currentQuestion].explanation}
                  </p>
                  {selectedAnswer === questions[currentQuestion].correct && (
                    <div className="text-green-400 font-medium">
                      {questions[currentQuestion].rewardTrigger}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {showExplanation && (
          <div className="mt-6 flex justify-between">
            <Button variant="secondary" onClick={handleFeynmanExplanation}>
              <Icon icon={MessageCircle} size="sm" className="mr-2" />
              Try Feynman Technique
            </Button>
            <Button variant="primary" onClick={handleNextQuestion}>
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Session'}
              <Icon icon={ArrowRight} size="sm" className="ml-2" />
            </Button>
          </div>
        )}
      </Card>

      {/* Feynman Technique Modal */}
      {feynmanMode && (
        <Card className="p-6 border-2 border-silver-base">
          <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
            🧠 Feynman Technique Challenge
          </h3>
          <p className="text-text-secondary mb-4">
            Explain the concept from this question in simple terms, as if teaching a 12-year-old. 
            Avoid technical jargon and use analogies where helpful.
          </p>
          <textarea
            value={userExplanation}
            onChange={(e) => setUserExplanation(e.target.value)}
            className="w-full px-3 py-2 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary placeholder-text-tertiary"
            rows={4}
            placeholder="Your simple explanation..."
          />
          <div className="mt-4 flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setFeynmanMode(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submitFeynmanExplanation}>
              Submit Explanation
            </Button>
          </div>
        </Card>
      )}
    </div>
  );

  const renderReflectionPhase = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Icon icon={Star} size="lg" className="text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
          Session Complete! 🎉
        </h2>
        <p className="text-text-secondary">
          Time to reflect on your learning journey
        </p>
      </div>

      {/* Performance Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
          Your Neural Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-shimmer">
              {Math.round(learningState.comprehensionLevel)}%
            </div>
            <div className="text-sm text-text-tertiary">Comprehension</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-shimmer">
              {learningState.streakCount}
            </div>
            <div className="text-sm text-text-tertiary">Correct Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-shimmer">
              {formatTime(learningState.timeSpent)}
            </div>
            <div className="text-sm text-text-tertiary">Time Spent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-shimmer">
              {learningState.achievementsUnlocked.length}
            </div>
            <div className="text-sm text-text-tertiary">Achievements</div>
          </div>
        </div>
      </Card>

      {/* Reflection Questions */}
      <Card className="p-6">
        <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
          Meta-Learning Reflection
        </h3>
        <div className="space-y-4">
          {metaPrompts.filter(p => p.timing === 'reflection').map(prompt => (
            <div key={prompt.id}>
              <label className="block text-sm font-medium text-silver-base mb-2">
                {prompt.question}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-silver-dark/30 rounded-lg focus-silver bg-dark-surface text-text-primary placeholder-text-tertiary"
                rows={2}
                placeholder="Your reflection..."
                onChange={(e) => {
                  setMetaPrompts(prev => 
                    prev.map(p => p.id === prompt.id ? { ...p, response: e.target.value } : p)
                  );
                }}
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button variant="secondary" onClick={onHome}>
          <Icon icon={Home} size="sm" className="mr-2" />
          Return to Dashboard
        </Button>
        <Button variant="primary" onClick={async () => {
          // Save to spaced repetition system
          try {
            const { SpacedRepetitionService } = await import('../services/SpacedRepetitionService');
            const spacedRepetition = SpacedRepetitionService.getInstance();
            
            // Add questions from this session to spaced repetition
            const sessionQuestions = questions.map(q => ({
              id: `session_${Date.now()}_${q.id}`,
              question: q.question,
              answer: q.options[q.correct],
              explanation: q.explanation,
            }));
            
            spacedRepetition.addItemsFromSession({ questions: sessionQuestions });
          } catch (error) {
            console.error('Error saving to spaced repetition:', error);
          }
          
          onComplete();
        }}>
          <Icon icon={Trophy} size="sm" className="mr-2" />
          Complete Session
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-base">
      <div className="container mx-auto px-4 py-8">
        {/* Floating Reward Notification */}
        {showReward && (
          <div className="fixed top-4 right-4 z-50 animate-bounce">
            <div className="glass border border-silver-base/30 text-silver-light px-6 py-3 rounded-lg shadow-silver-lg">
              <div className="flex items-center">
                <Icon icon={Star} size="sm" className="mr-2 text-shimmer" />
                {showReward.content}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onHome}>
            <Icon icon={Home} size="sm" className="mr-2" />
            Dashboard
          </Button>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsPaused(!isPaused)}
              disabled={currentPhase !== 'learning'}
            >
              <Icon icon={isPaused ? Play : Pause} size="sm" className="mr-2" />
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          </div>
        </div>

        {/* Phase Content */}
        {currentPhase === 'planning' && renderPlanningPhase()}
        {currentPhase === 'learning' && renderLearningPhase()}
        {currentPhase === 'reflection' && renderReflectionPhase()}
      </div>
    </div>
  );
};

