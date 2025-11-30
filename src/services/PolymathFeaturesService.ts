/**
 * PolymathFeaturesService
 * Service for managing advanced Polymath OS features
 */

import {
  PolymathUser,
  Flashcard,
  MemoryPalace,
  MemoryPalaceItem,
  MindMap,
  Project,
  PortfolioItem,
  ReflectionEntry,
  DeepWorkBlock,
  SessionPlan,
  DomainType,
  RewardItem
} from '../types/polymath';
import { PolymathUserService } from './PolymathUserService';

export class PolymathFeaturesService {
  private static instance: PolymathFeaturesService;
  private userService: PolymathUserService;

  private lootTable: RewardItem[] = [
    { item: "☕ Coffee Break", probability: 0.3, value: 10 },
    { item: "📱 10min Social Media", probability: 0.25, value: 15 },
    { item: "📺 Episode Reward", probability: 0.2, value: 25 },
    { item: "📚 Book Purchase", probability: 0.15, value: 50 },
    { item: "🏖️ Day Off", probability: 0.1, value: 100 },
  ];

  private trizPrinciples: Record<number, string> = {
    1: "Segmentation", 2: "Taking Out", 3: "Local Quality", 4: "Asymmetry",
    5: "Merging", 6: "Universality", 7: "Nested Doll", 8: "Anti-Weight",
    9: "Preliminary Action", 10: "Prior Action", 11: "Beforehand Cushioning",
    12: "Equipotentiality", 13: "The Other Way Round", 14: "Spheroidality",
    15: "Dynamics", 16: "Partial or Excessive Action", 17: "Another Dimension",
    18: "Mechanical Vibration", 19: "Periodic Action", 20: "Continuity of Useful Action",
  };

  private constructor() {
    this.userService = PolymathUserService.getInstance();
  }

  public static getInstance(): PolymathFeaturesService {
    if (!PolymathFeaturesService.instance) {
      PolymathFeaturesService.instance = new PolymathFeaturesService();
    }
    return PolymathFeaturesService.instance;
  }

  /**
   * Image Streaming Session
   */
  public async startImageStreamingSession(durationMinutes: number = 10): Promise<string[]> {
    const user = await this.userService.getCurrentUser();
    if (!user) return ["Please register first!"];

    user.imageStreamSessions += 1;
    const xpGained = durationMinutes * 2;
    const { leveledUp, levelsGained } = await this.userService.gainXP(user, xpGained);
    await this.userService.updateStreak(user);
    user.totalStudyTime += durationMinutes;

    const messages = [`👁️ Image Streaming Session Completed (${durationMinutes} mins) (+${xpGained} XP)`];
    if (leveledUp) {
      messages.push(`📈 LEVEL UP! Gained ${levelsGained} level(s) - Now Level ${user.level}`);
    }

    const achievementMessages = this.userService.checkAchievements(user);
    messages.push(...achievementMessages);

    await this.userService.updateUser(user);
    return messages;
  }

  /**
   * Create Flashcard
   */
  public async createFlashcard(question: string, answer: string, domain: string): Promise<Flashcard> {
    const user = await this.userService.getCurrentUser();
    if (!user) throw new Error("Please register first!");

    const card: Flashcard = {
      id: this.generateId(),
      question,
      answer,
      domain,
      createdAt: new Date(),
      nextReview: new Date(),
      interval: 1,
      easeFactor: 2.5,
      reviewCount: 0,
      confidenceRatings: [],
    };

    user.flashcards.push(card);
    await this.userService.updateUser(user);
    return card;
  }

  /**
   * Review Flashcards
   */
  public async getDueFlashcards(limit: number = 5): Promise<Flashcard[]> {
    const user = await this.userService.getCurrentUser();
    if (!user) return [];

    const now = new Date();
    const dueCards = user.flashcards.filter(card => new Date(card.nextReview) <= now);
    return dueCards.slice(0, limit);
  }

