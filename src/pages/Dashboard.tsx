import React, { useState } from 'react';
import { Brain, BookOpen, Target, TrendingUp, Users, Settings, LogOut, Radio } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { SpacedRepetitionWidget } from '../components/SpacedRepetitionWidget';
import { SettingsModal } from '../components/SettingsModal';

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

export const Dashboard: React.FC<DashboardProps> = ({ 
  onStartLearning, 
  onStartAssessment,
  onSignOut,
  onOpenBrainwaveGenerator,
  user 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const stats = [
    { label: 'Learning Sessions', value: '47', icon: BookOpen },
    { label: 'Retention Rate', value: '94%', icon: Target },
    { label: 'Knowledge Growth', value: '+285%', icon: TrendingUp },
    { label: 'Study Streak', value: '12 days', icon: Brain }
  ];

  const recentLessons = [
    { title: 'Advanced JavaScript Concepts', progress: 85, time: '2 hours ago' },
    { title: 'Machine Learning Fundamentals', progress: 60, time: '1 day ago' },
    { title: 'React Hooks Deep Dive', progress: 100, time: '2 days ago' },
    { title: 'Data Structures & Algorithms', progress: 45, time: '3 days ago' }
  ];

  return (
    <div className="min-h-screen bg-poly-bg-primary transition-colors duration-300">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {/* Header */}
      <header className="glass border-b border-poly-border-primary">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20 py-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8 rounded-lg bg-poly-bg-tertiary border border-poly-border-secondary flex items-center justify-center">
                <Icon icon={Brain} size="sm" className="text-poly-primary-600 dark:text-poly-primary-400" />
              </div>
              <span className="text-xl font-display font-bold text-poly-text-primary">PolyMathOS</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)}>
                <Icon icon={Settings} size="sm" className="mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={onSignOut}>
                <Icon icon={LogOut} size="sm" className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-poly-primary-700 dark:text-poly-primary-400 mb-4">
            Welcome back, <span className="text-poly-accent-600 dark:text-poly-accent-400">{user?.firstName || 'Alex'}</span>!
          </h1>
          <p className="text-lg text-poly-text-secondary">
            Ready to continue your learning journey? You're making excellent progress!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} hover className="p-8 rounded-xl border border-poly-border-primary hover:border-poly-primary-400 transition-all duration-300 bg-poly-bg-secondary">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-poly-text-secondary">{stat.label}</p>
                  <p className="text-3xl font-bold bg-poly-gradient-primary bg-clip-text text-transparent">{stat.value}</p>
                </div>
                <div className="w-16 h-16 rounded-xl bg-poly-primary-50 dark:bg-poly-primary-900/30 border border-poly-primary-200 dark:border-poly-primary-800 flex items-center justify-center">
                  <Icon icon={stat.icon} size="lg" className="text-poly-primary-600 dark:text-poly-primary-400" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Lessons */}
          <div className="lg:col-span-2">
            <Card className="p-8 rounded-xl border border-poly-border-primary bg-poly-bg-secondary">
              <h2 className="text-2xl font-display font-semibold text-poly-text-primary mb-8">
                Recent Learning Sessions
              </h2>
              <div className="space-y-4">
                {recentLessons.map((lesson, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 glass rounded-lg border border-poly-border-primary hover:border-poly-primary-300 transition-all duration-300 gap-4 sm:gap-0">
                    <div className="flex-1">
                      <h3 className="font-medium text-poly-text-primary mb-1">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-poly-text-tertiary">{lesson.time}</p>
                    </div>
                    <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="w-24 bg-poly-bg-tertiary rounded-full h-2 border border-poly-border-secondary">
                        <div 
                          className="bg-poly-primary-500 h-2 rounded-full relative overflow-hidden"
                          style={{ width: `${lesson.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-poly-text-secondary w-12 text-right">
                        {lesson.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button variant="secondary" className="w-full mb-3" onClick={onStartLearning}>
                  <Icon icon={BookOpen} size="sm" className="mr-2" />
                  Start New Learning Session
                </Button>
                <Button variant="primary" className="w-full" onClick={onStartAssessment}>
                  <Icon icon={Brain} size="sm" className="mr-2" />
                  Take Advanced Cognitive Assessment
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full mt-3 border border-poly-border-primary hover:bg-poly-bg-tertiary text-poly-text-primary"
                  onClick={() => {
                    window.location.hash = '#polymath_dashboard';
                    window.dispatchEvent(new HashChangeEvent('hashchange'));
                  }}
                >
                  <Icon icon={Brain} size="sm" className="mr-2" />
                  🧠 Open Polymath OS Dashboard
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <SpacedRepetitionWidget />
            
            <Card className="p-8 rounded-xl border border-poly-border-primary bg-poly-bg-secondary">
              <h2 className="text-2xl font-display font-semibold text-poly-text-primary mb-6">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-poly-text-secondary border-poly-border-primary hover:bg-poly-bg-tertiary">
                  <Icon icon={Brain} size="sm" className="mr-2" />
                  Take Cognitive Assessment
                </Button>
                <Button variant="outline" className="w-full justify-start text-poly-text-secondary border-poly-border-primary hover:bg-poly-bg-tertiary">
                  <Icon icon={Target} size="sm" className="mr-2" />
                  Set Learning Goals
                </Button>
                <Button variant="outline" className="w-full justify-start text-poly-text-secondary border-poly-border-primary hover:bg-poly-bg-tertiary">
                  <Icon icon={Users} size="sm" className="mr-2" />
                  Join Study Group
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-poly-text-secondary border-poly-border-primary hover:bg-poly-bg-tertiary"
                  onClick={() => {
                    window.location.hash = '#resource_library';
                    window.dispatchEvent(new HashChangeEvent('hashchange'));
                  }}
                >
                  <Icon icon={BookOpen} size="sm" className="mr-2" />
                  Resource Library
                </Button>
                {onOpenBrainwaveGenerator && (
                  <Button variant="outline" className="w-full justify-start text-poly-text-secondary border-poly-border-primary hover:bg-poly-bg-tertiary" onClick={onOpenBrainwaveGenerator}>
                    <Icon icon={Radio} size="sm" className="mr-2" />
                    Brainwave Generator
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start text-poly-text-secondary border-poly-border-primary hover:bg-poly-bg-tertiary"
                  onClick={() => {
                    window.location.hash = '#polymath_ai';
                    window.dispatchEvent(new HashChangeEvent('hashchange'));
                  }}
                >
                  <Icon icon={Brain} size="sm" className="mr-2" />
                  Polymath AI Assistant
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-poly-bg-secondary border border-poly-border-primary">
              <h2 className="text-xl font-display font-semibold text-poly-text-primary mb-4">
                Today's Goal
              </h2>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-poly-neutral-200 dark:text-poly-neutral-700"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="75, 100"
                      className="text-poly-primary-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-poly-text-primary">75%</span>
                  </div>
                </div>
                <p className="text-sm text-poly-text-tertiary mb-4">
                  3 of 4 sessions completed
                </p>
                <Button variant="primary" size="sm" className="w-full">
                  Complete Final Session
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

