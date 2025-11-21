/**
 * Enhanced Spaced Repetition Service
 * Implements Project 144 research-based spacing intervals
 * 
 * Research-Based Schedule:
 * - Day 0 (Acquisition): Immediate first retrieval
 * - Day 1 (24 hours): First spacing interval
 * - Day 3-4: Second retrieval with context change
 * - Day 7: Mixed review (interleaved)
 * - Day 14: Longer-term review
 * - Day 30: Monthly review
 * - Beyond: Increasing intervals (3 months, 6 months, yearly)
 */

import { SpacedRepetitionService } from './SpacedRepetitionService';

export interface EnhancedReviewItem {
  id: string;
  content: string;
  question: string;
  answer: string;
  domain: string;
  
  // Spacing schedule (research-based)
  acquisitionDate: Date; // Day 0
  day1Review?: Date; // 24 hours
  day3Review?: Date; // 3-4 days
  day7Review?: Date; // 1 week
  day14Review?: Date; // 2 weeks
  day30Review?: Date; // 1 month
  month3Review?: Date; // 3 months
  month6Review?: Date; // 6 months
  year1Review?: Date; // 1 year
  
  // Current status
  currentStage: 'acquisition' | 'day1' | 'day3' | 'day7' | 'day14' | 'day30' | 'month3' | 'month6' | 'year1' | 'mastered';
  nextReviewDate: Date;
  lastReviewDate?: Date;
  
  // Performance tracking
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  confidenceHistory: number[]; // Track confidence over time
  contextChanges: number; // Track context variations
  
  // SM-2 compatibility
  easeFactor: number;
  interval: number; // Days
  repetitions: number;
  
  // Dual coding
  visualEncoding?: string; // Description of visual mnemonic
  verbalEncoding?: string; // Text description
  memoryPalaceLocus?: string; // If stored in memory palace
}

export interface ReviewSchedule {
  today: EnhancedReviewItem[];
  tomorrow: EnhancedReviewItem[];
  thisWeek: EnhancedReviewItem[];
  thisMonth: EnhancedReviewItem[];
  overdue: EnhancedReviewItem[];
}

export class EnhancedSpacedRepetitionService {
  private static instance: EnhancedSpacedRepetitionService;
  private storageKey = 'polymathos_enhanced_spaced_repetition';
  private baseService = SpacedRepetitionService.getInstance();

  private constructor() {}

  public static getInstance(): EnhancedSpacedRepetitionService {
    if (!EnhancedSpacedRepetitionService.instance) {
      EnhancedSpacedRepetitionService.instance = new EnhancedSpacedRepetitionService();
    }
    return EnhancedSpacedRepetitionService.instance;
  }

  /**
   * Create a new item with research-based schedule
   */
  public createItem(
    id: string,
    content: string,
    question: string,
    answer: string,
    domain: string,
    visualEncoding?: string,
    memoryPalaceLocus?: string
  ): EnhancedReviewItem {
    const now = new Date();
    
    const item: EnhancedReviewItem = {
      id,
      content,
      question,
      answer,
      domain,
      acquisitionDate: now,
      day1Review: this.addDays(now, 1),
      day3Review: this.addDays(now, 3),
      day7Review: this.addDays(now, 7),
      day14Review: this.addDays(now, 14),
      day30Review: this.addDays(now, 30),
      month3Review: this.addDays(now, 90),
      month6Review: this.addDays(now, 180),
      year1Review: this.addDays(now, 365),
      currentStage: 'acquisition',
      nextReviewDate: this.addDays(now, 1), // First review in 24 hours
      reviewCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      confidenceHistory: [],
      contextChanges: 0,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      visualEncoding,
      verbalEncoding: content,
      memoryPalaceLocus,
    };

    this.saveItem(item);
    return item;
  }

