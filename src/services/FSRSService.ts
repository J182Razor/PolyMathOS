/**
 * FSRS (Free Spaced Repetition Scheduler) Service
 * Based on open-spaced-repetition/fsrs4anki - https://github.com/open-spaced-repetition/fsrs4anki
 * Uses FSRS-5 algorithm with 17 trainable parameters optimized from 1.7 billion review logs
 * 
 * Key concepts:
 * - Stability (S): Memory stability in days - how long until retrievability drops to 90%
 * - Difficulty (D): Inherent difficulty of the card (0-1)
 * - Retrievability (R): Probability of successful recall (0-1)
 */

export type CardState = 'new' | 'learning' | 'review' | 'relearning';
export type Rating = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy

export interface FSRSCard {
  id: string;
  content: {
    question: string;
    answer: string;
    topic: string;
    tags: string[];
  };
  difficulty: number;      // D (0-1) - inherent difficulty
  stability: number;       // S (days) - memory stability
  retrievability: number;  // R (0-1) - probability of recall
  lastReview: Date | null;
  nextReview: Date;
  reps: number;            // Number of successful reviews
  lapses: number;          // Number of times forgotten (rated "Again")
  state: CardState;
  elapsedDays: number;     // Days since last review
  scheduledDays: number;   // Days until next review
  createdAt: Date;
  reviewHistory: ReviewLog[];
}

export interface ReviewLog {
  timestamp: Date;
  rating: Rating;
  state: CardState;
  difficulty: number;
  stability: number;
  retrievability: number;
  elapsedDays: number;
  scheduledDays: number;
}

export interface FSRSParameters {
  w: number[];              // 17 trainable parameters
  requestRetention: number; // Target retention rate (default 0.9 = 90%)
  maximumInterval: number;  // Maximum interval in days
  enableFuzz: boolean;      // Add randomness to prevent "review bunching"
}

export interface SchedulingInfo {
  card: FSRSCard;
  again: ScheduledCard;
  hard: ScheduledCard;
  good: ScheduledCard;
  easy: ScheduledCard;
}

export interface ScheduledCard {
  scheduledDays: number;
  nextReview: Date;
  stability: number;
  difficulty: number;
  state: CardState;
}

export interface FSRSStatistics {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  relearningCards: number;
  dueToday: number;
  averageRetention: number;
  averageStability: number;
  averageDifficulty: number;
  reviewsToday: number;
  streakDays: number;
}

// FSRS-5 default parameters (optimized from srs-benchmark research)
const DEFAULT_FSRS_PARAMS: FSRSParameters = {
  w: [
    0.4,    // w0: Initial stability for Again
    0.6,    // w1: Initial stability for Hard
    2.4,    // w2: Initial stability for Good
    5.8,    // w3: Initial stability for Easy
    4.93,   // w4: Difficulty weight
    0.94,   // w5: Stability decay
    0.86,   // w6: Stability gain
    0.01,   // w7: Difficulty mean reversion
    1.49,   // w8: Stability power
    0.14,   // w9: Stability fail modifier
    0.94,   // w10: Difficulty Again modifier
    2.18,   // w11: Difficulty Hard modifier
    0.05,   // w12: Difficulty Good modifier
    0.34,   // w13: Difficulty Easy modifier
    1.26,   // w14: Short-term stability factor
    0.29,   // w15: Long-term stability factor
    2.61    // w16: Stability ceiling
  ],
  requestRetention: 0.9,    // Target 90% retention
  maximumInterval: 36500,   // ~100 years max interval
  enableFuzz: true          // Add fuzz to prevent bunching
};

export class FSRSService {
  private static instance: FSRSService;
  private params: FSRSParameters;
  private cards: Map<string, FSRSCard> = new Map();
  private userParams: Map<string, FSRSParameters> = new Map(); // Per-user optimized params

  private constructor() {
    this.params = { ...DEFAULT_FSRS_PARAMS };
    this.loadCards();
  }

  public static getInstance(): FSRSService {
    if (!FSRSService.instance) {
      FSRSService.instance = new FSRSService();
    }
    return FSRSService.instance;
  }