  /**
   * Rate Flashcard Answer
   */
  public async rateFlashcard(cardId: string, confidence: number, correct: boolean): Promise<string[]> {
    const user = await this.userService.getCurrentUser();
    if (!user) return ["Please register first!"];

    const card = user.flashcards.find(c => c.id === cardId);
    if (!card) return ["Flashcard not found!"];

    card.confidenceRatings.push(confidence);
    card.reviewCount += 1;

    // SM-2 Algorithm
    if (correct) {
      if (card.reviewCount === 1) {
        card.interval = 1;
      } else if (card.reviewCount === 2) {
        card.interval = 6;
      } else {
        card.interval = Math.round(card.interval * card.easeFactor);
      }
      card.easeFactor = Math.max(1.3, card.easeFactor + 0.1);
    } else {
      card.interval = 1;
      card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
    }

    card.nextReview = new Date();
    card.nextReview.setDate(card.nextReview.getDate() + card.interval);

    const xpGained = 5 + (confidence * 2);
    const { leveledUp, levelsGained } = await this.userService.gainXP(user, xpGained);

    const messages = [
      `✅ Flashcard reviewed: ${correct ? 'Correct' : 'Incorrect'} (Confidence: ${confidence}/2) (+${xpGained} XP)`,
    ];
    if (leveledUp) {
      messages.push(`📈 LEVEL UP! Gained ${levelsGained} level(s) - Now Level ${user.level}`);
    }

    await this.userService.updateUser(user);
    return messages;
  }

  /**
   * Create Memory Palace
   */
  public async createMemoryPalace(name: string, items: Omit<MemoryPalaceItem, 'createdAt'>[]): Promise<string[]> {
    const user = await this.userService.getCurrentUser();
    if (!user) return ["Please register first!"];

    const palace: MemoryPalace = {
      name,
      items: items.map(item => ({
        ...item,
        createdAt: new Date(),
      })),
      createdDate: new Date(),
      domain: items[0]?.domain || "General",
    };

    user.memoryPalaces[name] = palace;

    const xpGained = items.length * 10;
    const { leveledUp, levelsGained } = await this.userService.gainXP(user, xpGained);
    await this.userService.updateStreak(user);

    const messages = [`🏰 Memory Palace '${name}' created with ${items.length} items (+${xpGained} XP)`];
    if (leveledUp) {
      messages.push(`📈 LEVEL UP! Gained ${levelsGained} level(s) - Now Level ${user.level}`);
    }

    const achievementMessages = this.userService.checkAchievements(user);
    messages.push(...achievementMessages);

    await this.userService.updateUser(user);
    return messages;
  }

  /**
   * Create Mind Map
   */
  public async createMindMap(topic: string, nodes: any[], domain: string): Promise<MindMap> {
    const user = await this.userService.getCurrentUser();
    if (!user) throw new Error("Please register first!");

    const mindMap: MindMap = {
      id: this.generateId(),
      topic,
      nodes: nodes.map((node, index) => ({
        id: node.id || `node_${index}`,
        label: node.label || node,
        children: node.children || [],
        color: node.color,
      })),
      createdAt: new Date(),
      domain,
    };

    user.mindMaps.push(mindMap);
    user.mindMapsCreated += 1;

    const xpGained = 20 + nodes.length * 3;
    await this.userService.gainXP(user, xpGained);
    await this.userService.updateStreak(user);
    this.userService.checkAchievements(user);

    await this.userService.updateUser(user);
    return mindMap;
  }

