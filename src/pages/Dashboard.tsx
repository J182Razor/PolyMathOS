"use client";

import React, { useState, useEffect } from 'react';
import { SettingsModal } from '../components/SettingsModal';
import { PolymathUserService } from '../services/PolymathUserService';
import AppStateService from '../services/AppStateService';
import { PolymathUser } from '../types/polymath';

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [polymathUser, setPolymathUser] = useState<PolymathUser | null>(null);

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

    const appState = AppStateService.getInstance();
    const unsubscribe = appState.subscribeToUser((updatedUser) => {
      if (updatedUser) {
        setPolymathUser(updatedUser);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const userName = user?.firstName || polymathUser?.name.split(' ')[0] || 'Alex';
  const progress = 60; // 3/5 modules
  const circumference = 2 * Math.PI * 64; // radius = 64
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-display">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Top App Bar */}
      <div className="flex items-center p-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" 
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBVP15ViVmGsvokFsYbMNcQ9A53ys_qTWLlCxuplPixwcehhAcw-u3lzwCW_MxcbdB8rvVDbjey4XvbVXE7BqVdMhkVpUfdUFfR-f2FSh8oZQYrkp26Utiq5a9xd3Jq41Q2H--2mLrfXW1o9hNzu0XHza-RgQNnAIbXdWcJoCKf0nctKJv8F8oioBbjk0ee196hgSiN6NqGlw8tx-fygoKdcoWi0YpGwQ70N9eGr_9aBye2kMYGiwsGG3bqILt6amF3Oe1T0uEZgxVz")' }}
          />
          <h2 className="text-text-light text-lg font-bold leading-tight tracking-[-0.015em]">{userName}</h2>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center justify-center rounded-full h-10 w-10 bg-transparent text-text-secondary hover:text-text-light"
          >
            <span className="material-symbols-outlined text-2xl">search</span>
          </button>
          <button className="flex items-center justify-center rounded-full h-10 w-10 bg-transparent text-text-secondary hover:text-text-light">
            <span className="material-symbols-outlined text-2xl">notifications</span>
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center justify-center rounded-full h-10 w-10 bg-transparent text-text-secondary hover:text-text-light"
          >
            <span className="material-symbols-outlined text-2xl">settings</span>
          </button>
        </div>
      </div>

      {/* Headline Text */}
      <h1 className="text-text-light tracking-tight text-[32px] font-bold leading-tight px-4 pt-4">
        Good Morning, {userName}
      </h1>

      {/* Body Text */}
      <p className="text-text-secondary text-base font-normal leading-normal pb-6 px-4">
        Today's insight: Consistent short sessions build stronger neural pathways than infrequent long ones.
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 px-4">
        <div className="flex flex-col gap-2 rounded-xl p-4 bg-primary/10 border border-primary/20">
          <p className="text-text-secondary text-sm font-medium leading-normal">Total Sessions</p>
          <p className="text-text-light tracking-light text-3xl font-bold leading-tight">142</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-4 bg-primary/10 border border-primary/20">
          <p className="text-text-secondary text-sm font-medium leading-normal">Retention Rate</p>
          <p className="text-text-light tracking-light text-3xl font-bold leading-tight">89%</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-4 bg-primary/10 border border-primary/20">
          <p className="text-text-secondary text-sm font-medium leading-normal">Knowledge Growth</p>
          <div className="flex items-center gap-2">
            <p className="text-text-light tracking-light text-3xl font-bold leading-tight">12%</p>
            <span className="material-symbols-outlined text-green-400 text-xl">trending_up</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-4 bg-primary/10 border border-primary/20">
          <p className="text-text-secondary text-sm font-medium leading-normal">Learning Streak</p>
          <div className="flex items-center gap-2">
            <p className="text-text-light tracking-light text-3xl font-bold leading-tight">28</p>
            <span className="material-symbols-outlined text-orange-400 text-xl">local_fire_department</span>
          </div>
        </div>
      </div>

      {/* Today's Goal Widget */}
      <div className="px-4 pt-8 pb-4">
        <div className="flex flex-col items-center justify-center rounded-xl p-6 bg-background-dark border border-white/10 relative">
          <div className="relative size-48">
            <svg className="size-full" height="36" viewBox="0 0 36 36" width="36" xmlns="http://www.w3.org/2000/svg">
              <circle className="stroke-primary/20" cx="18" cy="18" fill="none" r="16" strokeWidth="3" />
              <circle 
                className="stroke-primary" 
                cx="18" 
                cy="18" 
                fill="none" 
                r="16" 
                strokeDasharray={`${circumference}`}
                strokeDashoffset={offset}
                strokeLinecap="round" 
                strokeWidth="3" 
                transform="rotate(-90 18 18)" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-text-light text-4xl font-bold">3/5</span>
              <span className="text-text-secondary text-sm font-medium">Modules</span>
            </div>
          </div>
          <h3 className="text-text-light text-lg font-bold leading-tight tracking-[-0.015em] pt-4">Today's Goal</h3>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-3 gap-4 px-4 pb-6">
        <button 
          onClick={onStartLearning}
          className="flex flex-col items-center justify-center gap-2 rounded-xl p-4 bg-primary/10 text-text-light border border-primary/20"
        >
          <span className="material-symbols-outlined text-primary text-3xl">add_circle</span>
          <span className="font-semibold text-sm">New Session</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-2 rounded-xl p-4 bg-primary/10 text-text-light border border-primary/20">
          <span className="material-symbols-outlined text-primary text-3xl">style</span>
          <span className="font-semibold text-sm">Review</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-2 rounded-xl p-4 bg-primary/10 text-text-light border border-primary/20">
          <span className="material-symbols-outlined text-primary text-3xl">explore</span>
          <span className="font-semibold text-sm">Explore</span>
        </button>
      </div>

      {/* Spaced Repetition Widget */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between rounded-xl p-5 bg-accent text-white">
          <div className="flex flex-col">
            <span className="text-lg font-bold">Spaced Repetition</span>
            <span className="text-sm opacity-80">15 Items Ready for Review</span>
          </div>
          <button className="flex items-center justify-center rounded-full h-12 w-12 bg-white/20">
            <span className="material-symbols-outlined text-2xl">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Section Header */}
      <h3 className="text-text-light text-xl font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-2">
        Recent Sessions
      </h3>

      {/* Recent Sessions List */}
      <div className="flex flex-col gap-3 px-4 pb-8">
        <div className="flex items-center gap-4 rounded-xl p-4 bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-center size-12 rounded-lg bg-primary/20">
            <span className="material-symbols-outlined text-primary text-3xl">layers</span>
          </div>
          <div className="flex-1">
            <p className="text-text-light font-semibold">Quantum Entanglement</p>
            <p className="text-text-secondary text-sm">Basics of quantum mechanics</p>
            <div className="w-full bg-primary/20 rounded-full h-1.5 mt-2">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl p-4 bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-center size-12 rounded-lg bg-primary/20">
            <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
          </div>
          <div className="flex-1">
            <p className="text-text-light font-semibold">AI Ethics Simulation</p>
            <p className="text-text-secondary text-sm">Complex decision-making</p>
            <div className="w-full bg-primary/20 rounded-full h-1.5 mt-2">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