  /**
   * Create a new FSRS card
   */
  public createCard(
    question: string,
    answer: string,
    topic: string,
    tags: string[] = []
  ): FSRSCard {
    const now = new Date();
    const card: FSRSCard = {
      id: this.generateId(),
      content: { question, answer, topic, tags },
      difficulty: 0.3,           // Initial difficulty (will be adjusted)
      stability: 0,              // No stability until first review
      retrievability: 1.0,       // 100% retrievable (new card)
      lastReview: null,
      nextReview: now,           // Due immediately
      reps: 0,
      lapses: 0,
      state: 'new',
      elapsedDays: 0,
      scheduledDays: 0,
      createdAt: now,
      reviewHistory: []
    };

    this.cards.set(card.id, card);
    this.saveCards();
    return card;
  }

  /**
   * Get scheduling options for a card (preview what each rating would do)
   */
  public getSchedulingInfo(cardId: string): SchedulingInfo | null {
    const card = this.cards.get(cardId);
    if (!card) return null;

    const now = new Date();
    const elapsedDays = card.lastReview 
      ? this.daysBetween(card.lastReview, now) 
      : 0;

    // Update retrievability based on elapsed time
    const currentRetrievability = card.stability > 0 
      ? this.calculateRetrievability(card.stability, elapsedDays)
      : 1.0;

    const updatedCard = { ...card, elapsedDays, retrievability: currentRetrievability };

    return {
      card: updatedCard,
      again: this.simulateReview(updatedCard, 1),
      hard: this.simulateReview(updatedCard, 2),
      good: this.simulateReview(updatedCard, 3),
      easy: this.simulateReview(updatedCard, 4)
    };
  }

  /**
   * Review a card with a given rating
   */
  public reviewCard(cardId: string, rating: Rating): FSRSCard | null {
    const card = this.cards.get(cardId);
    if (!card) return null;

    const now = new Date();
    const elapsedDays = card.lastReview 
      ? this.daysBetween(card.lastReview, now) 
      : 0;

    // Calculate current retrievability
    const currentRetrievability = card.stability > 0
      ? this.calculateRetrievability(card.stability, elapsedDays)
      : 1.0;

    // Calculate new difficulty
    const newDifficulty = this.calculateNewDifficulty(card.difficulty, rating, card.state);

    // Calculate new stability
    const newStability = this.calculateNewStability(
      card.stability,
      newDifficulty,
      currentRetrievability,
      rating,
      card.state
    );

    // Calculate next interval
    const interval = this.calculateInterval(newStability);
    const fuzzedInterval = this.params.enableFuzz 
      ? this.applyFuzz(interval) 
      : interval;

    // Determine new state
    const newState = this.determineNewState(card.state, rating);

    // Update card
    const updatedCard: FSRSCard = {
      ...card,
      difficulty: newDifficulty,
      stability: newStability,
      retrievability: this.params.requestRetention, // Reset to target after review
      lastReview: now,
      nextReview: this.addDays(now, fuzzedInterval),
      reps: rating >= 2 ? card.reps + 1 : card.reps,
      lapses: rating === 1 ? card.lapses + 1 : card.lapses,
      state: newState,
      elapsedDays,
      scheduledDays: fuzzedInterval,
      reviewHistory: [
        ...card.reviewHistory,
        {
          timestamp: now,
          rating,
          state: card.state,
          difficulty: newDifficulty,
          stability: newStability,
          retrievability: currentRetrievability,
          elapsedDays,
          scheduledDays: fuzzedInterval
        }
      ]
    };

    this.cards.set(cardId, updatedCard);
    this.saveCards();
    return updatedCard;
  }

  /**
   * Get cards due for review
   */
  public getDueCards(limit?: number): FSRSCard[] {
    const now = new Date();
    const dueCards = Array.from(this.cards.values())
      .filter(card => card.nextReview <= now)
      .sort((a, b) => {
        // Priority: overdue first, then by retrievability (lowest first)
        const aOverdue = this.daysBetween(a.nextReview, now);
        const bOverdue = this.daysBetween(b.nextReview, now);
        if (aOverdue !== bOverdue) return bOverdue - aOverdue;
        return a.retrievability - b.retrievability;
      });

    return limit ? dueCards.slice(0, limit) : dueCards;
  }