  /**
   * Deep Work Block
   */
  public async startDeepWorkBlock(
    domain: string,
    durationMinutes: number = 25,
    activityType: "active_recall" | "problem_solving" | "reading" | "writing" = "active_recall"
  ): Promise<string[]> {
    const user = await this.userService.getCurrentUser();
    if (!user) return ["Please register first!"];

    user.deepWorkBlocks += 1;
    user.totalStudyTime += durationMinutes;

    if (user.domains[domain]) {
      user.domains[domain].timeSpent += durationMinutes;
      user.domains[domain].sessionsCompleted += 1;
      user.domains[domain].lastAccessed = new Date();
    }

    const xpGained = durationMinutes * 3;
    const { leveledUp, levelsGained } = await this.userService.gainXP(user, xpGained);
    await this.userService.updateStreak(user);

    const activityNames = {
      active_recall: "Active Recall Practice",
      problem_solving: "Problem Solving Session",
      reading: "Focused Reading",
      writing: "Knowledge Synthesis Writing",
    };

    const messages = [
      `💪 ${activityNames[activityType]} Completed: ${domain} (${durationMinutes} mins)`,
      `(+${xpGained} XP)`,
    ];

    if (leveledUp) {
      messages.push(`📈 LEVEL UP! Gained ${levelsGained} level(s) - Now Level ${user.level}`);
    }

    const achievementMessages = this.userService.checkAchievements(user);
    messages.push(...achievementMessages);

    await this.userService.updateUser(user);
    return messages;
  }

  /**
   * Apply TRIZ Principle
   */
  public async applyTRIZPrinciple(principleNumber: number, problemDescription: string, domain: string): Promise<string[]> {
    const user = await this.userService.getCurrentUser();
    if (!user) return ["Please register first!"];

    if (!this.trizPrinciples[principleNumber]) {
      return [`Invalid TRIZ principle number. Available: ${Object.keys(this.trizPrinciples).join(', ')}`];
    }

    if (!user.trizApplications) user.trizApplications = 0;
    user.trizApplications += 1;

    const xpGained = 25;
    const { leveledUp, levelsGained } = await this.userService.gainXP(user, xpGained);
    await this.userService.updateStreak(user);

    const principleName = this.trizPrinciples[principleNumber];

    const messages = [
      `🔧 TRIZ Principle Applied: #${principleNumber} - ${principleName}`,
      `Domain: ${domain}`,
      `Problem: ${problemDescription}`,
      `Insight: Applying ${principleName} to ${problemDescription} in ${domain}`,
      `(+${xpGained} XP)`,
    ];

    if (leveledUp) {
      messages.push(`📈 LEVEL UP! Gained ${levelsGained} level(s) - Now Level ${user.level}`);
    }

    const achievementMessages = this.userService.checkAchievements(user);
    messages.push(...achievementMessages);

    await this.userService.updateUser(user);
    return messages;
  }

  /**
   * Create Cross-Domain Project
   */
  public async createCrossDomainProject(title: string, description: string, domains: string[]): Promise<string[]> {
    const user = await this.userService.getCurrentUser();
    if (!user) return ["Please register first!"];

    const project: Project = {
      id: this.generateId(),
      title,
      description,
      domains,
      createdAt: new Date(),
      status: "in_progress",
    };

    user.projects.push(project);
    user.crossDomainProjects += 1;

    const xpGained = 100 + domains.length * 50;
    const { leveledUp, levelsGained } = await this.userService.gainXP(user, xpGained);
    await this.userService.updateStreak(user);

    const messages = [
      `🌐 Cross-Domain Project Started:`,
      `Title: ${title}`,
      `Domains: ${domains.join(', ')}`,
      `Description: ${description.substring(0, 100)}...`,
      `(+${xpGained} XP)`,
    ];

    if (leveledUp) {
      messages.push(`📈 LEVEL UP! Gained ${levelsGained} level(s) - Now Level ${user.level}`);
    }

    const achievementMessages = this.userService.checkAchievements(user);
    messages.push(...achievementMessages);

    await this.userService.updateUser(user);
    return messages;
  }

