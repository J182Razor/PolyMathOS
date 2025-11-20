/**
 * PolymathUserService
 * Core service for managing user data, XP, levels, achievements, and domains
 */

import { 
  PolymathUser, 
  Domain, 
  DomainType, 
  LearningStyle, 
  Achievement,
  WeeklyGoals 
} from '../types/polymath';

export class PolymathUserService {
  private static instance: PolymathUserService;
  private storageKey = 'polymathos_user_data';

  private constructor() {}

  public static getInstance(): PolymathUserService {
    if (!PolymathUserService.instance) {
      PolymathUserService.instance = new PolymathUserService();
    }
    return PolymathUserService.instance;
  }

  /**
   * Initialize or get current user
   */
  public getCurrentUser(): PolymathUser | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return null;
      
      const userData = JSON.parse(stored);
      // Convert date strings back to Date objects
      return this.deserializeUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  }

  /**
   * Create new user
   */
  public createUser(
    name: string,
    email: string,
    learningStyle: LearningStyle = LearningStyle.VISUAL,
    dailyCommitment: number = 60
  ): PolymathUser {
    const user: PolymathUser = {
      id: this.generateId(),
      name,
      email,
      level: 1,
      xp: 0,
      streak: 0,
      longestStreak: 0,
      achievements: [],
      domains: {},
      learningStyle,
      dailyCommitment,
      weeklyGoals: {
        monday: dailyCommitment,
        tuesday: dailyCommitment,
        wednesday: dailyCommitment,
        thursday: dailyCommitment,
        friday: dailyCommitment,
        saturday: Math.round(dailyCommitment * 1.5),
        sunday: Math.round(dailyCommitment * 0.5),
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

    this.saveUser(user);
    return user;
  }

  /**
   * Add domain to user
   */
  public addDomain(user: PolymathUser, name: string, domainType: DomainType): void {
    user.domains[name] = {
      name,
      type: domainType,
      proficiency: 0,
      timeSpent: 0,
      itemsMemorized: 0,
      sessionsCompleted: 0,
      lastAccessed: new Date(),
    };
    this.saveUser(user);
  }

  /**
   * Gain XP and check for level up
   */
  public gainXP(user: PolymathUser, amount: number): { leveledUp: boolean; levelsGained: number } {
    user.xp += amount;
    const newLevel = Math.floor(user.xp / 100) + 1;
    
    if (newLevel > user.level) {
      const levelsGained = newLevel - user.level;
      user.level = newLevel;
      user.longestStreak = Math.max(user.longestStreak, user.streak);
      this.saveUser(user);
      return { leveledUp: true, levelsGained };
    }
    
    this.saveUser(user);
    return { leveledUp: false, levelsGained: 0 };
  }

  /**
   * Update streak
   */
  public updateStreak(user: PolymathUser): void {
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
    this.saveUser(user);
  }

  /**
   * Add achievement
   */
  public addAchievement(user: PolymathUser, achievement: Achievement): string | null {
    const alreadyUnlocked = user.achievements.some(a => a.id === achievement.id);
    if (alreadyUnlocked) return null;

    achievement.unlockedAt = new Date();
    user.achievements.push(achievement);
    
    const { leveledUp, levelsGained } = this.gainXP(user, achievement.xpReward);
    
    let message = `${achievement.icon} Achievement Unlocked: ${achievement.name} (+${achievement.xpReward} XP)`;
    if (leveledUp) {
      message += `\n📈 LEVEL UP! Gained ${levelsGained} level(s) - Now Level ${user.level}`;
    }
    
    this.saveUser(user);
    return message;
  }

  /**
   * Initialize achievements catalog
   */
  public getAchievementsCatalog(): Achievement[] {
    return [
      {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first learning session',
        xpReward: 50,
        unlockCondition: 'deepWorkBlocks >= 1',
        icon: '👣',
      },
      {
        id: 'memory_palace_builder',
        name: 'Memory Palace Builder',
        description: 'Create your first memory palace with 5 items',
        xpReward: 100,
        unlockCondition: 'Object.keys(memoryPalaces).length >= 1',
        icon: '🏰',
      },
      {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Study for 7 consecutive days',
        xpReward: 150,
        unlockCondition: 'streak >= 7',
        icon: '🔥',
      },
      {
        id: 'cross_domain_explorer',
        name: 'Cross-Domain Explorer',
        description: 'Complete a project combining 2+ fields',
        xpReward: 200,
        unlockCondition: 'crossDomainProjects >= 1',
        icon: '🌐',
      },
      {
        id: 'knowledge_keeper',
        name: 'Knowledge Keeper',
        description: 'Memorize 50 items across domains',
        xpReward: 250,
        unlockCondition: 'totalItemsMemorized >= 50',
        icon: '🧠',
      },
      {
        id: 'deep_diver',
        name: 'Deep Diver',
        description: 'Spend 10 hours on your primary domain',
        xpReward: 300,
        unlockCondition: 'primaryDomainTime >= 600',
        icon: '🌊',
      },
      {
        id: 'mind_mapper',
        name: 'Mind Mapper',
        description: 'Create 5 mind maps',
        xpReward: 175,
        unlockCondition: 'mindMapsCreated >= 5',
        icon: '🗺️',
      },
      {
        id: 'triz_master',
        name: 'TRIZ Master',
        description: 'Apply 10 TRIZ principles',
        xpReward: 225,
        unlockCondition: 'trizApplications >= 10',
        icon: '🔧',
      },
      {
        id: 'reflection_pro',
        name: 'Reflection Pro',
        description: 'Write 20 journal entries',
        xpReward: 180,
        unlockCondition: 'reflectionJournal.length >= 20',
        icon: '📖',
      },
      {
        id: 'portfolio_pioneer',
        name: 'Portfolio Pioneer',
        description: 'Add 3 projects to portfolio',
        xpReward: 275,
        unlockCondition: 'portfolio.length >= 3',
        icon: '🖼️',
      },
    ];
  }

  /**
   * Check and unlock achievements
   */
  public checkAchievements(user: PolymathUser): string[] {
    const messages: string[] = [];
    const catalog = this.getAchievementsCatalog();
    
    for (const achievement of catalog) {
      if (user.achievements.some(a => a.id === achievement.id)) continue;
      
      let conditionMet = false;
      try {
        // Evaluate unlock condition
        const condition = achievement.unlockCondition
          .replace('deepWorkBlocks', String(user.deepWorkBlocks))
          .replace('Object.keys(memoryPalaces).length', String(Object.keys(user.memoryPalaces).length))
          .replace('streak', String(user.streak))
          .replace('crossDomainProjects', String(user.crossDomainProjects))
          .replace('mindMapsCreated', String(user.mindMapsCreated))
          .replace('trizApplications', String(user.trizApplications || 0))
          .replace('reflectionJournal.length', String(user.reflectionJournal.length))
          .replace('portfolio.length', String(user.portfolio.length));
        
        conditionMet = eval(condition);
      } catch (error) {
        console.error('Error evaluating achievement condition:', error);
      }
      
      if (conditionMet) {
        const message = this.addAchievement(user, achievement);
        if (message) messages.push(message);
      }
    }
    
    return messages;
  }

  /**
   * Save user to localStorage
   */
  private saveUser(user: PolymathUser): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  /**
   * Deserialize user from JSON
   */
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
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update user
   */
  public updateUser(user: PolymathUser): void {
    this.saveUser(user);
  }
}

