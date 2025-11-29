/**
 * React hook for accessing AppStateService
 * Provides reactive access to user and settings state
 */

import { useState, useEffect } from 'react';
import AppStateService from '../services/AppStateService';
import { PolymathUser } from '../types/polymath';
import type { AppSettings, CustomModel } from '../services/AppStateService';

export function useUser(): PolymathUser | null {
  const [user, setUser] = useState<PolymathUser | null>(null);

  useEffect(() => {
    const appState = AppStateService.getInstance();
    
    // Load initial user
    setUser(appState.getUser());

    // Subscribe to changes
    const unsubscribe = appState.subscribeToUser((updatedUser) => {
      setUser(updatedUser);
    });

    return () => unsubscribe();
  }, []);

  return user;
}

export function useSettings(): AppSettings {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const appState = AppStateService.getInstance();
    return appState.getSettings();
  });

  useEffect(() => {
    const appState = AppStateService.getInstance();
    
    // Subscribe to changes
    const unsubscribe = appState.subscribeToSettings((updatedSettings) => {
      setSettings(updatedSettings);
    });

    return () => unsubscribe();
  }, []);

  return settings;
}

export function useCustomModels(provider?: string): CustomModel[] {
  const settings = useSettings();
  
  if (provider) {
    return settings.customModels.filter(m => m.provider === provider);
  }
  return settings.customModels;
}