  /**
   * Add to Portfolio
   */
  public async addToPortfolio(projectTitle: string, reflection: string, tags: string[]): Promise<string[]> {
    const user = await this.userService.getCurrentUser();
    if (!user) return ["Please register first!"];

    const portfolioItem: PortfolioItem = {
      id: this.generateId(),
      projectTitle,
      reflection,
      tags,
      addedAt: new Date(),
    };

    user.portfolio.push(portfolioItem);

    const xpGained = 75;
    const { leveledUp, levelsGained } = await this.userService.gainXP(user, xpGained);

    const messages = [
      `🖼️ Project Added to Portfolio:`,
      `Title: ${projectTitle}`,
      `Tags: ${tags.join(', ')}`,
      `(+${xpGained} XP)`,
    ];

    if (leveledUp) {
      messages.push(`📈 LEVEL UP! Gained ${levelsGained} level(s) - Now Level ${user.level}`);
    }

    const achievementMessages = this.userService.checkAchievements(user);
    messages.push(...achievementMessages);

    await this.userService.updateUser(user);
    return messages;
  }

  /**
   * Log Reflection
   */
  public async logReflection(prompt: string, response: string, mood: number = 5): Promise<string[]> {
    const user = await this.userService.getCurrentUser();
    if (!user) return ["Please register first!"];

    const entry: ReflectionEntry = {
      id: this.generateId(),
      prompt,
      response,
      mood,
      timestamp: new Date(),
    };

    user.reflectionJournal.push(entry);

    const xpGained = 15;
    const { leveledUp, levelsGained } = await this.userService.gainXP(user, xpGained);

    const messages = [`📖 Reflection Logged (+${xpGained} XP)`];
    if (leveledUp) {
      messages.push(`📈 LEVEL UP! Gained ${levelsGained} level(s) - Now Level ${user.level}`);
    }

    const achievementMessages = this.userService.checkAchievements(user);
    messages.push(...achievementMessages);

    await this.userService.updateUser(user);
    return messages;
  }

  /**
   * Roll Dice Reward - Variable Ratio Schedule
   * Based on Project 144 research: Variable ratio schedules are most potent
   * 
   * Schedule:
   * - 01-50: No Reward (frustration builds drive)
   * - 51-80: Small Reward
   * - 81-95: Medium Reward
   * - 96-100: Jackpot (High value reward)
   * 
   * This uncertainty generates higher tonic dopamine than fixed rewards
   */
  public async rollDiceReward(): Promise<string[]> {
    const user = await this.userService.getCurrentUser();
    if (!user) return ["Please register first!"];

    const roll = Math.floor(Math.random() * 100) + 1;
    let reward: RewardItem | null = null;
    let rewardType: 'none' | 'small' | 'medium' | 'jackpot' = 'none';
    let xpGained = 0;

    // Variable ratio schedule (most potent reinforcement)
    if (roll >= 1 && roll <= 50) {
      // No reward - this builds drive and maintains engagement
      return [
        `🎲 Dice Roll: ${roll} - No reward this time. Keep grinding!`,
        `💪 Resistance builds neural resilience. The next roll could be the jackpot!`,
        `(Variable ratio schedules maintain higher dopamine than fixed rewards)`,
      ];
    } else if (roll >= 51 && roll <= 80) {
      // Small reward
      rewardType = 'small';
      // Select from small rewards (coffee, social media)
      reward = this.lootTable.find(item =>
        item.item.includes('Coffee') || item.item.includes('Social Media')
      ) || this.lootTable[0];
      xpGained = 15;
    } else if (roll >= 81 && roll <= 95) {
      // Medium reward
      rewardType = 'medium';
      // Select from medium rewards (episode, book)
      reward = this.lootTable.find(item =>
        item.item.includes('Episode') || item.item.includes('Book')
      ) || this.lootTable[2];
      xpGained = 35;
    } else if (roll >= 96 && roll <= 100) {
      // Jackpot!
      rewardType = 'jackpot';
      reward = this.lootTable.find(item => item.item.includes('Day Off')) || this.lootTable[4];
      xpGained = 100;
    }

    if (!reward) {
      return [
        `🎲 Dice Roll: ${roll} - No reward this time. Keep grinding!`,
        `💪 Resistance builds neural resilience.`,
      ];
    }

    const { leveledUp, levelsGained } = await this.userService.gainXP(user, xpGained);

    const messages = [
      `🎲 Dice Roll: ${roll}`,
      rewardType === 'jackpot'
        ? `🎰 JACKPOT! REWARD UNLOCKED: ${reward.item} (+${xpGained} XP)`
        : rewardType === 'medium'
          ? `✨ MEDIUM REWARD: ${reward.item} (+${xpGained} XP)`
          : `👍 SMALL REWARD: ${reward.item} (+${xpGained} XP)`,
    ];

    if (leveledUp) {
      messages.push(`📈 LEVEL UP! Gained ${levelsGained} level(s) - Now Level ${user.level}`);
    }

    if (rewardType === 'jackpot') {
      messages.push(`🔥 The uncertainty of variable rewards keeps your dopamine system engaged!`);
    }

    await this.userService.updateUser(user);
    return messages;
  }