  /**
   * Process a review with research-based progression
   */
  public processReview(
    itemId: string,
    wasCorrect: boolean,
    confidence: number, // 0-100%
    contextChanged: boolean = false
  ): EnhancedReviewItem | null {
    let item = this.getItem(itemId);
    if (!item) return null;

    const now = new Date();
    item.lastReviewDate = now;
    item.reviewCount++;
    item.confidenceHistory.push(confidence);

    if (wasCorrect) {
      item.correctCount++;
    } else {
      item.incorrectCount++;
    }

    if (contextChanged) {
      item.contextChanges++;
    }

    // Determine next stage based on current stage and performance
    if (wasCorrect) {
      item = this.advanceStage(item);
    } else {
      // Reset to earlier stage if incorrect
      item = this.resetStage(item);
    }

    // Update next review date based on stage
    item.nextReviewDate = this.getNextReviewDate(item);

    // Also update SM-2 parameters for compatibility
    const quality = wasCorrect ? (confidence >= 80 ? 5 : confidence >= 60 ? 4 : 3) : (confidence >= 50 ? 2 : 1);
    const sm2Item = this.baseService.processReview(itemId, quality);
    if (sm2Item) {
      item.easeFactor = sm2Item.easeFactor;
      item.interval = sm2Item.interval;
      item.repetitions = sm2Item.repetitions;
    }

    this.saveItem(item);
    return item;
  }

  /**
   * Get items due for review today
   */
  public getDueItems(domain?: string): EnhancedReviewItem[] {
    const allItems = this.getAllItems();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = this.addDays(today, 1);

    let dueItems = allItems.filter(item => {
      const nextReview = new Date(item.nextReviewDate);
      return nextReview <= now;
    });

    if (domain) {
      dueItems = dueItems.filter(item => item.domain === domain);
    }

    // Sort by priority: overdue first, then by stage (earlier stages first)
    dueItems.sort((a, b) => {
      const aOverdue = new Date(a.nextReviewDate) < today ? 1 : 0;
      const bOverdue = new Date(b.nextReviewDate) < today ? 1 : 0;
      
      if (aOverdue !== bOverdue) {
        return bOverdue - aOverdue;
      }

      const stageOrder: Record<string, number> = {
        'acquisition': 0,
        'day1': 1,
        'day3': 2,
        'day7': 3,
        'day14': 4,
        'day30': 5,
        'month3': 6,
        'month6': 7,
        'year1': 8,
        'mastered': 9,
      };

      return stageOrder[a.currentStage] - stageOrder[b.currentStage];
    });

    return dueItems;
  }

  /**
   * Get review schedule (today, tomorrow, this week, etc.)
   */
  public getReviewSchedule(domain?: string): ReviewSchedule {
    const allItems = this.getAllItems();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = this.addDays(today, 1);
    const nextWeek = this.addDays(today, 7);
    const nextMonth = this.addDays(today, 30);

    let items = domain 
      ? allItems.filter(item => item.domain === domain)
      : allItems;

    const schedule: ReviewSchedule = {
      today: [],
      tomorrow: [],
      thisWeek: [],
      thisMonth: [],
      overdue: [],
    };

    items.forEach(item => {
      const reviewDate = new Date(item.nextReviewDate);
      const reviewDay = new Date(reviewDate.getFullYear(), reviewDate.getMonth(), reviewDate.getDate());

      if (reviewDay < today) {
        schedule.overdue.push(item);
      } else if (reviewDay.getTime() === today.getTime()) {
        schedule.today.push(item);
      } else if (reviewDay.getTime() === tomorrow.getTime()) {
        schedule.tomorrow.push(item);
      } else if (reviewDay <= nextWeek) {
        schedule.thisWeek.push(item);
      } else if (reviewDay <= nextMonth) {
        schedule.thisMonth.push(item);
      }
    });

    return schedule;
  }

  /**
   * Get statistics
   */
  public getStatistics(domain?: string): {
    totalItems: number;
    masteredItems: number;
    learningItems: number;
    dueToday: number;
    dueThisWeek: number;
    averageConfidence: number;
    retentionRate: number;
    stageDistribution: Record<string, number>;
  } {
    let items = this.getAllItems();
    
    if (domain) {
      items = items.filter(item => item.domain === domain);
    }

    const mastered = items.filter(item => item.currentStage === 'mastered');
    const learning = items.filter(item => item.currentStage !== 'mastered' && item.currentStage !== 'acquisition');
    const dueToday = this.getDueItems(domain).length;
    
    const schedule = this.getReviewSchedule(domain);
    const dueThisWeek = schedule.today.length + schedule.tomorrow.length + schedule.thisWeek.length;

    const averageConfidence = items.length > 0
      ? items.reduce((sum, item) => {
          const recent = item.confidenceHistory.slice(-5);
          return sum + (recent.length > 0 
            ? recent.reduce((s, c) => s + c, 0) / recent.length 
            : 0);
        }, 0) / items.length
      : 0;

    const retentionRate = items.length > 0
      ? (items.filter(item => item.correctCount > item.incorrectCount).length / items.length) * 100
      : 0;

    const stageDistribution: Record<string, number> = {};
    items.forEach(item => {
      stageDistribution[item.currentStage] = (stageDistribution[item.currentStage] || 0) + 1;
    });

    return {
      totalItems: items.length,
      masteredItems: mastered.length,
      learningItems: learning.length,
      dueToday,
      dueThisWeek,
      averageConfidence: Math.round(averageConfidence),
      retentionRate: Math.round(retentionRate),
      stageDistribution,
    };
  }

