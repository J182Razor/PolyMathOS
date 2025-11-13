import React, { useState, useEffect } from 'react';
import { Brain, Clock, Target, CheckCircle, XCircle, ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';

interface LearningSessionProps {
  onComplete: () => void;
  onHome: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const LearningSession: React.FC<LearningSessionProps> = ({ onComplete, onHome }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  const questions: Question[] = [
    {
      id: 1,
      question: "What is the primary benefit of spaced repetition in learning?",
      options: [
        "It helps you learn faster",
        "It improves long-term retention",
        "It makes learning more fun",
        "It reduces study time"
      ],
      correctAnswer: 1,
      explanation: "Spaced repetition leverages the psychological spacing effect to improve long-term retention by reviewing information at increasing intervals."
    },
    {
      id: 2,
      question: "Which neurotransmitter is most associated with learning and memory formation?",
      options: [
        "Dopamine",
        "Serotonin",
        "Acetylcholine",
        "GABA"
      ],
      correctAnswer: 2,
      explanation: "Acetylcholine plays a crucial role in attention, learning, and memory formation by enhancing synaptic plasticity in the brain."
    },
    {
      id: 3,
      question: "What is the optimal study session length for maximum retention?",
      options: [
        "15-20 minutes",
        "25-30 minutes",
        "45-60 minutes",
        "90+ minutes"
      ],
      correctAnswer: 1,
      explanation: "Research shows that 25-30 minute focused study sessions (like the Pomodoro Technique) optimize attention and retention while preventing mental fatigue."
    },
    {
      id: 4,
      question: "Which learning technique involves connecting new information to existing knowledge?",
      options: [
        "Rote memorization",
        "Elaborative rehearsal",
        "Maintenance rehearsal",
        "Passive reading"
      ],
      correctAnswer: 1,
      explanation: "Elaborative rehearsal involves connecting new information to existing knowledge structures, creating stronger and more durable memory traces."
    },
    {
      id: 5,
      question: "What percentage of information is typically retained after 24 hours without review?",
      options: [
        "80%",
        "60%",
        "40%",
        "20%"
      ],
      correctAnswer: 3,
      explanation: "According to Ebbinghaus's forgetting curve, we typically retain only about 20% of newly learned information after 24 hours without review."
    }
  ];

  // Timer effect
  useEffect(() => {
    if (!sessionComplete) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [sessionComplete]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowResult(true);
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setSessionComplete(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (sessionComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center p-4">
        <Card className="p-8 max-w-2xl w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-silver-base/20 to-silver-dark/20 border border-silver-base/30 rounded-full flex items-center justify-center silver-glow">
            <Icon icon={CheckCircle} size="xl" className="text-silver-light" />
          </div>
          
          <h1 className="text-3xl font-display font-bold text-text-primary mb-4">
            Session Complete!
          </h1>
          
          <p className="text-text-secondary mb-8">
            Congratulations! You've completed your learning session.
          </p>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center glass p-6 rounded-xl border border-silver-dark/20">
              <div className="text-3xl font-bold text-shimmer mb-2">
                {percentage}%
              </div>
              <div className="text-sm text-text-tertiary">Score</div>
            </div>
            <div className="text-center glass p-6 rounded-xl border border-silver-dark/20">
              <div className="text-3xl font-bold text-shimmer mb-2">
                {score}/{questions.length}
              </div>
              <div className="text-sm text-text-tertiary">Correct</div>
            </div>
            <div className="text-center glass p-6 rounded-xl border border-silver-dark/20">
              <div className="text-3xl font-bold text-shimmer mb-2">
                {formatTime(timeElapsed)}
              </div>
              <div className="text-sm text-text-tertiary">Time</div>
            </div>
          </div>

          {/* Performance Feedback */}
          <div className="mb-8 p-4 glass rounded-lg border border-silver-dark/20">
            <h3 className="font-semibold text-silver-light mb-2">
              {percentage >= 80 ? 'Excellent Work!' : percentage >= 60 ? 'Good Progress!' : 'Keep Learning!'}
            </h3>
            <p className="text-text-secondary text-sm">
              {percentage >= 80 
                ? 'You have a strong understanding of the material. Ready for advanced topics!'
                : percentage >= 60 
                ? 'You\'re on the right track. Review the explanations and try again.'
                : 'Learning takes time. Review the material and practice more to improve.'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" onClick={onComplete}>
              <Icon icon={Brain} size="sm" className="mr-2" />
              Continue Learning
            </Button>
            <Button variant="outline" onClick={onHome}>
              <Icon icon={Home} size="sm" className="mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-dark-base">
      {/* Header */}
      <header className="glass-strong border-b border-silver-dark/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onHome}
                className="text-silver-medium hover:text-silver-light transition-colors"
              >
                <Icon icon={Home} size="sm" />
              </button>
              <h1 className="text-lg font-display font-semibold text-text-primary">
                Learning Session: Cognitive Science Basics
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-silver-base">
                <Icon icon={Clock} size="sm" className="mr-1" />
                {formatTime(timeElapsed)}
              </div>
              <div className="flex items-center text-silver-base">
                <Icon icon={Target} size="sm" className="mr-1" />
                {currentQuestion + 1}/{questions.length}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-tertiary">Progress</span>
            <span className="text-sm text-silver-base">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-dark-elevated rounded-full h-2 border border-silver-dark/20">
            <div 
              className="bg-shimmer h-2 rounded-full relative overflow-hidden transition-all duration-300"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-text-primary mb-4">
              Question {currentQuestion + 1}
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === index
                    ? showResult
                      ? index === currentQ.correctAnswer
                        ? 'border-green-500/50 bg-green-500/10 text-green-400'
                        : 'border-red-500/50 bg-red-500/10 text-red-400'
                      : 'border-silver-base/50 bg-silver-base/10 text-silver-light'
                    : showResult && index === currentQ.correctAnswer
                    ? 'border-green-500/50 bg-green-500/10 text-green-400'
                    : 'border-silver-dark/30 hover:border-silver-base/50 text-text-secondary hover:text-text-primary bg-dark-surface/50'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full border-2 border-current mr-3 flex items-center justify-center text-xs font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                  {showResult && (
                    <div className="ml-auto">
                      {index === currentQ.correctAnswer ? (
                        <Icon icon={CheckCircle} size="sm" className="text-green-400" />
                      ) : selectedAnswer === index ? (
                        <Icon icon={XCircle} size="sm" className="text-red-400" />
                      ) : null}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Explanation */}
          {showResult && (
            <div className="mb-6 p-4 glass rounded-lg border border-silver-dark/20">
              <h4 className="font-semibold text-silver-light mb-2">Explanation:</h4>
              <p className="text-text-secondary">{currentQ.explanation}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
            >
              <Icon icon={ArrowLeft} size="sm" className="mr-2" />
              Previous
            </Button>

            {!showResult ? (
              <Button
                variant="primary"
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
              >
                Submit Answer
              </Button>
            ) : (
              <Button variant="primary" onClick={handleNextQuestion}>
                {currentQuestion === questions.length - 1 ? 'Finish Session' : 'Next Question'}
                <Icon icon={ArrowRight} size="sm" className="ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

