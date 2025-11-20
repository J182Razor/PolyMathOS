/**
 * Spaced Repetition Service
 * Implements scientifically-backed spaced repetition algorithm for optimal memory consolidation
 * Based on Ebbinghaus forgetting curve and SuperMemo algorithm
 */

interface ReviewItem {
  id: string;
  content: string;
  question: string;
  answer: string;
  difficulty: number; // 0-5 (SM-2 algorithm)
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews
  easeFactor: number; // Starting at 2.5, adjusts based on performance
  lastReviewDate: Date;
  nextReviewDate: Date;
  createdAt: Date;
}

interface ReviewSession {
  items: ReviewItem[];
  totalItems: number;
  newItems: number;
  reviewItems: number;
  estimatedTime: number; // minutes
}

interface ReviewResult {
  itemId: string;
  quality: number; // 0-5 (SM-2 quality scale)
  timestamp: Date;
}

export class SpacedRepetitionService {
  private static instance: SpacedRepetitionService;
  private storageKey = 'polymathos_spaced_repetition';

  private constructor() {}

  public static getInstance(): SpacedRepetitionService {
    if (!SpacedRepetitionService.instance) {
      SpacedRepetitionService.instance = new SpacedRepetitionService();
    }
    return SpacedRepetitionService.instance;
  }

  /**
   * Create a new review item from learning content
   */
  public createReviewItem(
    id: string,
    content: string,
    question: string,
    answer: string
  ): ReviewItem {
    const now = new Date();
    
    return {
      id,
      content,
      question,
      answer,
      difficulty: 0,
      interval: 1, // First review in 1 day
      repetitions: 0,
      easeFactor: 2.5, // Starting ease factor (SM-2 standard)
      lastReviewDate: now,
      nextReviewDate: this.addDays(now, 1),
      createdAt: now,
    };
  }

  /**
   * Get items due for review
   */
  public getDueItems(limit?: number): ReviewItem[] {
    const allItems = this.getAllItems();
    const now = new Date();
    
    const dueItems = allItems.filter(item => {
      const nextReview = new Date(item.nextReviewDate);
      return nextReview <= now;
    });

    // Sort by priority (overdue items first, then by next review date)
    dueItems.sort((a, b) => {
      const aOverdue = new Date(a.nextReviewDate) < now ? 1 : 0;
      const bOverdue = new Date(b.nextReviewDate) < now ? 1 : 0;
      
      if (aOverdue !== bOverdue) {
        return bOverdue - aOverdue;
      }
      
      return new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime();
    });

    return limit ? dueItems.slice(0, limit) : dueItems;
  }

  /**
   * Process review result and update item using SM-2 algorithm
   */
  public processReview(itemId: string, quality: number): ReviewItem | null {
    const items = this.getAllItems();
    const item = items.find(i => i.id === itemId);
    
    if (!item) return null;

    // SM-2 Algorithm implementation
    let newEaseFactor = item.easeFactor;
    let newInterval = item.interval;
    let newRepetitions = item.repetitions;

    // Quality: 0-5 scale
    // 5 = perfect response
    // 4 = correct response with hesitation
    // 3 = correct response with serious difficulty
    // 2 = incorrect response; correct one remembered
    // 1 = incorrect response; correct one seemed familiar
    // 0 = complete blackout

    if (quality < 3) {
      // Incorrect response - reset
      newRepetitions = 0;
      newInterval = 1;
    } else {
      // Correct response
      if (newRepetitions === 0) {
        newInterval = 1;
      } else if (newRepetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(newInterval * newEaseFactor);
      }
      
      newRepetitions += 1;
    }

    // Update ease factor
    newEaseFactor = item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(1.3, newEaseFactor); // Minimum ease factor

    // Update item
    const now = new Date();
    const updatedItem: ReviewItem = {
      ...item,
      difficulty: quality < 3 ? 0 : Math.min(5, item.difficulty + 1),
      interval: newInterval,
      repetitions: newRepetitions,
      easeFactor: newEaseFactor,
      lastReviewDate: now,
      nextReviewDate: this.addDays(now, newInterval),
    };

    this.saveItem(updatedItem);
    return updatedItem;
  }