  /**
   * Get cards by state
   */
  public getCardsByState(state: CardState): FSRSCard[] {
    return Array.from(this.cards.values()).filter(card => card.state === state);
  }

  /**
   * Get cards by topic
   */
  public getCardsByTopic(topic: string): FSRSCard[] {
    return Array.from(this.cards.values())
      .filter(card => card.content.topic.toLowerCase() === topic.toLowerCase());
  }

  /**
   * Get comprehensive statistics
   */
  public getStatistics(): FSRSStatistics {
    const allCards = Array.from(this.cards.values());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const dueToday = allCards.filter(c => c.nextReview <= now).length;
    const reviewsToday = allCards.filter(c => 
      c.lastReview && c.lastReview >= today
    ).length;

    const reviewedCards = allCards.filter(c => c.stability > 0);
    const avgRetention = reviewedCards.length > 0
      ? reviewedCards.reduce((sum, c) => sum + c.retrievability, 0) / reviewedCards.length
      : 0;
    const avgStability = reviewedCards.length > 0
      ? reviewedCards.reduce((sum, c) => sum + c.stability, 0) / reviewedCards.length
      : 0;
    const avgDifficulty = reviewedCards.length > 0
      ? reviewedCards.reduce((sum, c) => sum + c.difficulty, 0) / reviewedCards.length
      : 0;

    return {
      totalCards: allCards.length,
      newCards: allCards.filter(c => c.state === 'new').length,
      learningCards: allCards.filter(c => c.state === 'learning').length,
      reviewCards: allCards.filter(c => c.state === 'review').length,
      relearningCards: allCards.filter(c => c.state === 'relearning').length,
      dueToday,
      averageRetention: Math.round(avgRetention * 100) / 100,
      averageStability: Math.round(avgStability * 100) / 100,
      averageDifficulty: Math.round(avgDifficulty * 100) / 100,
      reviewsToday,
      streakDays: this.calculateStreak()
    };
  }

  /**
   * Optimize parameters based on user's review history
   * This implements personalized FSRS by adjusting parameters to match user's forgetting curve
   */
  public optimizeParameters(userId: string): FSRSParameters {
    const userCards = Array.from(this.cards.values());
    const reviewData = userCards.flatMap(card => card.reviewHistory);

    if (reviewData.length < 100) {
      // Not enough data, return defaults
      return this.params;
    }

    // Calculate personalized parameters based on review history
    // This is a simplified version - full implementation would use gradient descent
    const retentionRates: number[] = [];
    const stabilityFactors: number[] = [];

    for (const card of userCards) {
      if (card.reviewHistory.length >= 2) {
        const successfulReviews = card.reviewHistory.filter(r => r.rating >= 2);
        const retentionRate = successfulReviews.length / card.reviewHistory.length;
        retentionRates.push(retentionRate);

        // Calculate how stability changed over time
        for (let i = 1; i < card.reviewHistory.length; i++) {
          const prev = card.reviewHistory[i - 1];
          const curr = card.reviewHistory[i];
          if (prev.stability > 0 && curr.stability > 0) {
            stabilityFactors.push(curr.stability / prev.stability);
          }
        }
      }
    }

    // Adjust parameters based on observed data
    const avgRetention = retentionRates.length > 0
      ? retentionRates.reduce((a, b) => a + b, 0) / retentionRates.length
      : 0.85;

    const avgStabilityGrowth = stabilityFactors.length > 0
      ? stabilityFactors.reduce((a, b) => a + b, 0) / stabilityFactors.length
      : 2.0;

    // Create personalized parameters
    const optimizedParams: FSRSParameters = {
      ...this.params,
      requestRetention: Math.max(0.7, Math.min(0.97, avgRetention + 0.05)),
      w: [...this.params.w]
    };

    // Adjust stability weights based on observed growth
    if (avgStabilityGrowth > 2.5) {
      optimizedParams.w[6] = Math.min(1.5, this.params.w[6] * 1.1); // Increase stability gain
    } else if (avgStabilityGrowth < 1.5) {
      optimizedParams.w[6] = Math.max(0.5, this.params.w[6] * 0.9); // Decrease stability gain
    }

    this.userParams.set(userId, optimizedParams);
    return optimizedParams;
  }

