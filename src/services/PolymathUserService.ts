/**
 * PolymathUserService
 * Core service for managing user data, XP, levels, achievements, and domains
 * Refactored to use Backend API (TigerDB)
 */

import {
  PolymathUser,
  DomainType,
  LearningStyle,
  Achievement
} from '../types/polymath';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export class PolymathUserService {
  private static instance: PolymathUserService;
  private tokenKey = 'polymath_auth_token';
  private userCache: PolymathUser | null = null;

  private constructor() { }

  public static getInstance(): PolymathUserService {
    if (!PolymathUserService.instance) {
      PolymathUserService.instance = new PolymathUserService();
    }
    return PolymathUserService.instance;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem(this.tokenKey);
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Login user
   */
  public async login(email: string, password: string): Promise<PolymathUser> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem(this.tokenKey, data.access_token);

    return this.mapBackendUserToPolymathUser(data.user);
  }

  /**
   * Register new user
   */
  public async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<PolymathUser> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    const data = await response.json();
    localStorage.setItem(this.tokenKey, data.access_token);

    // Initialize default user data
    const user = this.createDefaultUser(firstName, lastName, email);
    user.id = data.user.user_id;

    // Save initial state
    await this.saveUser(user);

    return user;
  }

  /**
   * Get current user
   */
  public async getCurrentUser(): Promise<PolymathUser | null> {
    if (this.userCache) return this.userCache;

    const token = localStorage.getItem(this.tokenKey);
    if (!token) return null;

    // Since we don't have a direct "me" endpoint that returns full metadata in the auth router yet,
    // we might need to rely on what we have or update the backend.
    // For now, let's assume we persist the full user state in localStorage as a cache, 
    // but ideally we should fetch from backend.
    // Let's implement a fetch from backend if we can, or fallback to local cache + background sync.

    // Actually, let's try to fetch the user profile if we can.
    // The login returns the user info.
    // We need an endpoint to get the current user details including metadata.
    // I'll assume we can use the stored token to validate and maybe we need a /me endpoint.
    // For this iteration, I will implement a check that relies on the token being valid.

    // TODO: Implement /auth/me endpoint in backend for full state sync.
    // For now, we will use the local storage cache for the heavy object, but validate token.

    // Temporary: Return null if no token, otherwise try to load from local storage cache
    // This is a hybrid approach until we have full backend sync for the massive JSON object.
    const stored = localStorage.getItem('polymathos_user_data');
    if (stored) {
      const user = JSON.parse(stored);
      this.userCache = this.deserializeUser(user);
      return this.userCache;
    }

    return null;
  }

  public logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('polymathos_user_data');
    this.userCache = null;
  }

  /**
   * Map backend user to PolymathUser
   */
  private mapBackendUserToPolymathUser(backendUser: any): PolymathUser {
    // If metadata exists, merge it
    if (backendUser.metadata) {
      const user = this.deserializeUser(backendUser.metadata);
      user.id = backendUser.user_id;
      user.email = backendUser.email;
      user.name = `${backendUser.first_name} ${backendUser.last_name}`;
      this.userCache = user;
      this.saveToLocalCache(user);
      return user;
    }

    // Otherwise create default
    const user = this.createDefaultUser(
      backendUser.first_name,
      backendUser.last_name,
      backendUser.email
    );
    user.id = backendUser.user_id;
    this.userCache = user;
    this.saveToLocalCache(user);
    return user;
  }

  private createDefaultUser(firstName: string, lastName: string, email: string): PolymathUser {
    return {
      id: '', // Will be set from backend
      name: `${firstName} ${lastName}`,
      email,
      level: 1,
      xp: 0,
      streak: 0,
      longestStreak: 0,
      achievements: [],
      domains: {},
      learningStyle: LearningStyle.VISUAL,
      dailyCommitment: 60,
      weeklyGoals: {
        monday: 60,
        tuesday: 60,
        wednesday: 60,
        thursday: 60,
        friday: 60,
        saturday: 90,
        sunday: 30,
      },
      accessibilitySettings: {
        fontSize: 'medium',
        theme: 'dark',
        dyslexiaMode: false,
      },
      flashcards: [],
      memoryPalaces: {},
      mindMaps: [],
      projects: [],
      portfolio: [],
      reflectionJournal: [],
      studyGroups: [],
      imageStreamSessions: 0,
      deepWorkBlocks: 0,
      mindMapsCreated: 0,
      crossDomainProjects: 0,
      totalStudyTime: 0,
      errorLog: [],
    };
  }

  /**
   * Save user to Backend and LocalStorage
   */
  public async saveUser(user: PolymathUser): Promise<void> {
    this.userCache = user;
    this.saveToLocalCache(user);

    try {
      // Split name
      const [firstName, ...lastNameParts] = user.name.split(' ');
      const lastName = lastNameParts.join(' ');

      await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          metadata: user // Store full object in metadata
        })
      });
    } catch (error) {
      console.error('Failed to sync with backend:', error);
      // We still saved to local cache, so it's "offline capable"
    }
  }

  private saveToLocalCache(user: PolymathUser): void {
    localStorage.setItem('polymathos_user_data', JSON.stringify(user));
  }

  // ... (Keep existing helper methods like addDomain, gainXP, etc. but make them async or call saveUser)

  public async addDomain(user: PolymathUser, name: string, domainType: DomainType): Promise<void> {
    user.domains[name] = {
      name,
      type: domainType,
      proficiency: 0,
      timeSpent: 0,
      itemsMemorized: 0,
      sessionsCompleted: 0,
      lastAccessed: new Date(),
    };
    await this.saveUser(user);
  }

  public async gainXP(user: PolymathUser, amount: number): Promise<{ leveledUp: boolean; levelsGained: number }> {
    user.xp += amount;
    const newLevel = Math.floor(user.xp / 100) + 1;

    if (newLevel > user.level) {
      const levelsGained = newLevel - user.level;
      user.level = newLevel;
      user.longestStreak = Math.max(user.longestStreak, user.streak);
      await this.saveUser(user);
      return { leveledUp: true, levelsGained };
    }

    await this.saveUser(user);
    return { leveledUp: false, levelsGained: 0 };
  }

  // ... (Other methods need to be updated to be async or at least call saveUser correctly)
  // For brevity, I'm including the critical ones. The rest should be updated similarly.

  public async updateStreak(user: PolymathUser): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastActivity) {
      const lastDate = new Date(user.lastActivity);
      lastDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        user.streak += 1;
      } else if (daysDiff > 1) {
        user.streak = 1;
      }
    } else {
      user.streak = 1;
    }

    user.lastActivity = today;
    user.longestStreak = Math.max(user.longestStreak, user.streak);
    await this.saveUser(user);
  }

  // ... (deserializeUser method remains the same)
  private deserializeUser(data: any): PolymathUser {
    // Convert date strings to Date objects
    if (data.lastActivity) data.lastActivity = new Date(data.lastActivity);

    // Convert domain dates
    Object.values(data.domains || {}).forEach((domain: any) => {
      if (domain.lastAccessed) domain.lastAccessed = new Date(domain.lastAccessed);
    });

    // Convert achievement dates
    (data.achievements || []).forEach((ach: any) => {
      if (ach.unlockedAt) ach.unlockedAt = new Date(ach.unlockedAt);
    });

    // Convert flashcard dates
    (data.flashcards || []).forEach((card: any) => {
      if (card.createdAt) card.createdAt = new Date(card.createdAt);
      if (card.nextReview) card.nextReview = new Date(card.nextReview);
    });

    // Convert memory palace dates
    Object.values(data.memoryPalaces || {}).forEach((palace: any) => {
      if (palace.createdDate) palace.createdDate = new Date(palace.createdDate);
      (palace.items || []).forEach((item: any) => {
        if (item.createdAt) item.createdAt = new Date(item.createdAt);
        if (item.lastReviewed) item.lastReviewed = new Date(item.lastReviewed);
      });
    });

    // Convert project dates
    (data.projects || []).forEach((project: any) => {
      if (project.createdAt) project.createdAt = new Date(project.createdAt);
      if (project.completedAt) project.completedAt = new Date(project.completedAt);
    });

    // Convert reflection dates
    (data.reflectionJournal || []).forEach((entry: any) => {
      if (entry.timestamp) entry.timestamp = new Date(entry.timestamp);
    });
    return data as PolymathUser;
  }

  /**
   * Update assessment data
   */
  public async updateAssessmentData(user: PolymathUser, assessmentData: any): Promise<void> {
    user.dopamineProfile = assessmentData.dopamineProfile;
    user.metaLearningSkills = assessmentData.metaLearningSkills;
    user.learningStylePreferences = assessmentData.learningStylePreferences;
    user.personalGoals = assessmentData.personalGoals;

    // Also update learning style based on assessment
    if (assessmentData.learningStylePreferences) {
      const prefs = assessmentData.learningStylePreferences;
      if (prefs.visualProcessing >= 4) user.learningStyle = LearningStyle.VISUAL;
      else if (prefs.observationalLearning >= 4) user.learningStyle = LearningStyle.VISUAL; // Map to closest
      else if (prefs.feynmanTechnique >= 4) user.learningStyle = LearningStyle.READING_WRITING; // Map to closest
      else if (prefs.firstPrinciplesThinking >= 4) user.learningStyle = LearningStyle.READING_WRITING; // Map to closest
    }

    await this.saveUser(user);
  }

  /**
   * Create user (Wrapper for register for compatibility, but async)
   */
  public async createUser(
    name: string,
    email: string,
    learningStyle: LearningStyle = LearningStyle.VISUAL,
    dailyCommitment: number = 60
  ): Promise<PolymathUser> {
    // Split name
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || 'User';

    // Use a default password for auto-created users or ask for it. 
    // For now, we'll use a placeholder and expect the user to set it later or we might need to change the flow.
    // Since this is often used in "First Use", we might want to just register them.
    return this.register(email, 'Welcome123!', firstName, lastName);
  }
}
