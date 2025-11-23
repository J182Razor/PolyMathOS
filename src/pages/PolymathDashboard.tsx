import React, { useState, useEffect } from 'react';
import { 
  Brain, BookOpen, Target, TrendingUp, Users, Settings, LogOut, 
  Trophy, Zap, Map, Layers, Lightbulb, Award, Calendar, Clock,
  BarChart3, Sparkles, Dice6, Castle, Network, FileText, Play
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { PolymathUserService } from '../services/PolymathUserService';
import { PolymathFeaturesService } from '../services/PolymathFeaturesService';
import { PolymathUser, DomainType } from '../types/polymath';
import { SettingsModal } from '../components/SettingsModal';

interface PolymathDashboardProps {
  onSignOut?: () => void;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export const PolymathDashboard: React.FC<PolymathDashboardProps> = ({ 
  onSignOut, 
  user 
}) => {
  const [polymathUser, setPolymathUser] = useState<PolymathUser | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [sessionPlan, setSessionPlan] = useState<any>(null);
  const [showReward, setShowReward] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const userService = PolymathUserService.getInstance();
  const featuresService = PolymathFeaturesService.getInstance();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    let currentUser = userService.getCurrentUser();
    
    // If no user exists, create one from the current user data
    if (!currentUser && user) {
      currentUser = userService.createUser(
        `${user.firstName} ${user.lastName}`,
        user.email
      );
    }

    if (currentUser) {
      setPolymathUser(currentUser);
      setAnalytics(featuresService.getAnalytics());
      setSessionPlan(featuresService.get3x3SessionPlan());
    }
  };

  const handleRollDice = () => {
    const messages = featuresService.rollDiceReward();
    setShowReward(messages);
    setTimeout(() => setShowReward([]), 5000);
    loadUserData(); // Refresh data
  };

  if (!polymathUser) {
    return (
      <div className="min-h-screen bg-poly-bg-primary flex items-center justify-center p-4">
        <Card className="p-6 sm:p-8 text-center bg-poly-bg-secondary border border-poly-border-primary">
          <Icon icon={Brain} size="xl" className="text-poly-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-poly-text-primary mb-4">
            Setting up your Polymath profile...
          </h2>
          <p className="text-poly-text-secondary">
            Please complete the onboarding to get started.
          </p>
        </Card>
      </div>
    );
  }

  const primaryDomain = Object.values(polymathUser.domains).find(d => d.type === DomainType.PRIMARY);
  const secondaryDomains = Object.values(polymathUser.domains).filter(d => d.type === DomainType.SECONDARY);

  return (
    <div className="min-h-screen bg-poly-bg-primary transition-colors duration-300">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {/* Header */}
      <header className="glass border-b border-poly-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8 rounded-lg bg-poly-bg-tertiary border border-poly-border-secondary flex items-center justify-center">
                <Icon icon={Brain} size="sm" className="text-poly-primary-600 dark:text-poly-primary-400" />
              </div>
              <span className="text-xl font-display font-bold text-poly-text-primary">PolyMathOS</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="sm" onClick={handleRollDice} className="hidden sm:flex">
                <Icon icon={Dice6} size="sm" className="mr-2" />
                Roll Reward
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)}>
                <Icon icon={Settings} size="sm" className="mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onSignOut}>
                <Icon icon={LogOut} size="sm" className="mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Reward Notification */}
      {showReward.length > 0 && (
        <div className="fixed top-20 right-4 z-50 animate-slide-up">
          <Card className="p-4 border border-poly-primary-500 shadow-poly-lg bg-poly-bg-primary">
            {showReward.map((msg, idx) => (
              <p key={idx} className="text-poly-primary-600 mb-1">{msg}</p>
            ))}
          </Card>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Stats */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-poly-text-primary mb-2">
                Welcome back, <span className="text-poly-primary-600 dark:text-poly-primary-400">{polymathUser.name}</span>!
              </h1>
              <p className="text-poly-text-secondary text-sm sm:text-base">
                Level {polymathUser.level} Polymath • {polymathUser.xp} XP • 🔥 {polymathUser.streak} day streak
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl font-bold text-poly-primary-600 dark:text-poly-primary-400 mb-1">
                {polymathUser.level}
              </div>
              <div className="text-sm text-poly-text-tertiary">Level</div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-poly-text-tertiary">XP Progress</span>
              <span className="text-sm text-poly-text-secondary">
                {polymathUser.xp % 100}/100 to Level {polymathUser.level + 1}
              </span>
            </div>
            <div className="w-full bg-poly-bg-tertiary rounded-full h-3 border border-poly-border-secondary">
              <div 
                className="bg-poly-primary-500 h-3 rounded-full relative overflow-hidden transition-all duration-300"
                style={{ width: `${(polymathUser.xp % 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card hover className="p-4 sm:p-6 bg-poly-bg-secondary border border-poly-border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-poly-text-tertiary mb-1">Total Study Time</p>
                <p className="text-xl sm:text-2xl font-bold text-poly-text-primary">
                  {Math.floor(polymathUser.totalStudyTime / 60)}h {polymathUser.totalStudyTime % 60}m
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-poly-bg-tertiary border border-poly-border-secondary flex items-center justify-center">
                <Icon icon={Clock} size="lg" className="text-poly-primary-500" />
              </div>
            </div>
          </Card>

          <Card hover className="p-4 sm:p-6 bg-poly-bg-secondary border border-poly-border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-poly-text-tertiary mb-1">Flashcards</p>
                <p className="text-xl sm:text-2xl font-bold text-poly-text-primary">{polymathUser.flashcards.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-poly-bg-tertiary border border-poly-border-secondary flex items-center justify-center">
                <Icon icon={BookOpen} size="lg" className="text-poly-primary-500" />
              </div>
            </div>
          </Card>

          <Card hover className="p-4 sm:p-6 bg-poly-bg-secondary border border-poly-border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-poly-text-tertiary mb-1">Achievements</p>
                <p className="text-xl sm:text-2xl font-bold text-poly-text-primary">{polymathUser.achievements.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-poly-bg-tertiary border border-poly-border-secondary flex items-center justify-center">
                <Icon icon={Trophy} size="lg" className="text-poly-accent-500" />
              </div>
            </div>
          </Card>

          <Card hover className="p-4 sm:p-6 bg-poly-bg-secondary border border-poly-border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-poly-text-tertiary mb-1">Projects</p>
                <p className="text-xl sm:text-2xl font-bold text-poly-text-primary">{polymathUser.projects.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-poly-bg-tertiary border border-poly-border-secondary flex items-center justify-center">
                <Icon icon={Network} size="lg" className="text-poly-secondary-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Domains & Session Plan */}
          <div className="lg:col-span-2 space-y-6">
            {/* Domains */}
            {Object.keys(polymathUser.domains).length > 0 && (
              <Card className="p-6 bg-poly-bg-secondary border border-poly-border-primary">
                <h2 className="text-xl font-display font-semibold text-poly-text-primary mb-4">
                  Your Domains
                </h2>
                <div className="space-y-4">
                  {Object.values(polymathUser.domains).map((domain, idx) => (
                    <div key={idx} className="glass p-4 rounded-lg border border-poly-border-secondary">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-poly-text-primary">
                            {domain.type === DomainType.PRIMARY ? '⭐' : '🔹'} {domain.name}
                          </span>
                          <span className="text-xs text-poly-text-tertiary">
                            ({domain.type})
                          </span>
                        </div>
                        <span className="text-sm font-bold text-poly-primary-600">{domain.proficiency}%</span>
                      </div>
                      <div className="w-full bg-poly-bg-tertiary rounded-full h-2 border border-poly-border-secondary">
                        <div 
                          className="bg-poly-primary-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${domain.proficiency}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-poly-text-tertiary">
                        <span>{domain.timeSpent} min</span>
                        <span>{domain.sessionsCompleted} sessions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 3×3 Session Plan */}
            {sessionPlan && (
              <Card className="p-6 bg-poly-bg-secondary border border-poly-border-primary">
                <h2 className="text-xl font-display font-semibold text-poly-text-primary mb-4">
                  Today's 3×3 Session Plan
                </h2>
                <div className="space-y-3">
                  {Object.entries(sessionPlan).map(([key, segment]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between glass p-3 rounded-lg border border-poly-border-secondary">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-poly-text-primary capitalize truncate">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm text-poly-text-secondary truncate">
                          {segment.activity} • {segment.domain}
                        </div>
                      </div>
                      <div className="text-poly-primary-600 font-bold ml-2 flex-shrink-0">{segment.duration}min</div>
                    </div>
                  ))}
                </div>
                <Button variant="primary" className="w-full mt-4">
                  <Icon icon={Play} size="sm" className="mr-2" />
                  Start Session
                </Button>
              </Card>
            )}

            {/* Recent Achievements */}
            {polymathUser.achievements.length > 0 && (
              <Card className="p-6 bg-poly-bg-secondary border border-poly-border-primary">
                <h2 className="text-xl font-display font-semibold text-poly-text-primary mb-4">
                  Recent Achievements
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {polymathUser.achievements.slice(-4).map((ach, idx) => (
                    <div key={idx} className="glass p-3 rounded-lg border border-poly-border-secondary text-center">
                      <div className="text-2xl mb-1">{ach.icon}</div>
                      <div className="text-sm font-medium text-poly-text-primary">{ach.name}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <Card className="p-6 bg-poly-bg-secondary border border-poly-border-primary">
              <h2 className="text-xl font-display font-semibold text-poly-text-primary mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-poly-border-primary hover:bg-poly-bg-tertiary text-poly-text-secondary"
                  onClick={() => {
                    window.location.hash = '#flashcards';
                    window.dispatchEvent(new Event('hashchange'));
                  }}
                >
                  <Icon icon={BookOpen} size="sm" className="mr-2" />
                  Review Flashcards
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-poly-border-primary hover:bg-poly-bg-tertiary text-poly-text-secondary"
                  onClick={() => {
                    window.location.hash = '#memory_palace';
                    window.dispatchEvent(new Event('hashchange'));
                  }}
                >
                  <Icon icon={Castle} size="sm" className="mr-2" />
                  Memory Palace
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-poly-border-primary hover:bg-poly-bg-tertiary text-poly-text-secondary"
                  onClick={() => {
                    window.location.hash = '#mind_map';
                    window.dispatchEvent(new Event('hashchange'));
                  }}
                >
                  <Icon icon={Map} size="sm" className="mr-2" />
                  Create Mind Map
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-poly-border-primary hover:bg-poly-bg-tertiary text-poly-text-secondary"
                  onClick={() => {
                    window.location.hash = '#deep_work';
                    window.dispatchEvent(new Event('hashchange'));
                  }}
                >
                  <Icon icon={Zap} size="sm" className="mr-2" />
                  Deep Work Block
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-poly-border-primary hover:bg-poly-bg-tertiary text-poly-text-secondary"
                  onClick={() => {
                    window.location.hash = '#projects';
                    window.dispatchEvent(new Event('hashchange'));
                  }}
                >
                  <Icon icon={Network} size="sm" className="mr-2" />
                  Cross-Domain Project
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-poly-border-primary hover:bg-poly-bg-tertiary text-poly-text-secondary"
                  onClick={() => {
                    window.location.hash = '#reflection';
                    window.dispatchEvent(new Event('hashchange'));
                  }}
                >
                  <Icon icon={FileText} size="sm" className="mr-2" />
                  Reflection Journal
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-poly-border-primary hover:bg-poly-bg-tertiary text-poly-text-secondary"
                  onClick={() => {
                    window.location.hash = '#triz';
                    window.dispatchEvent(new Event('hashchange'));
                  }}
                >
                  <Icon icon={Lightbulb} size="sm" className="mr-2" />
                  Apply TRIZ
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-poly-border-primary hover:bg-poly-bg-tertiary text-poly-text-secondary"
                  onClick={() => {
                    window.location.hash = '#domain_selection';
                    window.dispatchEvent(new Event('hashchange'));
                  }}
                >
                  <Icon icon={Target} size="sm" className="mr-2" />
                  Setup Domains
                </Button>
              </div>
            </Card>

            {/* Weekly Progress */}
            {analytics && (
              <Card className="p-6 bg-poly-bg-secondary border border-poly-border-primary">
                <h2 className="text-xl font-display font-semibold text-poly-text-primary mb-4">
                  Weekly Progress
                </h2>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-poly-text-tertiary">This Week</span>
                    <span className="text-sm text-poly-text-secondary">
                      {analytics.weeklyProgress.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-poly-bg-tertiary rounded-full h-3 border border-poly-border-secondary">
                    <div 
                      className="bg-poly-primary-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${analytics.weeklyProgress.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-poly-text-tertiary mt-1 text-center">
                    {analytics.weeklyProgress.actual} / {analytics.weeklyProgress.goal} minutes
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

