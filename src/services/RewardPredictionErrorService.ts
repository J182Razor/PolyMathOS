/**
 * Reward Prediction Error (RPE) Service
 * Implements dopamine-driven learning through RPE mechanics
 * Based on Project 144 research: RPE drives synaptic plasticity
 * 
 * Key Principles:
 * - Positive RPE (better than expected) → dopamine burst → LTP (strengthening)
 * - Zero RPE (as expected) → baseline dopamine → minimal plasticity
 * - Negative RPE (worse than expected) → dopamine dip → LTD (weakening) + norepinephrine (attention)
 * - Hyper-Correction Effect: High-confidence errors trigger massive learning
 */

export interface ConfidenceRating {
  itemId: string;
  confidence: number; // 0-100%
  timestamp: Date;
  actualOutcome: 'correct' | 'incorrect' | 'partial';
  rpeValue: number; // Calculated RPE (-1 to +1)
  isHyperCorrection: boolean; // High confidence + error = hyper-correction
}

export interface RPEEvent {
  id: string;
  itemId: string;
  expectedOutcome: number; // 0-1 (probability of success)
  actualOutcome: number; // 0-1 (actual result)
  rpeValue: number; // actual - expected
  confidence: number; // 0-100%
  timestamp: Date;
  dopamineImpact: number; // Estimated dopamine response
  learningValue: number; // How much this event contributes to learning
}

export interface LearningEvent {
  id: string;
  type: 'prediction' | 'retrieval' | 'application' | 'synthesis';
  domain: string;
  confidence: number;
  actualPerformance: number; // 0-100%
  timestamp: Date;
}

export class RewardPredictionErrorService {
  private static instance: RewardPredictionErrorService;
  private storageKey = 'polymathos_rpe_events';
  private confidenceRatings: Map<string, ConfidenceRating> = new Map();

  private constructor() {}

  public static getInstance(): RewardPredictionErrorService {
    if (!RewardPredictionErrorService.instance) {
      RewardPredictionErrorService.instance = new RewardPredictionErrorService();
    }
    return RewardPredictionErrorService.instance;
  }

  /**
   * Record a prediction before checking answer
   * This is critical for RPE calculation
   */
  public recordPrediction(
    itemId: string,
    confidence: number, // 0-100%
    expectedOutcome: 'correct' | 'incorrect' = 'correct'
  ): void {
    const expectedValue = expectedOutcome === 'correct' ? confidence / 100 : (100 - confidence) / 100;
    
    const rating: ConfidenceRating = {
      itemId,
      confidence,
      timestamp: new Date(),
      actualOutcome: 'correct', // Will be updated when answer is checked
      rpeValue: 0, // Will be calculated
      isHyperCorrection: false, // Will be determined
    };

    this.confidenceRatings.set(itemId, rating);
  }

  /**
   * Process the actual outcome and calculate RPE
   * This is where the magic happens - RPE drives learning
   */
  public processOutcome(
    itemId: string,
    actualOutcome: 'correct' | 'incorrect' | 'partial',
    performanceScore?: number // 0-100% for partial
  ): RPEEvent | null {
    const rating = this.confidenceRatings.get(itemId);
    if (!rating) {
      console.warn(`No prediction found for item ${itemId}`);
      return null;
    }

    // Calculate expected outcome (0-1)
    const expectedValue = rating.confidence / 100;
    
    // Calculate actual outcome (0-1)
    let actualValue: number;
    if (actualOutcome === 'correct') {
      actualValue = 1.0;
    } else if (actualOutcome === 'incorrect') {
      actualValue = 0.0;
    } else {
      actualValue = (performanceScore || 50) / 100;
    }

    // Calculate RPE: actual - expected
    const rpeValue = actualValue - expectedValue;

    // Determine if this is a hyper-correction event
    // High confidence (>=70%) + error = massive learning opportunity
    const isHyperCorrection = rating.confidence >= 70 && actualOutcome === 'incorrect';

    // Calculate dopamine impact
    // Positive RPE → dopamine burst
    // Negative RPE → dopamine dip (but triggers attention via norepinephrine)
    // Hyper-correction → massive negative RPE → huge learning signal
    let dopamineImpact: number;
    if (isHyperCorrection) {
      dopamineImpact = -0.8; // Massive negative RPE for hyper-correction
    } else if (rpeValue > 0.2) {
      dopamineImpact = 0.7; // Strong positive RPE
    } else if (rpeValue > 0) {
      dopamineImpact = 0.3; // Moderate positive RPE
    } else if (rpeValue < -0.2) {
      dopamineImpact = -0.5; // Strong negative RPE
    } else {
      dopamineImpact = -0.1; // Mild negative RPE
    }

    // Calculate learning value
    // Hyper-correction events have highest learning value
    // Positive RPE also valuable (reinforcement)
    // Zero RPE has minimal learning value
    let learningValue: number;
    if (isHyperCorrection) {
      learningValue = 1.0; // Maximum learning from hyper-correction
    } else if (Math.abs(rpeValue) > 0.3) {
      learningValue = 0.8; // High learning from large RPE
    } else if (Math.abs(rpeValue) > 0.1) {
      learningValue = 0.5; // Moderate learning
    } else {
      learningValue = 0.1; // Minimal learning (as expected)
    }

    const event: RPEEvent = {
      id: `rpe_${Date.now()}_${itemId}`,
      itemId,
      expectedOutcome: expectedValue,
      actualOutcome: actualValue,
      rpeValue,
      confidence: rating.confidence,
      timestamp: new Date(),
      dopamineImpact,
      learningValue,
    };

    // Update rating
    rating.actualOutcome = actualOutcome;
    rating.rpeValue = rpeValue;
    rating.isHyperCorrection = isHyperCorrection;

    // Save event
    this.saveEvent(event);

    return event;
  }

