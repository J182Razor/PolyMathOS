/**
 * AppStateService
 * Centralized state management for application-wide settings and user data
 * Provides reactive updates across all components
 */

import { PolymathUserService } from './PolymathUserService';
import { PolymathUser } from '../types/polymath';

export interface CustomModel {
  id: string;
  provider: string;
  modelName: string;
  apiKey: string;
  baseUrl?: string;
}

export interface AppSettings {
  n8nUrl: string;
  envVars: {
    NVIDIA_API_KEY: string;
    GEMINI_API_KEY: string;
    GROQ_API_KEY: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    BACKEND_API_URL: string;
  };
  customModels: CustomModel[];
}

type SettingsChangeListener = (settings: AppSettings) => void;
type UserChangeListener = (user: PolymathUser | null) => void;

class AppStateService {
  private static instance: AppStateService;
  private settingsListeners: Set<SettingsChangeListener> = new Set();
  private userListeners: Set<UserChangeListener> = new Set();
  private currentSettings: AppSettings | null = null;
  private currentUser: PolymathUser | null = null;

  private constructor() {
    this.loadSettings();
    this.loadUser();
  }

  public static getInstance(): AppStateService {
    if (!AppStateService.instance) {
      AppStateService.instance = new AppStateService();
    }
    return AppStateService.instance;
  }

  // Settings Management
  public loadSettings(): AppSettings {
    const n8nUrl = localStorage.getItem('n8n_webhook_url') || '';
    
    const savedEnv = localStorage.getItem('polymathos_env');
    const envVars = savedEnv ? JSON.parse(savedEnv) : {
      NVIDIA_API_KEY: '',
      GEMINI_API_KEY: '',
      GROQ_API_KEY: '',
      SUPABASE_URL: '',
      SUPABASE_ANON_KEY: '',
      BACKEND_API_URL: 'http://localhost:8000',
    };

    const savedModels = localStorage.getItem('polymathos_custom_models');
    const customModels = savedModels ? JSON.parse(savedModels) : [];

    this.currentSettings = {
      n8nUrl,
      envVars,
      customModels,
    };

    return this.currentSettings;
  }

  public getSettings(): AppSettings {
    if (!this.currentSettings) {
      return this.loadSettings();
    }
    return this.currentSettings;
  }

  public updateSettings(settings: Partial<AppSettings>): void {
    const updated = {
      ...this.currentSettings!,
      ...settings,
    };

    // Save to localStorage
    if (updated.n8nUrl !== undefined) {
      localStorage.setItem('n8n_webhook_url', updated.n8nUrl);
    }
    if (updated.envVars) {
      localStorage.setItem('polymathos_env', JSON.stringify(updated.envVars));
    }
    if (updated.customModels) {
      localStorage.setItem('polymathos_custom_models', JSON.stringify(updated.customModels));
    }

    this.currentSettings = updated;
    this.notifySettingsListeners(updated);
  }

  public subscribeToSettings(listener: SettingsChangeListener): () => void {
    this.settingsListeners.add(listener);
    // Immediately notify with current settings
    listener(this.getSettings());
    
    // Return unsubscribe function
    return () => {
      this.settingsListeners.delete(listener);
    };
  }

  private notifySettingsListeners(settings: AppSettings): void {
    this.settingsListeners.forEach(listener => {
      try {
        listener(settings);
      } catch (error) {
        console.error('Error notifying settings listener:', error);
      }
    });
  }

  // User Management
  public loadUser(): PolymathUser | null {
    const userService = PolymathUserService.getInstance();
    this.currentUser = userService.getCurrentUser();
    this.notifyUserListeners(this.currentUser);
    return this.currentUser;
  }

  public getUser(): PolymathUser | null {
    if (!this.currentUser) {
      return this.loadUser();
    }
    return this.currentUser;
  }

  public updateUser(user: PolymathUser): void {
    const userService = PolymathUserService.getInstance();
    userService.updateUser(user);
    this.currentUser = user;
    this.notifyUserListeners(user);
  }

  public subscribeToUser(listener: UserChangeListener): () => void {
    this.userListeners.add(listener);
    // Immediately notify with current user
    listener(this.getUser());
    
    // Return unsubscribe function
    return () => {
      this.userListeners.delete(listener);
    };
  }

  private notifyUserListeners(user: PolymathUser | null): void {
    this.userListeners.forEach(listener => {
      try {
        listener(user);
      } catch (error) {
        console.error('Error notifying user listener:', error);
      }
    });
  }

  // Custom Models Helpers
  public getCustomModels(provider?: string): CustomModel[] {
    const settings = this.getSettings();
    if (provider) {
      return settings.customModels.filter(m => m.provider === provider);
    }
    return settings.customModels;
  }

  public addCustomModel(model: CustomModel): void {
    const settings = this.getSettings();
    const updated = {
      ...settings,
      customModels: [...settings.customModels, model],
    };
    this.updateSettings(updated);
  }

  public removeCustomModel(modelId: string): void {
    const settings = this.getSettings();
    const updated = {
      ...settings,
      customModels: settings.customModels.filter(m => m.id !== modelId),
    };
    this.updateSettings(updated);
  }

  public updateCustomModel(modelId: string, updates: Partial<CustomModel>): void {
    const settings = this.getSettings();
    const updated = {
      ...settings,
      customModels: settings.customModels.map(m =>
        m.id === modelId ? { ...m, ...updates } : m
      ),
    };
    this.updateSettings(updated);
  }
}

export default AppStateService;





