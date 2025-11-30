import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, ArrowLeft, CheckCircle, XCircle, Star } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { PolymathFeaturesService } from '../services/PolymathFeaturesService';
import { Flashcard } from '../types/polymath';

interface FlashcardReviewProps {
  onComplete?: () => void;
  onBack?: () => void;
}

export const FlashcardReview: React.FC<FlashcardReviewProps> = ({ onComplete, onBack }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  const featuresService = PolymathFeaturesService.getInstance();

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    const dueCards = await featuresService.getDueFlashcards(10);
    setCards(dueCards);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleRate = async (isCorrect: boolean, conf: number) => {
    if (cards.length === 0) return;

    const card = cards[currentIndex];
    const result = await featuresService.rateFlashcard(card.id, conf, isCorrect);
    setMessages(result);

    setCorrect(isCorrect);
    setConfidence(conf);

    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
        setCorrect(null);
        setConfidence(null);
        setMessages([]);
      } else {
        if (onComplete) onComplete();
      }
    }, 2000);
  };

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <Icon icon={BookOpen} size="xl" className="text-silver-base mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-text-primary mb-4">
            No Flashcards Due
          </h2>
          <p className="text-text-secondary mb-6">
            Great job staying ahead! All your flashcards are up to date.
          </p>
          {onBack && (
            <Button variant="primary" onClick={onBack}>
              Back to Dashboard
            </Button>
          )}
        </Card>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-dark-base p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <Icon icon={ArrowLeft} size="sm" className="mr-2" />
              Back
            </Button>
          )}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-display font-bold text-text-primary">
              Flashcard Review
            </h1>
            <span className="text-silver-base">
              {currentIndex + 1} / {cards.length}
            </span>
          </div>
          <div className="w-full bg-dark-elevated rounded-full h-2 border border-silver-dark/20">
            <div
              className="bg-shimmer h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <Card className="p-4 mb-6 border-2 border-silver-base">
            {messages.map((msg, idx) => (
              <p key={idx} className="text-silver-light">{msg}</p>
            ))}
          </Card>
        )}

        {/* Flashcard */}
        <Card className="p-8 mb-6 min-h-[400px] flex flex-col">
          <div className="mb-4">
            <span className="text-xs text-text-tertiary uppercase tracking-wide">
              {currentCard.domain}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-text-primary mb-4">
                Question
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                {currentCard.question}
              </p>
            </div>

            {showAnswer && (
              <div className="mb-8 p-6 glass rounded-lg border border-silver-base/20">
                <h3 className="text-xl font-display font-semibold text-text-primary mb-4">
                  Answer
                </h3>
                <p className="text-lg text-text-secondary leading-relaxed">
                  {currentCard.answer}
                </p>
              </div>
            )}

            {!showAnswer ? (
              <Button variant="primary" size="lg" onClick={handleShowAnswer} className="mx-auto">
                Show Answer
                <Icon icon={ArrowRight} size="sm" className="ml-2" />
              </Button>
            ) : correct === null ? (
              <div className="space-y-4">
                <p className="text-center text-text-secondary mb-4">
                  How confident were you? (0 = Not at all, 2 = Very confident)
                </p>
                <div className="flex justify-center space-x-3">
                  {[0, 1, 2].map((conf) => (
                    <Button
                      key={conf}
                      variant="outline"
                      onClick={() => handleRate(true, conf)}
                      className="flex-1"
                    >
                      <Icon icon={Star} size="sm" className="mr-2" />
                      {conf}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleRate(false, 0)}
                  className="w-full"
                >
                  <Icon icon={XCircle} size="sm" className="mr-2" />
                  Incorrect
                </Button>
              </div>
            ) : (
              <div className="text-center">
                {correct ? (
                  <Icon icon={CheckCircle} size="xl" className="text-green-400 mx-auto mb-2" />
                ) : (
                  <Icon icon={XCircle} size="xl" className="text-red-400 mx-auto mb-2" />
                )}
                <p className="text-text-secondary">
                  {correct ? 'Correct!' : 'Incorrect - Review this again soon'}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            <Icon icon={ArrowLeft} size="sm" className="mr-2" />
            Previous
          </Button>
          <Button
            variant="ghost"
            onClick={() => setCurrentIndex(Math.min(cards.length - 1, currentIndex + 1))}
            disabled={currentIndex === cards.length - 1}
          >
            Next
            <Icon icon={ArrowRight} size="sm" className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