  /**
   * Advance to next stage after successful review
   */
  private advanceStage(item: EnhancedReviewItem): EnhancedReviewItem {
    const stageProgression: Record<string, string> = {
      'acquisition': 'day1',
      'day1': 'day3',
      'day3': 'day7',
      'day7': 'day14',
      'day14': 'day30',
      'day30': 'month3',
      'month3': 'month6',
      'month6': 'year1',
      'year1': 'mastered',
    };

    if (stageProgression[item.currentStage]) {
      item.currentStage = stageProgression[item.currentStage] as any;
    }

    return item;
  }

  /**
   * Reset to earlier stage after incorrect review
   */
  private resetStage(item: EnhancedReviewItem): EnhancedReviewItem {
    const resetMap: Record<string, string> = {
      'day1': 'acquisition',
      'day3': 'day1',
      'day7': 'day3',
      'day14': 'day7',
      'day30': 'day14',
      'month3': 'day30',
      'month6': 'month3',
      'year1': 'month6',
      'mastered': 'year1',
    };

    if (resetMap[item.currentStage]) {
      item.currentStage = resetMap[item.currentStage] as any;
    }

    return item;
  }

  /**
   * Get next review date based on current stage
   */
  private getNextReviewDate(item: EnhancedReviewItem): Date {
    const now = new Date();
    
    switch (item.currentStage) {
      case 'acquisition':
        return item.day1Review || this.addDays(now, 1);
      case 'day1':
        return item.day3Review || this.addDays(now, 3);
      case 'day3':
        return item.day7Review || this.addDays(now, 7);
      case 'day7':
        return item.day14Review || this.addDays(now, 14);
      case 'day14':
        return item.day30Review || this.addDays(now, 30);
      case 'day30':
        return item.month3Review || this.addDays(now, 90);
      case 'month3':
        return item.month6Review || this.addDays(now, 180);
      case 'month6':
        return item.year1Review || this.addDays(now, 365);
      case 'year1':
      case 'mastered':
        // For mastered items, review annually
        return this.addDays(now, 365);
      default:
        return this.addDays(now, 1);
    }
  }

  private getItem(id: string): EnhancedReviewItem | null {
    const items = this.getAllItems();
    return items.find(item => item.id === id) || null;
  }

  private getAllItems(): EnhancedReviewItem[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const items = JSON.parse(stored);
      return items.map((item: any) => ({
        ...item,
        acquisitionDate: new Date(item.acquisitionDate),
        day1Review: item.day1Review ? new Date(item.day1Review) : undefined,
        day3Review: item.day3Review ? new Date(item.day3Review) : undefined,
        day7Review: item.day7Review ? new Date(item.day7Review) : undefined,
        day14Review: item.day14Review ? new Date(item.day14Review) : undefined,
        day30Review: item.day30Review ? new Date(item.day30Review) : undefined,
        month3Review: item.month3Review ? new Date(item.month3Review) : undefined,
        month6Review: item.month6Review ? new Date(item.month6Review) : undefined,
        year1Review: item.year1Review ? new Date(item.year1Review) : undefined,
        nextReviewDate: new Date(item.nextReviewDate),
        lastReviewDate: item.lastReviewDate ? new Date(item.lastReviewDate) : undefined,
      }));
    } catch (error) {
      console.error('Error loading enhanced spaced repetition items:', error);
      return [];
    }
  }

  private saveItem(item: EnhancedReviewItem): void {
    const items = this.getAllItems();
    const index = items.findIndex(i => i.id === item.id);
    
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving enhanced spaced repetition item:', error);
    }
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

