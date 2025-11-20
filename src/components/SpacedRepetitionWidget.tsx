import React, { useState, useEffect } from 'react';
import { Clock, Target, TrendingUp, BookOpen } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { SpacedRepetitionService } from '../services/SpacedRepetitionService';

export const SpacedRepetitionWidget: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const service = SpacedRepetitionService.getInstance();
    const statistics = service.getStatistics();
    const reviewSession = service.getReviewSession(5);
    
    setStats(statistics);
    setSession(reviewSession);
  };

  if (!stats) {
    return (
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Icon icon={BookOpen} size="lg" className="text-silver-base mr-3" />
          <h3 className="text-lg font-display font-semibold text-text-primary">
            Spaced Repetition
          </h3>
        </div>
        <p className="text-text-secondary text-sm">
          Complete learning sessions to build your review queue
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Icon icon={BookOpen} size="lg" className="text-silver-base mr-3" />
          <h3 className="text-lg font-display font-semibold text-text-primary">
            Spaced Repetition
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={loadStats}>
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center glass p-4 rounded-lg border border-silver-dark/20">
          <div className="text-2xl font-bold text-shimmer mb-1">
            {stats.dueToday}
          </div>
          <div className="text-xs text-text-tertiary">Due Today</div>
        </div>
        <div className="text-center glass p-4 rounded-lg border border-silver-dark/20">
          <div className="text-2xl font-bold text-shimmer mb-1">
            {stats.masteredItems}
          </div>
          <div className="text-xs text-text-tertiary">Mastered</div>
        </div>
        <div className="text-center glass p-4 rounded-lg border border-silver-dark/20">
          <div className="text-2xl font-bold text-shimmer mb-1">
            {stats.retentionRate}%
          </div>
          <div className="text-xs text-text-tertiary">Retention</div>
        </div>
        <div className="text-center glass p-4 rounded-lg border border-silver-dark/20">
          <div className="text-2xl font-bold text-shimmer mb-1">
            {stats.totalItems}
          </div>
          <div className="text-xs text-text-tertiary">Total Items</div>
        </div>
      </div>

      {/* Review Session Info */}
      {session && session.items.length > 0 && (
        <div className="mb-4 p-4 glass rounded-lg border border-silver-base/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">
              Ready for Review
            </span>
            <span className="text-xs text-text-tertiary">
              {session.items.length} items
            </span>
          </div>
          <div className="flex items-center text-xs text-text-secondary">
            <Icon icon={Clock} size="xs" className="mr-1" />
            ~{session.estimatedTime} min
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-tertiary">Progress</span>
          <span className="text-xs text-silver-base">
            {stats.totalItems > 0 
              ? Math.round((stats.masteredItems / stats.totalItems) * 100)
              : 0}%
          </span>
        </div>
        <div className="w-full bg-dark-elevated rounded-full h-2 border border-silver-dark/20">
          <div 
            className="bg-shimmer h-2 rounded-full relative overflow-hidden transition-all duration-300"
            style={{ 
              width: `${stats.totalItems > 0 
                ? (stats.masteredItems / stats.totalItems) * 100 
                : 0}%` 
            }}
          >
            <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
          </div>
        </div>
      </div>

      {session && session.items.length > 0 ? (
        <Button variant="primary" className="w-full" onClick={() => {
          // Navigate to review session
          window.location.href = '#review';
        }}>
          <Icon icon={Target} size="sm" className="mr-2" />
          Start Review Session
        </Button>
      ) : (
        <p className="text-center text-sm text-text-tertiary">
          No items due for review. Keep learning!
        </p>
      )}
    </Card>
  );
};