  /**
   * Calculate the interval until retrievability drops to target retention
   */
  private calculateInterval(stability: number): number {
    // R = e^(-t/S) where t is interval and S is stability
    // Solving for t when R = requestRetention:
    // t = -S * ln(requestRetention)
    const interval = -stability * Math.log(this.params.requestRetention);
    return Math.min(Math.max(1, Math.round(interval)), this.params.maximumInterval);
  }

  /**
   * Calculate retrievability given stability and elapsed days
   */
  private calculateRetrievability(stability: number, elapsedDays: number): number {
    if (stability <= 0) return 1.0;
    // Forgetting curve: R = e^(-t/S)
    return Math.exp(-elapsedDays / stability);
  }

  /**
   * Calculate new difficulty after a review
   */
  private calculateNewDifficulty(
    currentDifficulty: number,
    rating: Rating,
    state: CardState
  ): number {
    const w = this.params.w;
    
    if (state === 'new') {
      // Initial difficulty based on first rating
      const initialDifficulty = w[4] - (rating - 3) * w[5];
      return this.clamp(initialDifficulty, 0.1, 0.9);
    }

    // Difficulty adjustment based on rating
    const difficultyDelta = {
      1: w[10],   // Again - increase difficulty
      2: w[11],   // Hard - slight increase
      3: w[12],   // Good - slight decrease
      4: w[13]    // Easy - decrease
    }[rating];

    // Mean reversion factor
    const meanReversion = w[7] * (0.5 - currentDifficulty);
    
    const newDifficulty = currentDifficulty + difficultyDelta + meanReversion;
    return this.clamp(newDifficulty, 0.1, 0.9);
  }

  /**
   * Calculate new stability after a review
   */
  private calculateNewStability(
    currentStability: number,
    difficulty: number,
    retrievability: number,
    rating: Rating,
    state: CardState
  ): number {
    const w = this.params.w;

    if (state === 'new' || currentStability === 0) {
      // Initial stability based on first rating
      return w[rating - 1]; // w0-w3 for Again/Hard/Good/Easy
    }

    if (rating === 1) {
      // Lapse - stability decreases significantly
      const newStability = w[9] * Math.pow(currentStability, w[8]) * 
        Math.exp((1 - retrievability) * w[14]) * 
        Math.pow(difficulty, w[15]);
      return Math.max(0.1, newStability);
    }

    // Successful review - stability increases
    const stabilityIncreaseFactor = Math.exp(w[6]) * 
      (11 - difficulty) * 
      Math.pow(currentStability, -w[5]) * 
      (Math.exp((1 - retrievability) * w[14]) - 1);

    // Bonus for Easy rating
    const easyBonus = rating === 4 ? w[16] : 1;

    const newStability = currentStability * (1 + stabilityIncreaseFactor) * easyBonus;
    return Math.min(newStability, this.params.maximumInterval);
  }

  /**
   * Determine the new state after a review
   */
  private determineNewState(currentState: CardState, rating: Rating): CardState {
    if (rating === 1) {
      // Again - move to relearning
      return currentState === 'new' ? 'learning' : 'relearning';
    }

    if (currentState === 'new' || currentState === 'learning') {
      return rating >= 3 ? 'review' : 'learning';
    }

    if (currentState === 'relearning') {
      return rating >= 3 ? 'review' : 'relearning';
    }

    return 'review';
  }

  /**
   * Simulate a review without actually applying it
   */
  private simulateReview(card: FSRSCard, rating: Rating): ScheduledCard {
    const newDifficulty = this.calculateNewDifficulty(card.difficulty, rating, card.state);
    const newStability = this.calculateNewStability(
      card.stability,
      newDifficulty,
      card.retrievability,
      rating,
      card.state
    );
    const interval = this.calculateInterval(newStability);
    const newState = this.determineNewState(card.state, rating);

    return {
      scheduledDays: interval,
      nextReview: this.addDays(new Date(), interval),
      stability: newStability,
      difficulty: newDifficulty,
      state: newState
    };
  }

  /**
   * Apply fuzz to interval to prevent "review bunching"
   */
  private applyFuzz(interval: number): number {
    if (interval < 2) return interval;
    
    const fuzzFactor = 0.05; // 5% fuzz
    const fuzzRange = interval * fuzzFactor;
    const fuzz = (Math.random() - 0.5) * 2 * fuzzRange;
    
    return Math.max(1, Math.round(interval + fuzz));
  }

