"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, BookOpen, Target, TrendingUp, Settings, LogOut,
  Plus, Zap, Search, Clock, Trophy, Flame, ChevronRight,
  BarChart3, Sparkles, Radio
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SpacedRepetitionWidget } from '../components/SpacedRepetitionWidget';
import { SettingsModal } from '../components/SettingsModal';
import { PolymathUserService } from '../services/PolymathUserService';
import { LearningPlanService } from '../services/LearningPlanService';
import AppStateService from '../services/AppStateService';
import { PolymathUser } from '../types/polymath';
import { cn } from '../lib/utils';

interface DashboardProps {
  onStartLearning?: () => void;
  onStartAssessment?: () => void;
  onSignOut?: () => void;
  onOpenBrainwaveGenerator?: () => void;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 hover:border-blue-500/30 transition-all duration-300" padding="none">
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {value}
            </p>
            {trend && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {trend}
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-blue-400">
            {icon}
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

// Quick Action Button
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full p-4 rounded-xl",
      "bg-slate-800/50 border border-slate-700",
      "hover:border-blue-500/50 hover:bg-slate-800",
      "transition-all duration-200 group text-left"
    )}
  >
    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors">
      {icon}
    </div>
    <span className="text-slate-300 font-medium group-hover:text-white transition-colors">
      {label}
    </span>
    <ChevronRight className="w-4 h-4 text-slate-500 ml-auto group-hover:text-blue-400 transition-colors" />
  </button>
);

