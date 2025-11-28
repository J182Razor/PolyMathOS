/**
 * Reinforcement Learning Service for Learning Method Optimization
 * 
 * Tracks user success and reinforces effective learning methods.
 * Successful methods are saved to user profiles and used to optimize future learning paths.
 * 
 * Based on Q-learning principles:
 * - State: User profile + learning context
 * - Action: Learning method (quiz, feynman, memory palace, etc.)
 * - Reward: User success metrics (comprehension, retention, engagement)
 * - Policy: Select methods that maximize expected reward
 */

import { GeniusProfessorService } from './GeniusProfessorService';
import { ComprehensionTrackerService, ComprehensionDimension } from './ComprehensionTrackerService';
import { FSRSService } from './FSRSService';
import { DynamicQuizService } from './DynamicQuizService';

export type LearningMethod =
  | 'quiz'
  | 'feynman'
  | 'memory_palace'
  | 'zettelkasten'
  | 'spaced_repetition'
  | 'dual_n_back'
  | 'speed_reading'
  | 'interleaving'
  | 'elaboration'
  | 'teaching';

export type LearningContext = {
  topic: string;
  userArchetype: string;
  timeOfDay: string;
  energyLevel: number; // 1-10
  previousSuccess: boolean;
  topicDifficulty: number; // 1-10
};

export interface MethodPerformance {
  method: LearningMethod;
  successCount: number;
  totalAttempts: number;
  averageScore: number;
  averageTimeMinutes: number;
  lastUsed: Date;
  effectiveness: number; // 0-1, calculated from success metrics
  contexts: Record<string, number>; // Context -> success rate
}

export interface UserLearningProfile {
  userId: string;
  preferredMethods: MethodPerformance[];
  methodWeights: Record<LearningMethod, number>; // Q-values
  learningHistory: LearningEvent[];
  adaptationRate: number; // How quickly to update preferences
  explorationRate: number; // Epsilon for exploration
  lastUpdated: Date;
}

export interface LearningEvent {
  id: string;
  userId: string;
  method: LearningMethod;
  context: LearningContext;
  outcome: {
    success: boolean;
    score: number; // 0-100
    timeSpent: number; // minutes
    comprehensionGain: number; // Change in comprehension
    retentionScore: number; // How well retained after time
    engagementScore: number; // User engagement (1-10)
  };
  reward: number; // Calculated reward signal
  timestamp: Date;
}

export interface MethodRecommendation {
  method: LearningMethod;
  confidence: number; // 0-1
  expectedReward: number;
  reason: string;
  alternatives: { method: LearningMethod; confidence: number }[];
}

export class ReinforcementLearningService {
  private static instance: ReinforcementLearningService;

  private profiles: Map<string, UserLearningProfile> = new Map();
  private learningRate: number = 0.1; // Alpha - how quickly to update Q-values
  private discountFactor: number = 0.95; // Gamma - future reward importance
  private defaultExplorationRate: number = 0.15; // Epsilon - exploration vs exploitation

  // Services
  private geniusProfessor: GeniusProfessorService;
  private comprehensionTracker: ComprehensionTrackerService;
  private fsrsService: FSRSService;
  private quizService: DynamicQuizService;

  private constructor() {
    this.geniusProfessor = GeniusProfessorService.getInstance();
    this.comprehensionTracker = ComprehensionTrackerService.getInstance();
    this.fsrsService = FSRSService.getInstance();
    this.quizService = DynamicQuizService.getInstance();
    this.loadData();
  }

  public static getInstance(): ReinforcementLearningService {
    if (!ReinforcementLearningService.instance) {
      ReinforcementLearningService.instance = new ReinforcementLearningService();
    }
    return ReinforcementLearningService.instance;
  }

  /**
   * Get or create user learning profile
   */
  private getUserProfile(userId: string): UserLearningProfile {
    if (!this.profiles.has(userId)) {
      const profile: UserLearningProfile = {
        userId,
        preferredMethods: [],
        methodWeights: this.getDefaultWeights(),
        learningHistory: [],
        adaptationRate: 0.1,
        explorationRate: this.defaultExplorationRate,
        lastUpdated: new Date()
      };
      this.profiles.set(userId, profile);
    }
    return this.profiles.get(userId)!;
  }

