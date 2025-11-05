import React, { useState } from 'react';
import { Brain, BookOpen, Target, TrendingUp, Users, Settings, LogOut } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';

interface DashboardProps {
  onStartLearning?: () => void;
  onStartAssessment?: () => void;
  onSignOut?: () => void;
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
  user 
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Learning Sessions', value: '47', icon: BookOpen, color: 'text-blue-600' },
    { label: 'Retention Rate', value: '94%', icon: Target, color: 'text-green-600' },
    { label: 'Knowledge Growth', value: '+285%', icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Study Streak', value: '12 days', icon: Brain, color: 'text-indigo-600' }
  ];

  const recentLessons = [
    { title: 'Advanced JavaScript Concepts', progress: 85, time: '2 hours ago' },
    { title: 'Machine Learning Fundamentals', progress: 60, time: '1 day ago' },
    { title: 'React Hooks Deep Dive', progress: 100, time: '2 days ago' },
    { title: 'Data Structures & Algorithms', progress: 45, time: '3 days ago' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Icon icon={Brain} size="sm" className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">NeuroAscend</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.firstName || 'Alex'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ready to continue your learning journey? You're making excellent progress!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}>
                  <Icon icon={stat.icon} size="lg" className={stat.color} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Lessons */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Recent Learning Sessions
              </h2>
              <div className="space-y-4">
                {recentLessons.map((lesson, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{lesson.time}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${lesson.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
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
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Icon icon={Brain} size="sm" className="mr-2" />
                  Take Cognitive Assessment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icon icon={Target} size="sm" className="mr-2" />
                  Set Learning Goals
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icon icon={Users} size="sm" className="mr-2" />
                  Join Study Group
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
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
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="75, 100"
                      className="text-indigo-600"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">75%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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