  /**
   * Get review session with items to review
   */
  public getReviewSession(maxItems: number = 20): ReviewSession {
    const dueItems = this.getDueItems(maxItems);
    const allItems = this.getAllItems();
    
    const newItems = allItems.filter(item => item.repetitions === 0);
    const reviewItems = dueItems.filter(item => item.repetitions > 0);

    // Estimate time: 2 minutes per item
    const estimatedTime = dueItems.length * 2;

    return {
      items: dueItems.slice(0, maxItems),
      totalItems: dueItems.length,
      newItems: newItems.length,
      reviewItems: reviewItems.length,
      estimatedTime,
    };
  }

  /**
   * Get statistics about spaced repetition progress
   */
  public getStatistics(): {
    totalItems: number;
    masteredItems: number;
    learningItems: number;
    dueToday: number;
    dueThisWeek: number;
    averageEaseFactor: number;
    retentionRate: number;
  } {
    const allItems = this.getAllItems();
    const now = new Date();
    const weekFromNow = this.addDays(now, 7);

    const masteredItems = allItems.filter(item => item.repetitions >= 5 && item.easeFactor >= 2.0);
    const learningItems = allItems.filter(item => item.repetitions > 0 && item.repetitions < 5);
    const dueToday = allItems.filter(item => {
      const nextReview = new Date(item.nextReviewDate);
      return nextReview <= now;
    }).length;
    
    const dueThisWeek = allItems.filter(item => {
      const nextReview = new Date(item.nextReviewDate);
      return nextReview <= weekFromNow;
    }).length;

    const averageEaseFactor = allItems.length > 0
      ? allItems.reduce((sum, item) => sum + item.easeFactor, 0) / allItems.length
      : 2.5;

    // Calculate retention rate (items reviewed correctly in last 7 days)
    const recentReviews = allItems.filter(item => {
      const lastReview = new Date(item.lastReviewDate);
      const daysSinceReview = (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceReview <= 7 && item.repetitions > 0;
    });

    const retentionRate = recentReviews.length > 0
      ? (masteredItems.length / recentReviews.length) * 100
      : 0;

    return {
      totalItems: allItems.length,
      masteredItems: masteredItems.length,
      learningItems: learningItems.length,
      dueToday,
      dueThisWeek,
      averageEaseFactor: Math.round(averageEaseFactor * 100) / 100,
      retentionRate: Math.round(retentionRate),
    };
  }

  /**
   * Add items from a completed learning session
   */
  public addItemsFromSession(sessionData: {
    questions: Array<{ id: string; question: string; answer: string; explanation: string }>;
  }): void {
    sessionData.questions.forEach(q => {
      const item = this.createReviewItem(
        q.id,
        q.explanation,
        q.question,
        q.answer
      );
      this.saveItem(item);
    });
  }

  /**
   * Get all items
   */
  private getAllItems(): ReviewItem[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const items = JSON.parse(stored);
      // Convert date strings back to Date objects
      return items.map((item: any) => ({
        ...item,
        lastReviewDate: new Date(item.lastReviewDate),
        nextReviewDate: new Date(item.nextReviewDate),
        createdAt: new Date(item.createdAt),
      }));
    } catch (error) {
      console.error('Error loading spaced repetition items:', error);
      return [];
    }
  }

  /**
   * Save item to storage
   */
  private saveItem(item: ReviewItem): void {
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
      console.error('Error saving spaced repetition item:', error);
    }
  }

  /**
   * Helper: Add days to date
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Clear all items (for testing/reset)
   */
  public clearAllItems(): void {
    localStorage.removeItem(this.storageKey);
  }
}