  /**
   * Get default method weights (initial Q-values)
   */
  private getDefaultWeights(): Record<LearningMethod, number> {
    return {
      quiz: 0.5,
      feynman: 0.5,
      memory_palace: 0.5,
      zettelkasten: 0.5,
      spaced_repetition: 0.6, // Slightly higher - proven effective
      dual_n_back: 0.4,
      speed_reading: 0.4,
      interleaving: 0.5,
      elaboration: 0.5,
      teaching: 0.6 // Teaching is highly effective
    };
  }

  /**
   * Record a learning event and update Q-values (reinforcement learning)
   */
  public recordLearningEvent(
    userId: string,
    method: LearningMethod,
    context: LearningContext,
    outcome: LearningEvent['outcome']
  ): LearningEvent {
    const profile = this.getUserProfile(userId);

    // Calculate reward signal
    const reward = this.calculateReward(outcome);

    // Create learning event
    const event: LearningEvent = {
      id: this.generateId(),
      userId,
      method,
      context,
      outcome,
      reward,
      timestamp: new Date()
    };

    // Add to history
    profile.learningHistory.push(event);
    if (profile.learningHistory.length > 1000) {
      profile.learningHistory.shift(); // Keep last 1000 events
    }

    // Update Q-value using Q-learning update rule
    // Q(s,a) = Q(s,a) + α[r + γ*max(Q(s',a')) - Q(s,a)]
    const state = this.getStateRepresentation(context);
    const currentQ = profile.methodWeights[method];

    // Estimate next state value (simplified - would use actual next state in full RL)
    const nextStateValue = this.estimateNextStateValue(profile, context, outcome);

    // Q-learning update
    const newQ = currentQ + this.learningRate * (reward + this.discountFactor * nextStateValue - currentQ);
    profile.methodWeights[method] = Math.max(0, Math.min(1, newQ)); // Clamp to [0,1]

    // Update method performance tracking
    this.updateMethodPerformance(profile, method, outcome);

    // Update context-specific performance
    const contextKey = this.getContextKey(context);
    if (!profile.preferredMethods.find(m => m.method === method)) {
      profile.preferredMethods.push({
        method,
        successCount: 0,
        totalAttempts: 0,
        averageScore: 0,
        averageTimeMinutes: 0,
        lastUsed: new Date(),
        effectiveness: 0,
        contexts: {}
      });
    }

    const methodPerf = profile.preferredMethods.find(m => m.method === method)!;
    methodPerf.totalAttempts++;
    if (outcome.success) methodPerf.successCount++;
    methodPerf.averageScore = (methodPerf.averageScore * (methodPerf.totalAttempts - 1) + outcome.score) / methodPerf.totalAttempts;
    methodPerf.averageTimeMinutes = (methodPerf.averageTimeMinutes * (methodPerf.totalAttempts - 1) + outcome.timeSpent) / methodPerf.totalAttempts;
    methodPerf.lastUsed = new Date();
    methodPerf.effectiveness = this.calculateEffectiveness(methodPerf);

    // Update context-specific success rate
    if (!methodPerf.contexts[contextKey]) {
      methodPerf.contexts[contextKey] = 0;
    }
    methodPerf.contexts[contextKey] = (methodPerf.contexts[contextKey] * 0.9) + (outcome.success ? 0.1 : 0);

    profile.lastUpdated = new Date();

    // Reduce exploration rate over time (annealing)
    if (profile.learningHistory.length > 50) {
      profile.explorationRate = Math.max(0.05, profile.explorationRate * 0.99);
    }

    this.saveData();

    // Also record in comprehension tracker
    this.comprehensionTracker.recordEvent({
      userId,
      type: method === 'quiz' ? 'quiz' : method === 'feynman' ? 'feynman' : 'review',
      topic: context.topic,
      dimension: this.getDimensionForMethod(method),
      score: outcome.score,
      metadata: {
        method,
        context: contextKey,
        reward,
        success: outcome.success
      }
    });

    return event;
  }

  /**
   * Calculate reward signal from outcome
   */
  private calculateReward(outcome: LearningEvent['outcome']): number {
    // Multi-factor reward calculation
    let reward = 0;

    // Success contributes positively
    if (outcome.success) {
      reward += 0.3;
    } else {
      reward -= 0.2;
    }

    // Score contributes (normalized to [-0.3, 0.3])
    reward += (outcome.score / 100 - 0.5) * 0.6;

    // Comprehension gain is highly valuable
    reward += Math.min(outcome.comprehensionGain / 20, 0.3);

    // Retention is critical
    reward += outcome.retentionScore / 100 * 0.2;

    // Engagement matters
    reward += (outcome.engagementScore / 10 - 0.5) * 0.1;

    // Time efficiency bonus (faster is better, but not at expense of quality)
    if (outcome.timeSpent < 30 && outcome.success) {
      reward += 0.1; // Efficiency bonus
    }

    return Math.max(-1, Math.min(1, reward)); // Clamp to [-1, 1]
  }