  /**
   * Get 3×3 Session Plan
   */
  public async get3x3SessionPlan(): Promise<SessionPlan | null> {
    const user = await this.userService.getCurrentUser();
    if (!user) return null;

    const primaryDomain = Object.values(user.domains).find(d => d.type === DomainType.PRIMARY);
    const secondaryDomains = Object.values(user.domains).filter(d => d.type === DomainType.SECONDARY);

    if (!primaryDomain || secondaryDomains.length < 2) {
      return null;
    }

    return {
      warmUp: {
        duration: 5,
        activity: "Memory Palace Review",
        domain: secondaryDomains[0].name,
      },
      segment1: {
        duration: 25,
        activity: "Deep Practice - Active Recall",
        domain: primaryDomain.name,
      },
      segment2: {
        duration: 15,
        activity: "Interleaved Review - Flashcards",
        domain: secondaryDomains[0].name,
      },
      segment3: {
        duration: 15,
        activity: "Creative Synthesis - Cross-Domain Thinking",
        domain: `${primaryDomain.name} + ${secondaryDomains[1].name}`,
      },
      coolDown: {
        duration: 5,
        activity: "Reflection & Planning",
        domain: "Meta-Learning",
      },
    };
  }

  /**
   * Get Analytics
   */
  public async getAnalytics() {
    const user = await this.userService.getCurrentUser();
    if (!user) return null;

    const totalReviews = user.flashcards.reduce((sum, card) => sum + card.confidenceRatings.length, 0);
    const correctReviews = user.flashcards.reduce(
      (sum, card) => sum + card.confidenceRatings.filter(r => r > 0).length,
      0
    );
    const retentionRate = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

    const domainDistribution: Record<string, number> = {};
    Object.values(user.domains).forEach(domain => {
      domainDistribution[domain.name] = domain.timeSpent;
    });

    const totalGoal = Object.values(user.weeklyGoals).reduce((sum, goal) => sum + goal, 0);
    const weeklyProgress = {
      actual: Math.min(totalGoal, user.totalStudyTime),
      goal: totalGoal,
      percentage: totalGoal > 0 ? Math.round((Math.min(totalGoal, user.totalStudyTime) / totalGoal) * 100) : 0,
    };

    return {
      retentionRate,
      totalStudyTime: user.totalStudyTime,
      streak: user.streak,
      level: user.level,
      xp: user.xp,
      domainDistribution,
      achievementsUnlocked: user.achievements.length,
      flashcardsCreated: user.flashcards.length,
      projectsCompleted: user.projects.filter(p => p.status === "completed").length,
      weeklyProgress,
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public getTRIZPrinciples(): Record<number, string> {
    return this.trizPrinciples;
  }
}