  /**
   * Get RPE statistics for a domain or time period
   */
  public getRPEStatistics(
    domain?: string,
    days?: number
  ): {
    totalEvents: number;
    averageRPE: number;
    positiveRPECount: number;
    negativeRPECount: number;
    hyperCorrectionCount: number;
    averageConfidence: number;
    averageLearningValue: number;
    dopamineBalance: number; // Sum of dopamine impacts
  } {
    const events = this.getEvents(domain, days);
    
    if (events.length === 0) {
      return {
        totalEvents: 0,
        averageRPE: 0,
        positiveRPECount: 0,
        negativeRPECount: 0,
        hyperCorrectionCount: 0,
        averageConfidence: 0,
        averageLearningValue: 0,
        dopamineBalance: 0,
      };
    }

    const positiveRPE = events.filter(e => e.rpeValue > 0);
    const negativeRPE = events.filter(e => e.rpeValue < 0);
    const hyperCorrections = events.filter(e => {
      const rating = this.confidenceRatings.get(e.itemId);
      return rating?.isHyperCorrection || false;
    });

    const averageRPE = events.reduce((sum, e) => sum + e.rpeValue, 0) / events.length;
    const averageConfidence = events.reduce((sum, e) => sum + e.confidence, 0) / events.length;
    const averageLearningValue = events.reduce((sum, e) => sum + e.learningValue, 0) / events.length;
    const dopamineBalance = events.reduce((sum, e) => sum + e.dopamineImpact, 0);

    return {
      totalEvents: events.length,
      averageRPE: Math.round(averageRPE * 100) / 100,
      positiveRPECount: positiveRPE.length,
      negativeRPECount: negativeRPE.length,
      hyperCorrectionCount: hyperCorrections.length,
      averageConfidence: Math.round(averageConfidence),
      averageLearningValue: Math.round(averageLearningValue * 100) / 100,
      dopamineBalance: Math.round(dopamineBalance * 100) / 100,
    };
  }

  /**
   * Get items that need attention (high-confidence errors, hyper-corrections)
   */
  public getCriticalLearningEvents(limit: number = 10): RPEEvent[] {
    const events = this.getAllEvents();
    
    // Prioritize hyper-corrections and high negative RPE
    return events
      .filter(e => {
        const rating = this.confidenceRatings.get(e.itemId);
        return rating?.isHyperCorrection || e.rpeValue < -0.3;
      })
      .sort((a, b) => {
        // Sort by learning value (highest first)
        if (Math.abs(a.learningValue - b.learningValue) > 0.1) {
          return b.learningValue - a.learningValue;
        }
        // Then by recency
        return b.timestamp.getTime() - a.timestamp.getTime();
      })
      .slice(0, limit);
  }