  /**
   * Get state representation for RL
   */
  private getStateRepresentation(context: LearningContext): string {
    const archetype = context.userArchetype.substring(0, 3);
    const timeOfDay = context.timeOfDay.substring(0, 3);
    const energyLevel = Math.floor(context.energyLevel / 2); // 0-5
    const difficulty = Math.floor(context.topicDifficulty / 2); // 0-5

    return `${context.topic}_${archetype}_${timeOfDay}_${energyLevel}_${difficulty}`;
  }

  /**
   * Get context key for performance tracking
   */
  private getContextKey(context: LearningContext): string {
    return `${context.userArchetype}_${context.timeOfDay}_${Math.floor(context.energyLevel / 3)}`;
  }

  /**
   * Estimate next state value (simplified - full RL would use actual next state)
   */
  private estimateNextStateValue(
    profile: UserLearningProfile,
    context: LearningContext,
    outcome: LearningEvent['outcome']
  ): number {
    // If successful, next state is likely better
    if (outcome.success) {
      // Estimate best possible next action value
      const maxQ = Math.max(...Object.values(profile.methodWeights));
      return maxQ * 0.8; // Optimistic but discounted
    } else {
      // If failed, next state might need different approach
      return Math.max(...Object.values(profile.methodWeights)) * 0.5;
    }
  }

  /**
   * Update method performance statistics
   */
  private updateMethodPerformance(
    profile: UserLearningProfile,
    method: LearningMethod,
    outcome: LearningEvent['outcome']
  ): void {
    // Already handled in recordLearningEvent, but this could do additional processing
  }

  /**
   * Calculate method effectiveness score
   */
  private calculateEffectiveness(perf: MethodPerformance): number {
    if (perf.totalAttempts === 0) return 0;

    const successRate = perf.successCount / perf.totalAttempts;
    const scoreFactor = perf.averageScore / 100;
    const recencyFactor = this.getRecencyFactor(perf.lastUsed);

    return (successRate * 0.4 + scoreFactor * 0.4 + recencyFactor * 0.2);
  }

  /**
   * Get recency factor (more recent = higher)
   */
  private getRecencyFactor(lastUsed: Date): number {
    const daysSince = (Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - daysSince / 30); // Decay over 30 days
  }

  /**
   * Recommend best learning method for context (epsilon-greedy policy)
   */
  public recommendMethod(
    userId: string,
    context: LearningContext
  ): MethodRecommendation {
    const profile = this.getUserProfile(userId);
    const state = this.getStateRepresentation(context);

    // Get all available methods
    const allMethods: LearningMethod[] = [
      'quiz', 'feynman', 'memory_palace', 'zettelkasten',
      'spaced_repetition', 'dual_n_back', 'speed_reading',
      'interleaving', 'elaboration', 'teaching'
    ];

    // Epsilon-greedy: explore with probability epsilon, exploit otherwise
    const shouldExplore = Math.random() < profile.explorationRate;

    if (shouldExplore) {
      // Exploration: randomly select from methods
      const randomMethod = allMethods[Math.floor(Math.random() * allMethods.length)];
      return {
        method: randomMethod,
        confidence: 0.3,
        expectedReward: profile.methodWeights[randomMethod],
        reason: 'Exploring new methods to discover what works best for you',
        alternatives: []
      };
    }

    // Exploitation: select method with highest Q-value for this context
    // Also consider context-specific performance
    const methodScores = allMethods.map(method => {
      const baseQ = profile.methodWeights[method];
      const methodPerf = profile.preferredMethods.find(p => p.method === method);

      let contextBonus = 0;
      if (methodPerf) {
        const contextKey = this.getContextKey(context);
        const contextSuccessRate = methodPerf.contexts[contextKey] || 0;
        contextBonus = contextSuccessRate * 0.2; // Up to 20% bonus
      }

      return {
        method,
        score: baseQ + contextBonus,
        confidence: methodPerf ? methodPerf.effectiveness : 0.5
      };
    });

    // Sort by score
    methodScores.sort((a, b) => b.score - a.score);

    const best = methodScores[0];
    const alternatives = methodScores.slice(1, 4).map(m => ({
      method: m.method,
      confidence: m.confidence
    }));

    return {
      method: best.method,
      confidence: best.confidence,
      expectedReward: best.score,
      reason: this.generateRecommendationReason(best.method, profile, context),
      alternatives
    };
  }