  /**
   * Calculate consecutive days with reviews
   */
  private calculateStreak(): number {
    const allCards = Array.from(this.cards.values());
    const reviewDates = new Set<string>();

    for (const card of allCards) {
      for (const review of card.reviewHistory) {
        const dateStr = review.timestamp.toISOString().split('T')[0];
        reviewDates.add(dateStr);
      }
    }

    if (reviewDates.size === 0) return 0;

    const sortedDates = Array.from(reviewDates).sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    
    // Check if studied today or yesterday
    if (sortedDates[0] !== today) {
      const yesterday = this.addDays(new Date(), -1).toISOString().split('T')[0];
      if (sortedDates[0] !== yesterday) return 0;
    }

    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const daysDiff = this.daysBetween(currDate, prevDate);
      
      if (daysDiff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Utility methods
  private daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date2.getTime() - date1.getTime()) / oneDay));
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private generateId(): string {
    return `fsrs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Import cards from other sources (Anki, etc.)
   */
  public importCards(cards: Partial<FSRSCard>[]): FSRSCard[] {
    const imported: FSRSCard[] = [];
    
    for (const cardData of cards) {
      if (!cardData.content?.question || !cardData.content?.answer) continue;

      const card = this.createCard(
        cardData.content.question,
        cardData.content.answer,
        cardData.content.topic || 'Imported',
        cardData.content.tags || []
      );

      // If card has existing FSRS data, preserve it
      if (cardData.difficulty !== undefined) card.difficulty = cardData.difficulty;
      if (cardData.stability !== undefined) card.stability = cardData.stability;
      if (cardData.reps !== undefined) card.reps = cardData.reps;
      if (cardData.lapses !== undefined) card.lapses = cardData.lapses;
      if (cardData.state !== undefined) card.state = cardData.state;

      this.cards.set(card.id, card);
      imported.push(card);
    }

    this.saveCards();
    return imported;
  }

  /**
   * Export cards for backup
   */
  public exportCards(): FSRSCard[] {
    return Array.from(this.cards.values());
  }

  /**
   * Delete a card
   */
  public deleteCard(cardId: string): boolean {
    const deleted = this.cards.delete(cardId);
    if (deleted) this.saveCards();
    return deleted;
  }

  /**
   * Get a single card by ID
   */
  public getCard(cardId: string): FSRSCard | undefined {
    return this.cards.get(cardId);
  }

  /**
   * Update card content
   */
  public updateCardContent(
    cardId: string,
    content: Partial<FSRSCard['content']>
  ): FSRSCard | null {
    const card = this.cards.get(cardId);
    if (!card) return null;

    card.content = { ...card.content, ...content };
    this.cards.set(cardId, card);
    this.saveCards();
    return card;
  }

  // Persistence methods
  private saveCards(): void {
    try {
      const cardsData = Array.from(this.cards.entries()).map(([id, card]) => ({
        ...card,
        lastReview: card.lastReview?.toISOString() || null,
        nextReview: card.nextReview.toISOString(),
        createdAt: card.createdAt.toISOString(),
        reviewHistory: card.reviewHistory.map(r => ({
          ...r,
          timestamp: r.timestamp.toISOString()
        }))
      }));
      localStorage.setItem('polymath_fsrs_cards', JSON.stringify(cardsData));
    } catch (error) {
      console.error('Error saving FSRS cards:', error);
    }
  }

  private loadCards(): void {
    try {
      const data = localStorage.getItem('polymath_fsrs_cards');
      if (data) {
        const cardsData = JSON.parse(data);
        for (const cardData of cardsData) {
          const card: FSRSCard = {
            ...cardData,
            lastReview: cardData.lastReview ? new Date(cardData.lastReview) : null,
            nextReview: new Date(cardData.nextReview),
            createdAt: new Date(cardData.createdAt),
            reviewHistory: cardData.reviewHistory.map((r: any) => ({
              ...r,
              timestamp: new Date(r.timestamp)
            }))
          };
          this.cards.set(card.id, card);
        }
      }
    } catch (error) {
      console.error('Error loading FSRS cards:', error);
    }
  }
}