export const Dashboard: React.FC<DashboardProps> = ({
  onStartLearning,
  onStartAssessment,
  onSignOut,
  onOpenBrainwaveGenerator,
  user
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [polymathUser, setPolymathUser] = useState<PolymathUser | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planTopic, setPlanTopic] = useState('');
  const [planMode, setPlanMode] = useState<'fast' | 'polymath'>('fast');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  useEffect(() => {
    const initUser = async () => {
      const appState = AppStateService.getInstance();
      const userService = PolymathUserService.getInstance();
      let currentUser = await userService.getCurrentUser();

      if (!currentUser && user) {
        currentUser = await userService.createUser(
          `${user.firstName} ${user.lastName}`,
          user.email
        );
        appState.updateUser(currentUser);
      }

      if (currentUser) {
        setPolymathUser(currentUser);
      }
    };

    initUser();

    // Subscribe to user changes (e.g., when name is updated in settings)
    const appState = AppStateService.getInstance();
    const unsubscribe = appState.subscribeToUser((updatedUser) => {
      if (updatedUser) {
        setPolymathUser(updatedUser);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreatePlan = async () => {
    if (!planTopic.trim() || !polymathUser) return;

    setIsGeneratingPlan(true);
    try {
      const planService = LearningPlanService.getInstance();
      await planService.createLearningPlan(planTopic, planMode, polymathUser);
      setIsPlanModalOpen(false);
      setPlanTopic('');
      if (onStartLearning) onStartLearning();
    } catch (error) {
      console.error('Error creating plan:', error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const stats = [
    { label: 'Learning Sessions', value: polymathUser?.deepWorkBlocks.toString() || '0', icon: <BookOpen className="w-5 h-5" />, trend: '+12% this week' },
    { label: 'Retention Rate', value: '94%', icon: <Target className="w-5 h-5" />, trend: '+3% improvement' },
    { label: 'XP Gained', value: polymathUser?.xp.toString() || '0', icon: <Sparkles className="w-5 h-5" /> },
    { label: 'Study Streak', value: `${polymathUser?.streak || 0} days`, icon: <Flame className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Learning Plan Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="w-full max-w-md bg-slate-950 border-slate-800" padding="none">
              <div className="p-6">
                <h2 className="text-2xl font-display font-bold text-white mb-4">Create Learning Plan</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Topic</label>
                    <input
                      type="text"
                      value={planTopic}
                      onChange={(e) => setPlanTopic(e.target.value)}
                      placeholder="e.g. Quantum Computing, French History..."
                      className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-slate-800 border border-slate-700",
                        "text-white placeholder-slate-500",
                        "focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
                        "outline-none transition-all"
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Mode</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPlanMode('fast')}
                        className={cn(
                          "p-4 rounded-xl border flex flex-col items-center justify-center transition-all",
                          planMode === 'fast'
                            ? "border-blue-500 bg-blue-500/10 text-blue-400"
                            : "border-slate-700 text-slate-400 hover:border-slate-600"
                        )}
                      >
                        <Zap className="w-6 h-6 mb-2" />
                        <span className="font-medium">Fast Mode</span>
                        <span className="text-xs opacity-70">Quick overview</span>
                      </button>
                      <button
                        onClick={() => setPlanMode('polymath')}
                        className={cn(
                          "p-4 rounded-xl border flex flex-col items-center justify-center transition-all",
                          planMode === 'polymath'
                            ? "border-purple-500 bg-purple-500/10 text-purple-400"
                            : "border-slate-700 text-slate-400 hover:border-slate-600"
                        )}
                      >
                        <Search className="w-6 h-6 mb-2" />
                        <span className="font-medium">Deep Mode</span>
                        <span className="text-xs opacity-70">In-depth research</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="ghost"
                      className="flex-1 text-slate-300"
                      onClick={() => setIsPlanModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      onClick={handleCreatePlan}
                      disabled={!planTopic.trim() || isGeneratingPlan}
                    >
                      {isGeneratingPlan ? 'Generating...' : 'Create Plan'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-lg font-display font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-none">
                PolyMathOS
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="text-slate-400 hover:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSignOut}
                className="text-slate-400 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {user?.firstName || polymathUser?.name.split(' ')[0] || 'Learner'}
            </span>
            !
          </h1>
          <p className="text-slate-400 text-lg">
            Ready to continue your learning journey? You're making excellent progress!
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} delay={index * 0.1} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Actions Card */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800" padding="none">
                <div className="p-6">
                  <h2 className="text-xl font-display font-semibold text-white mb-6">
                    Start Learning
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setIsPlanModalOpen(true)}
                      className={cn(
                        "relative p-6 rounded-2xl overflow-hidden group",
                        "bg-gradient-to-br from-blue-500/10 to-purple-500/10",
                        "border border-blue-500/20 hover:border-blue-500/40",
                        "transition-all duration-300"
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                          <Plus className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">New Learning Plan</h3>
                        <p className="text-sm text-slate-400">Create a personalized study plan</p>
                      </div>
                    </button>

                    <button
                      onClick={onStartAssessment}
                      className={cn(
                        "relative p-6 rounded-2xl overflow-hidden group",
                        "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
                        "border border-purple-500/20 hover:border-purple-500/40",
                        "transition-all duration-300"
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">Cognitive Assessment</h3>
                        <p className="text-sm text-slate-400">Discover your learning style</p>
                      </div>
                    </button>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-6 text-lg"
                    onClick={() => {
                      window.location.hash = '#polymath_dashboard';
                      window.dispatchEvent(new HashChangeEvent('hashchange'));
                    }}
                  >
                    <Brain className="w-5 h-5 mr-2" />
                    Open Polymath Dashboard
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Spaced Repetition Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <SpacedRepetitionWidget />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800" padding="none">
                <div className="p-6">
                  <h2 className="text-xl font-display font-semibold text-white mb-4">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <QuickAction
                      icon={<BookOpen className="w-5 h-5" />}
                      label="Resource Library"
                      onClick={() => {
                        window.location.hash = '#resource_library';
                        window.dispatchEvent(new HashChangeEvent('hashchange'));
                      }}
                    />
                    <QuickAction
                      icon={<Brain className="w-5 h-5" />}
                      label="AI Assistant"
                      onClick={() => {
                        window.location.hash = '#polymath_ai';
                        window.dispatchEvent(new HashChangeEvent('hashchange'));
                      }}
                    />
                    {onOpenBrainwaveGenerator && (
                      <QuickAction
                        icon={<Radio className="w-5 h-5" />}
                        label="Brainwave Generator"
                        onClick={onOpenBrainwaveGenerator}
                      />
                    )}
                    <QuickAction
                      icon={<BarChart3 className="w-5 h-5" />}
                      label="View Analytics"
                      onClick={() => {
                        window.location.hash = '#polymath_dashboard';
                        window.dispatchEvent(new HashChangeEvent('hashchange'));
                      }}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Today's Goal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800" padding="none">
                <div className="p-6">
                  <h2 className="text-xl font-display font-semibold text-white mb-4">
                    Today's Goal
                  </h2>
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-slate-800"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="2"
                          strokeDasharray="75, 100"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">75%</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">
                      3 of 4 sessions completed
                    </p>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      onClick={onStartLearning}
                    >
                      Complete Final Session
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Add padding for mobile bottom nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
};