  /**
   * Generate human-readable reason for recommendation
   */
  private generateRecommendationReason(
    method: LearningMethod,
    profile: UserLearningProfile,
    context: LearningContext
  ): string {
    const methodPerf = profile.preferredMethods.find(p => p.method === method);

    if (methodPerf && methodPerf.totalAttempts > 5) {
      const successRate = Math.round((methodPerf.successCount / methodPerf.totalAttempts) * 100);
      return `This method has a ${successRate}% success rate for you. Based on ${methodPerf.totalAttempts} previous uses, it's highly effective for your learning style.`;
    }

    const methodNames: Record<LearningMethod, string> = {
      quiz: 'Adaptive quizzes',
      feynman: 'Feynman Technique',
      memory_palace: 'Memory Palace',
      zettelkasten: 'Zettelkasten note-taking',
      spaced_repetition: 'Spaced repetition',
      dual_n_back: 'Dual N-Back training',
      speed_reading: 'Speed reading practice',
      interleaving: 'Interleaved practice',
      elaboration: 'Elaboration techniques',
      teaching: 'Teaching others'
    };

    return `${methodNames[method]} is recommended based on your learning profile and current context.`;
  }

  /**
   * Get user's learning profile
   */
  public getUserLearningProfile(userId: string): UserLearningProfile {
    return this.getUserProfile(userId);
  }

  /**
   * Get top performing methods for user
   */
  public getTopMethods(userId: string, limit: number = 5): MethodPerformance[] {
    const profile = this.getUserProfile(userId);
    return profile.preferredMethods
      .filter(m => m.totalAttempts >= 3) // Only methods with enough data
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, limit);
  }

  /**
   * Get method effectiveness by context
   */
  public getMethodEffectivenessByContext(
    userId: string,
    method: LearningMethod
  ): Record<string, number> {
    const profile = this.getUserProfile(userId);
    const methodPerf = profile.preferredMethods.find(m => m.method === method);
    return methodPerf?.contexts || {};
  }

  /**
   * Get dimension for method (for comprehension tracking)
   */
  private getDimensionForMethod(method: LearningMethod): ComprehensionDimension {
    const mapping: Record<LearningMethod, ComprehensionDimension> = {
      quiz: 'application',
      feynman: 'understanding',
      memory_palace: 'memory',
      zettelkasten: 'analysis',
      spaced_repetition: 'memory',
      dual_n_back: 'memory',
      speed_reading: 'application',
      interleaving: 'synthesis',
      elaboration: 'understanding',
      teaching: 'creation'
    };
    return mapping[method] || 'understanding';
  }

  /**
   * Export user profile for backup
   */
  public exportUserProfile(userId: string): UserLearningProfile {
    return this.getUserProfile(userId);
  }

  /**
   * Import user profile
   */
  public importUserProfile(profile: UserLearningProfile): void {
    this.profiles.set(profile.userId, profile);
    this.saveData();
  }

  // Utility methods
  private generateId(): string {
    return `rl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveData(): void {
    try {
      const profilesData = Array.from(this.profiles.entries());
      localStorage.setItem('polymath_rl_profiles', JSON.stringify(profilesData));
    } catch (error) {
      console.error('Error saving RL profiles:', error);
    }
  }

  private loadData(): void {
    try {
      const data = localStorage.getItem('polymath_rl_profiles');
      if (data) {
        const parsed = JSON.parse(data);
        for (const [userId, profile] of parsed) {
          profile.lastUpdated = new Date(profile.lastUpdated);
          profile.learningHistory = profile.learningHistory.map((e: any) => ({
            ...e,
            timestamp: new Date(e.timestamp),
            context: {
              ...e.context,
              // Ensure all context fields are present
            }
          }));
          profile.preferredMethods = profile.preferredMethods.map((m: any) => ({
            ...m,
            lastUsed: new Date(m.lastUsed)
          }));
          this.profiles.set(userId, profile);
        }
      }
    } catch (error) {
      console.error('Error loading RL profiles:', error);
    }
  }
}

