"use client";

import React, { useState, useEffect } from 'react';
import { Clock, Target, TrendingUp, BookOpen, RefreshCw } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { SpacedRepetitionService } from '../services/SpacedRepetitionService';
import { cn } from '../lib/utils';

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
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800" padding="none">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <BookOpen className="w-6 h-6 text-blue-400 mr-3" />
            <h3 className="text-lg font-display font-semibold text-white">
              Spaced Repetition
            </h3>
          </div>
          <p className="text-slate-400 text-sm">
            Complete learning sessions to build your review queue
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800" padding="none">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 text-blue-400 mr-3" />
            <h3 className="text-lg font-display font-semibold text-white">
              Spaced Repetition
            </h3>
          </div>
          <button 
            onClick={loadStats}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { value: stats.dueToday, label: 'Due Today' },
            { value: stats.masteredItems, label: 'Mastered' },
            { value: `${stats.retentionRate}%`, label: 'Retention' },
            { value: stats.totalItems, label: 'Total Items' },
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700"
            >
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Review Session Info */}
        {session && session.items.length > 0 && (
          <div className="mb-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                Ready for Review
              </span>
              <span className="text-xs text-blue-400">
                {session.items.length} items
              </span>
            </div>
            <div className="flex items-center text-xs text-slate-400">
              <Clock className="w-3 h-3 mr-1" />
              ~{session.estimatedTime} min
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Progress</span>
            <span className="text-xs text-blue-400">
              {stats.totalItems > 0 
                ? Math.round((stats.masteredItems / stats.totalItems) * 100)
                : 0}%
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ 
                width: `${stats.totalItems > 0 
                  ? (stats.masteredItems / stats.totalItems) * 100 
                  : 0}%` 
              }}
            />
          </div>
        </div>

        {session && session.items.length > 0 ? (
          <Button 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white" 
            onClick={() => {
              window.location.href = '#review';
            }}
          >
            <Target className="w-4 h-4 mr-2" />
            Start Review Session
          </Button>
        ) : (
          <p className="text-center text-sm text-slate-400">
            No items due for review. Keep learning!
          </p>
        )}
      </div>
    </Card>
  );
};
