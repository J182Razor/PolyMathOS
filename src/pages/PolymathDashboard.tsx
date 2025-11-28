"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, BookOpen, Target, TrendingUp, Settings, LogOut,
  Trophy, Zap, Map, Layers, Lightbulb, Clock,
  BarChart3, Sparkles, Dice6, Castle, Network, FileText, Play,
  ChevronRight, Flame
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PolymathUserService } from '../services/PolymathUserService';
import { PolymathFeaturesService } from '../services/PolymathFeaturesService';
import AppStateService from '../services/AppStateService';
import { PolymathUser, DomainType } from '../types/polymath';
import { SettingsModal } from '../components/SettingsModal';
import { cn } from '../lib/utils';

interface PolymathDashboardProps {
  onSignOut?: () => void;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

// Quick Action Card
interface ActionCardProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, label, onClick }) => (
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
    <span className="text-slate-300 font-medium group-hover:text-white transition-colors flex-1">
      {label}
    </span>
    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
  </button>
);

export const PolymathDashboard: React.FC<PolymathDashboardProps> = ({
  onSignOut,
  user: propUser
}) => {
  const [user, setUser] = useState<PolymathUser | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [sessionPlan, setSessionPlan] = useState<any>(null);
  const [showReward, setShowReward] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const userService = PolymathUserService.getInstance();
  const featuresService = PolymathFeaturesService.getInstance();

  const loadUserData = useCallback(async () => {
    let currentUser = await userService.getCurrentUser();

    if (!currentUser && propUser) {
      currentUser = await userService.createUser(
        `${propUser.firstName} ${propUser.lastName}`,
        propUser.email
      );
      if (currentUser) {
        const appState = AppStateService.getInstance();
        appState.updateUser(currentUser);
      }
    }

    if (currentUser) {
      setUser(currentUser);
      setAnalytics(featuresService.getAnalytics());
      setSessionPlan(featuresService.get3x3SessionPlan());
    }
  }, [propUser, featuresService, userService]);

  useEffect(() => {
    loadUserData();

    // Subscribe to user changes (e.g., when name is updated in settings)
    const appState = AppStateService.getInstance();
    const unsubscribe = appState.subscribeToUser((updatedUser) => {
      if (updatedUser) {
        setUser(updatedUser);
        setAnalytics(featuresService.getAnalytics());
        setSessionPlan(featuresService.get3x3SessionPlan());
      }
    });

    return () => unsubscribe();
  }, []);



  const handleRollDice = () => {
    const messages = featuresService.rollDiceReward();
    setShowReward(messages);
    setTimeout(() => setShowReward([]), 5000);
    loadUserData();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="p-8 text-center bg-slate-900/80 border-slate-800">
          <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-white mb-4">
            Setting up your Polymath profile...
          </h2>
          <p className="text-slate-400">
            Please complete the onboarding to get started.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Reward Notification */}
      {showReward.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 z-50"
        >
          <Card className="p-4 bg-slate-950 border-blue-500/50 shadow-glow-blue">
            {showReward.map((msg, idx) => (
              <p key={idx} className="text-blue-400 font-medium">{msg}</p>
            ))}
          </Card>
        </motion.div>
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
                onClick={handleRollDice}
                className="hidden sm:flex text-slate-400 hover:text-white"
              >
                <Dice6 className="w-4 h-4 mr-2" />
                Roll Reward
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="text-slate-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSignOut}
                className="text-slate-400 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
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
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {user.name}
                </span>
                !
              </h1>
              <div className="flex items-center gap-4 text-slate-400">
                <span className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Level {user.level}
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  {user.xp} XP
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  {user.streak} day streak
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {user.level}
              </div>
              <div className="text-sm text-slate-500">Current Level</div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">XP Progress</span>
              <span className="text-slate-300">{user.xp % 100}/100 to Level {user.level + 1}</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${user.xp % 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Study Time', value: `${Math.floor(user.totalStudyTime / 60)}h ${user.totalStudyTime % 60}m`, icon: <Clock className="w-5 h-5" /> },
            { label: 'Flashcards', value: user.flashcards.length.toString(), icon: <BookOpen className="w-5 h-5" /> },
            { label: 'Achievements', value: user.achievements.length.toString(), icon: <Trophy className="w-5 h-5" /> },
            { label: 'Projects', value: user.projects.length.toString(), icon: <Network className="w-5 h-5" /> },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 hover:border-blue-500/30 transition-all" padding="none">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Plan */}
            {sessionPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800" padding="none">
                  <div className="p-6">
                    <h2 className="text-xl font-display font-semibold text-white mb-4">
                      Today's 3×3 Session Plan
                    </h2>
                    <div className="space-y-3">
                      {Object.entries(sessionPlan).map(([key, segment]: [string, any]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="text-sm text-slate-400 truncate">
                              {segment.activity} • {segment.domain}
                            </div>
                          </div>
                          <div className="text-blue-400 font-bold ml-4">{segment.duration}min</div>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <Play className="w-4 h-4 mr-2" />
                      Start Session
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Domains */}
            {Object.keys(user.domains).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800" padding="none">
                  <div className="p-6">
                    <h2 className="text-xl font-display font-semibold text-white mb-4">
                      Your Domains
                    </h2>
                    <div className="space-y-4">
                      {Object.values(user.domains).map((domain: any, idx) => (
                        <div key={idx} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">
                                {domain.type === DomainType.PRIMARY ? '⭐' : '🔹'} {domain.name}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-blue-400">{domain.proficiency}%</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                              style={{ width: `${domain.proficiency}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-slate-500">
                            <span>{domain.timeSpent} min studied</span>
                            <span>{domain.sessionsCompleted} sessions</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800" padding="none">
                <div className="p-6">
                  <h2 className="text-xl font-display font-semibold text-white mb-4">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <ActionCard
                      icon={<BookOpen className="w-5 h-5" />}
                      label="Review Flashcards"
                      onClick={() => {
                        window.location.hash = '#flashcards';
                        window.dispatchEvent(new Event('hashchange'));
                      }}
                    />
                    <ActionCard
                      icon={<Castle className="w-5 h-5" />}
                      label="Memory Palace"
                      onClick={() => {
                        window.location.hash = '#memory_palace';
                        window.dispatchEvent(new Event('hashchange'));
                      }}
                    />
                    <ActionCard
                      icon={<Map className="w-5 h-5" />}
                      label="Create Mind Map"
                      onClick={() => {
                        window.location.hash = '#mind_map';
                        window.dispatchEvent(new Event('hashchange'));
                      }}
                    />
                    <ActionCard
                      icon={<Zap className="w-5 h-5" />}
                      label="Deep Work Block"
                      onClick={() => {
                        window.location.hash = '#deep_work';
                        window.dispatchEvent(new Event('hashchange'));
                      }}
                    />
                    <ActionCard
                      icon={<Network className="w-5 h-5" />}
                      label="Cross-Domain Project"
                      onClick={() => {
                        window.location.hash = '#projects';
                        window.dispatchEvent(new Event('hashchange'));
                      }}
                    />
                    <ActionCard
                      icon={<FileText className="w-5 h-5" />}
                      label="Reflection Journal"
                      onClick={() => {
                        window.location.hash = '#reflection';
                        window.dispatchEvent(new Event('hashchange'));
                      }}
                    />
                    <ActionCard
                      icon={<Lightbulb className="w-5 h-5" />}
                      label="Apply TRIZ"
                      onClick={() => {
                        window.location.hash = '#triz';
                        window.dispatchEvent(new Event('hashchange'));
                      }}
                    />
                    <ActionCard
                      icon={<Target className="w-5 h-5" />}
                      label="Setup Domains"
                      onClick={() => {
                        window.location.hash = '#domain_selection';
                        window.dispatchEvent(new Event('hashchange'));
                      }}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Weekly Progress */}
            {analytics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800" padding="none">
                  <div className="p-6">
                    <h2 className="text-xl font-display font-semibold text-white mb-4">
                      Weekly Progress
                    </h2>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">This Week</span>
                      <span className="text-slate-300">{analytics.weeklyProgress.percentage}%</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${analytics.weeklyProgress.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                      {analytics.weeklyProgress.actual} / {analytics.weeklyProgress.goal} minutes
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile bottom padding */}
      <div className="h-20 md:hidden" />
    </div>
  );
};
