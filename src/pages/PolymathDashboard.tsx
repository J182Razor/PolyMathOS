"use client";

import React, { useState, useEffect } from 'react';
import { PolymathUserService } from '../services/PolymathUserService';
import AppStateService from '../services/AppStateService';
import { PolymathUser } from '../types/polymath';

interface PolymathDashboardProps {
  onSignOut?: () => void;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

const features = [
  { icon: 'castle', title: 'Memory Palace', subtitle: 'Builder' },
  { icon: 'share', title: 'Mind Map', subtitle: 'Creator' },
  { icon: 'style', title: 'Flashcards', subtitle: 'Review System' },
  { icon: 'hourglass_top', title: 'Deep Work', subtitle: 'Timer' },
  { icon: 'auto_stories', title: 'Journal', subtitle: 'Reflection' },
  { icon: 'psychology', title: 'TRIZ Solving', subtitle: 'Problem' },
  { icon: 'hub', title: 'Projects', subtitle: 'Cross-Domain' },
  { icon: 'waves', title: 'Brainwave', subtitle: 'Generator' },
];

export const PolymathDashboard: React.FC<PolymathDashboardProps> = ({
  onSignOut,
  user: propUser
}) => {
  const [user, setUser] = useState<PolymathUser | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const initUser = async () => {
      const userService = PolymathUserService.getInstance();
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
      }
    };

    initUser();

    const appState = AppStateService.getInstance();
    const unsubscribe = appState.subscribeToUser((updatedUser) => {
      if (updatedUser) {
        setUser(updatedUser);
      }
    });

    return () => unsubscribe();
  }, [propUser]);

  const userName = propUser?.firstName || user?.name.split(' ')[0] || 'Alex';
  const streak = user?.streak || 7;

  return (
    <div className="relative mx-auto flex h-auto min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display">
      {/* Top App Bar */}
      <header className="flex shrink-0 items-center justify-between p-4 pb-2 bg-background-light dark:bg-background-dark">
        <div className="flex size-10 shrink-0 items-center justify-center text-primary dark:text-primary">
          <span className="material-symbols-outlined text-3xl">neurology</span>
        </div>
        <h1 className="text-xl font-bold leading-tight tracking-[-0.015em] text-zinc-900 dark:text-white flex-1 text-center">
          PolyMath
        </h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white"
        >
          <span className="material-symbols-outlined">person</span>
        </button>
      </header>

      <main className="flex-1 px-4 pt-4 pb-20">
        {/* Headline Text */}
        <h2 className="text-zinc-900 dark:text-white tracking-light text-[28px] font-bold leading-tight text-left pb-1 pt-4">
          Welcome back, {userName}
        </h2>

        {/* Body Text */}
        <p className="text-zinc-600 dark:text-zinc-400 text-base font-normal leading-normal pb-6">
          Daily Learning Streak: {streak} Days
        </p>

        {/* Text Grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
          {features.map((feature, index) => (
            <button
              key={index}
              className="flex flex-1 cursor-pointer flex-col gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-all hover:border-primary/50 dark:hover:border-primary/50"
            >
              <div className="text-primary">
                <span className="material-symbols-outlined text-2xl">{feature.icon}</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-zinc-900 dark:text-white text-base font-bold leading-tight">{feature.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-normal leading-normal">{feature.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <footer className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md">
        <div className="flex gap-2 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm px-4 pb-3 pt-2">
          <a className="flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-primary active-nav" href="#">
            <div className="flex h-8 items-center justify-center">
              <span className="material-symbols-outlined">home</span>
            </div>
            <p className="text-xs font-medium leading-normal tracking-[0.015em]">Home</p>
          </a>
          <a className="flex flex-1 flex-col items-center justify-end gap-1 text-zinc-500 dark:text-zinc-400" href="#">
            <div className="flex h-8 items-center justify-center">
              <span className="material-symbols-outlined">bar_chart</span>
            </div>
            <p className="text-xs font-medium leading-normal tracking-[0.015em]">Progress</p>
          </a>
          <a className="flex flex-1 flex-col items-center justify-end gap-1 text-zinc-500 dark:text-zinc-400" href="#">
            <div className="flex h-8 items-center justify-center">
              <span className="material-symbols-outlined">search</span>
            </div>
            <p className="text-xs font-medium leading-normal tracking-[0.015em]">Search</p>
          </a>
          <a className="flex flex-1 flex-col items-center justify-end gap-1 text-zinc-500 dark:text-zinc-400" href="#">
            <div className="flex h-8 items-center justify-center">
              <span className="material-symbols-outlined">settings</span>
            </div>
            <p className="text-xs font-medium leading-normal tracking-[0.015em]">Settings</p>
          </a>
        </div>
      </footer>
    </div>
  );
};