  /**
   * Generate a reward based on RPE
   * Variable ratio schedules for maximum dopamine impact
   */
  public generateReward(rpeEvent: RPEEvent): {
    shouldReward: boolean;
    rewardType: 'none' | 'small' | 'medium' | 'large' | 'jackpot';
    message: string;
    xpValue: number;
  } {
    // Variable ratio schedule: not every positive RPE gets a reward
    // This maintains uncertainty and keeps dopamine system engaged
    const random = Math.random();
    
    if (rpeEvent.rpeValue > 0.3) {
      // Large positive RPE - higher chance of reward
      if (random < 0.7) {
        return {
          shouldReward: true,
          rewardType: 'large',
          message: '🎯 Exceptional performance! You exceeded expectations!',
          xpValue: 50,
        };
      }
    } else if (rpeEvent.rpeValue > 0.1) {
      // Moderate positive RPE
      if (random < 0.5) {
        return {
          shouldReward: true,
          rewardType: 'medium',
          message: '✨ Great job! Better than expected!',
          xpValue: 25,
        };
      }
    } else if (rpeEvent.rpeValue > 0) {
      // Small positive RPE
      if (random < 0.3) {
        return {
          shouldReward: true,
          rewardType: 'small',
          message: '👍 Good work!',
          xpValue: 10,
        };
      }
    }

    // Hyper-correction: special handling
    const rating = this.confidenceRatings.get(rpeEvent.itemId);
    if (rating?.isHyperCorrection) {
      return {
        shouldReward: true,
        rewardType: 'medium', // Reward for engaging with difficult material
        message: '🧠 Critical Learning Moment! This error will strengthen your understanding.',
        xpValue: 30, // XP for learning from mistakes
      };
    }

    return {
      shouldReward: false,
      rewardType: 'none',
      message: '',
      xpValue: 0,
    };
  }

  /**
   * Get confidence calibration metrics
   * Helps identify overconfidence or underconfidence
   */
  public getConfidenceCalibration(): {
    overconfident: number; // % of high-confidence errors
    underconfident: number; // % of low-confidence successes
    wellCalibrated: number; // % of accurate confidence
    recommendation: string;
  } {
    const events = this.getAllEvents();
    if (events.length === 0) {
      return {
        overconfident: 0,
        underconfident: 0,
        wellCalibrated: 0,
        recommendation: 'Start tracking confidence to improve calibration',
      };
    }

    let overconfident = 0;
    let underconfident = 0;
    let wellCalibrated = 0;

    events.forEach(event => {
      const highConfidence = event.confidence >= 70;
      const lowConfidence = event.confidence <= 30;
      const correct = event.actualOutcome > 0.7;
      const incorrect = event.actualOutcome < 0.3;

      if (highConfidence && incorrect) {
        overconfident++;
      } else if (lowConfidence && correct) {
        underconfident++;
      } else {
        wellCalibrated++;
      }
    });

    const total = events.length;
    const overconfidentPct = (overconfident / total) * 100;
    const underconfidentPct = (underconfident / total) * 100;
    const wellCalibratedPct = (wellCalibrated / total) * 100;

    let recommendation = '';
    if (overconfidentPct > 20) {
      recommendation = 'You tend to be overconfident. Practice more retrieval to identify knowledge gaps.';
    } else if (underconfidentPct > 20) {
      recommendation = 'You tend to underestimate your knowledge. Trust your preparation more.';
    } else {
      recommendation = 'Your confidence is well-calibrated! Keep tracking to maintain accuracy.';
    }

    return {
      overconfident: Math.round(overconfidentPct),
      underconfident: Math.round(underconfidentPct),
      wellCalibrated: Math.round(wellCalibratedPct),
      recommendation,
    };
  }

  private getAllEvents(): RPEEvent[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const events = JSON.parse(stored);
      return events.map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp),
      }));
    } catch (error) {
      console.error('Error loading RPE events:', error);
      return [];
    }
  }

  private getEvents(domain?: string, days?: number): RPEEvent[] {
    let events = this.getAllEvents();
    
    if (days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      events = events.filter(e => e.timestamp >= cutoff);
    }

    // Domain filtering would require item metadata - simplified for now
    return events;
  }

  private saveEvent(event: RPEEvent): void {
    let events = this.getAllEvents();
    events.push(event);
    
    // Keep only last 1000 events to prevent storage bloat
    if (events.length > 1000) {
      events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      events = events.slice(0, 1000);
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(events));
    } catch (error) {
      console.error('Error saving RPE event:', error);
    }
  }
}

