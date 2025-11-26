/**
 * Comprehension Tracker Service
 * Tracks multi-dimensional comprehension metrics across the Polymath Stack
 * 
 * Dimensions tracked (based on Bloom's Taxonomy):
 * 1. Memory - Recall ability (FSRS retention rates)
 * 2. Understanding - Concept grasp (Feynman explanation quality)
 * 3. Application - Practical use (Quiz apply-level scores)
 * 4. Analysis - Pattern recognition (Connection finding in Zettelkasten)
 * 5. Synthesis - Cross-domain connection (Mental model integration)
 * 6. Creation - Original work (Project completion, teaching)
 */

import { FSRSService, FSRSStatistics } from './FSRSService';
import { DynamicQuizService, BloomLevel, ComprehensionAnalysis } from './DynamicQuizService';

export type ComprehensionDimension = 
  | 'memory' 
  | 'understanding' 
  | 'application' 
  | 'analysis' 
  | 'synthesis' 
  | 'creation';

export interface DimensionScore {
  dimension: ComprehensionDimension;
  score: number;          // 0-100
  confidence: number;     // 0-1 confidence in this score
  dataPoints: number;     // Number of measurements
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

export interface ComprehensionSnapshot {
  id: string;
  userId: string;
  topic?: string;
  timestamp: Date;
  dimensions: Record<ComprehensionDimension, DimensionScore>;
  overallScore: number;
  overallTrend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
}

export interface LearningEvent {
  id: string;
  userId: string;
  type: 'quiz' | 'feynman' | 'review' | 'zettelkasten' | 'palace' | 'creation';
  topic: string;
  dimension: ComprehensionDimension;
  score: number;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface MasteryGoal {
  id: string;
  userId: string;
  topic: string;
  targetScore: number;
  dimensions: ComprehensionDimension[];
  deadline?: Date;
  currentProgress: number;
  status: 'active' | 'achieved' | 'missed';
  createdAt: Date;
}

export interface ProgressReport {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  studyTimeMinutes: number;
  eventsCount: number;
  dimensionChanges: Record<ComprehensionDimension, number>;
  achievements: string[];
  insights: string[];
  areasForImprovement: string[];
}

// Bloom level to dimension mapping
const BLOOM_TO_DIMENSION: Record<BloomLevel, ComprehensionDimension> = {
  'remember': 'memory',
  'understand': 'understanding',
  'apply': 'application',
  'analyze': 'analysis',
  'evaluate': 'synthesis',
  'create': 'creation'
};

// Dimension weights for overall score
const DIMENSION_WEIGHTS: Record<ComprehensionDimension, number> = {
  memory: 0.15,
  understanding: 0.20,
  application: 0.25,
  analysis: 0.15,
  synthesis: 0.15,
  creation: 0.10
};

export class ComprehensionTrackerService {
  private static instance: ComprehensionTrackerService;
  private fsrsService: FSRSService;
  private quizService: DynamicQuizService;
  
  private snapshots: Map<string, ComprehensionSnapshot[]> = new Map(); // userId -> snapshots
  private events: Map<string, LearningEvent[]> = new Map(); // userId -> events
  private goals: Map<string, MasteryGoal[]> = new Map(); // userId -> goals

  private constructor() {
    this.fsrsService = FSRSService.getInstance();
    this.quizService = DynamicQuizService.getInstance();
    this.loadData();
  }

  public static getInstance(): ComprehensionTrackerService {
    if (!ComprehensionTrackerService.instance) {
      ComprehensionTrackerService.instance = new ComprehensionTrackerService();
    }
    return ComprehensionTrackerService.instance;
  }

  /**
   * Record a learning event
   */
  public recordEvent(event: Omit<LearningEvent, 'id' | 'timestamp'>): LearningEvent {
    const fullEvent: LearningEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date()
    };

    const userEvents = this.events.get(event.userId) || [];
    userEvents.push(fullEvent);
    this.events.set(event.userId, userEvents);
    
    this.saveData();
    return fullEvent;
  }

  /**
   * Record quiz completion and extract comprehension data
   */
  public recordQuizCompletion(
    userId: string,
    topic: string,
    analysis: ComprehensionAnalysis
  ): void {
    // Record events for each Bloom level
    for (const [level, score] of Object.entries(analysis.bloomScores)) {
      const dimension = BLOOM_TO_DIMENSION[level as BloomLevel];
      this.recordEvent({
        userId,
        type: 'quiz',
        topic,
        dimension,
        score,
        metadata: { bloomLevel: level }
      });
    }
  }

  /**
   * Record Feynman session completion
   */
  public recordFeynmanCompletion(
    userId: string,
    topic: string,
    clarityScore: number,
    gapsCount: number
  ): void {
    this.recordEvent({
      userId,
      type: 'feynman',
      topic,
      dimension: 'understanding',
      score: clarityScore,
      metadata: { gapsIdentified: gapsCount }
    });

    // Also contributes to application dimension
    this.recordEvent({
      userId,
      type: 'feynman',
      topic,
      dimension: 'application',
      score: Math.max(0, clarityScore - gapsCount * 5),
      metadata: { type: 'explanation' }
    });
  }

  /**
   * Record Zettelkasten activity
   */
  public recordZettelkastenActivity(
    userId: string,
    topic: string,
    notesCreated: number,
    connectionsCreated: number,
    elaborationScore: number
  ): void {
    // Note creation contributes to understanding
    this.recordEvent({
      userId,
      type: 'zettelkasten',
      topic,
      dimension: 'understanding',
      score: Math.min(elaborationScore, 100),
      metadata: { notesCreated }
    });

    // Connections contribute to analysis and synthesis
    const connectionScore = Math.min(connectionsCreated * 10, 100);
    this.recordEvent({
      userId,
      type: 'zettelkasten',
      topic,
      dimension: 'analysis',
      score: connectionScore,
      metadata: { connectionsCreated }
    });

    this.recordEvent({
      userId,
      type: 'zettelkasten',
      topic,
      dimension: 'synthesis',
      score: connectionScore * 0.8,
      metadata: { connectionsCreated }
    });
  }

  /**
   * Record FSRS review session
   */
  public recordReviewSession(userId: string, topic: string): void {
    const stats = this.fsrsService.getStatistics();
    
    this.recordEvent({
      userId,
      type: 'review',
      topic,
      dimension: 'memory',
      score: stats.averageRetention * 100,
      metadata: { 
        cardsReviewed: stats.reviewsToday,
        streakDays: stats.streakDays
      }
    });
  }

  /**
   * Calculate current comprehension snapshot
   */
  public calculateSnapshot(
    userId: string,
    topic?: string
  ): ComprehensionSnapshot {
    const userEvents = this.events.get(userId) || [];
    const relevantEvents = topic 
      ? userEvents.filter(e => e.topic === topic)
      : userEvents;
    
    // Filter to last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentEvents = relevantEvents.filter(
      e => e.timestamp.getTime() > thirtyDaysAgo
    );

    // Calculate dimension scores
    const dimensions: Record<ComprehensionDimension, DimensionScore> = {} as any;
    const allDimensions: ComprehensionDimension[] = [
      'memory', 'understanding', 'application', 'analysis', 'synthesis', 'creation'
    ];

    for (const dim of allDimensions) {
      const dimEvents = recentEvents.filter(e => e.dimension === dim);
      
      if (dimEvents.length === 0) {
        dimensions[dim] = {
          dimension: dim,
          score: 0,
          confidence: 0,
          dataPoints: 0,
          trend: 'stable',
          lastUpdated: new Date()
        };
        continue;
      }

      // Calculate weighted average (more recent = more weight)
      let weightedSum = 0;
      let weightSum = 0;
      
      dimEvents.forEach((event, i) => {
        const recency = (i + 1) / dimEvents.length;
        const weight = 0.5 + recency * 0.5; // Weights from 0.5 to 1.0
        weightedSum += event.score * weight;
        weightSum += weight;
      });

      const score = Math.round(weightedSum / weightSum);
      
      // Calculate trend
      const firstHalf = dimEvents.slice(0, Math.floor(dimEvents.length / 2));
      const secondHalf = dimEvents.slice(Math.floor(dimEvents.length / 2));
      
      const firstAvg = firstHalf.length > 0 
        ? firstHalf.reduce((s, e) => s + e.score, 0) / firstHalf.length 
        : 0;
      const secondAvg = secondHalf.length > 0
        ? secondHalf.reduce((s, e) => s + e.score, 0) / secondHalf.length
        : 0;
      
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (secondAvg > firstAvg + 5) trend = 'improving';
      else if (secondAvg < firstAvg - 5) trend = 'declining';

      dimensions[dim] = {
        dimension: dim,
        score,
        confidence: Math.min(dimEvents.length / 10, 1), // Max confidence at 10+ data points
        dataPoints: dimEvents.length,
        trend,
        lastUpdated: new Date(Math.max(...dimEvents.map(e => e.timestamp.getTime())))
      };
    }

    // Calculate overall score
    let overallScore = 0;
    for (const dim of allDimensions) {
      overallScore += dimensions[dim].score * DIMENSION_WEIGHTS[dim];
    }
    overallScore = Math.round(overallScore);

    // Determine overall trend
    const trendCounts = { improving: 0, stable: 0, declining: 0 };
    for (const dim of allDimensions) {
      trendCounts[dimensions[dim].trend]++;
    }
    let overallTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (trendCounts.improving > trendCounts.declining + 1) overallTrend = 'improving';
    else if (trendCounts.declining > trendCounts.improving + 1) overallTrend = 'declining';

    // Generate recommendations
    const recommendations = this.generateRecommendations(dimensions);

    const snapshot: ComprehensionSnapshot = {
      id: this.generateId(),
      userId,
      topic,
      timestamp: new Date(),
      dimensions,
      overallScore,
      overallTrend,
      recommendations
    };

    // Store snapshot
    const userSnapshots = this.snapshots.get(userId) || [];
    userSnapshots.push(snapshot);
    // Keep last 100 snapshots per user
    if (userSnapshots.length > 100) {
      userSnapshots.shift();
    }
    this.snapshots.set(userId, userSnapshots);
    
    this.saveData();
    return snapshot;
  }

  /**
   * Generate recommendations based on dimension scores
   */
  private generateRecommendations(
    dimensions: Record<ComprehensionDimension, DimensionScore>
  ): string[] {
    const recommendations: string[] = [];

    // Find weakest dimensions
    const sortedDims = Object.values(dimensions)
      .sort((a, b) => a.score - b.score);

    for (const dim of sortedDims.slice(0, 3)) {
      if (dim.score < 70) {
        switch (dim.dimension) {
          case 'memory':
            recommendations.push('Increase spaced repetition review frequency');
            if (dim.dataPoints < 5) {
              recommendations.push('Create more flashcards for active recall');
            }
            break;
          case 'understanding':
            recommendations.push('Practice Feynman Technique to deepen understanding');
            recommendations.push('Create Zettelkasten notes in your own words');
            break;
          case 'application':
            recommendations.push('Focus on practical exercises and real-world problems');
            recommendations.push('Take more application-level quizzes');
            break;
          case 'analysis':
            recommendations.push('Create more connections between concepts in Zettelkasten');
            recommendations.push('Practice pattern recognition exercises');
            break;
          case 'synthesis':
            recommendations.push('Look for connections across different domains');
            recommendations.push('Build mental models that integrate multiple concepts');
            break;
          case 'creation':
            recommendations.push('Create original content or teach others');
            recommendations.push('Work on projects that apply your knowledge');
            break;
        }
      }
    }

    // Check for declining trends
    for (const dim of Object.values(dimensions)) {
      if (dim.trend === 'declining') {
        recommendations.push(`Your ${dim.dimension} is declining - schedule more practice`);
      }
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Set a mastery goal
   */
  public setMasteryGoal(
    userId: string,
    topic: string,
    targetScore: number,
    dimensions: ComprehensionDimension[],
    deadline?: Date
  ): MasteryGoal {
    const goal: MasteryGoal = {
      id: this.generateId(),
      userId,
      topic,
      targetScore,
      dimensions,
      deadline,
      currentProgress: 0,
      status: 'active',
      createdAt: new Date()
    };

    const userGoals = this.goals.get(userId) || [];
    userGoals.push(goal);
    this.goals.set(userId, userGoals);
    
    this.saveData();
    return goal;
  }

  /**
   * Check and update mastery goals
   */
  public updateGoalProgress(userId: string): MasteryGoal[] {
    const userGoals = this.goals.get(userId) || [];
    const snapshot = this.calculateSnapshot(userId);

    for (const goal of userGoals) {
      if (goal.status !== 'active') continue;

      // Calculate progress based on relevant dimensions
      const relevantScores = goal.dimensions.map(d => snapshot.dimensions[d].score);
      const avgScore = relevantScores.reduce((a, b) => a + b, 0) / relevantScores.length;
      
      goal.currentProgress = Math.round((avgScore / goal.targetScore) * 100);

      if (avgScore >= goal.targetScore) {
        goal.status = 'achieved';
      } else if (goal.deadline && new Date() > goal.deadline) {
        goal.status = 'missed';
      }
    }

    this.saveData();
    return userGoals;
  }

  /**
   * Get user's active goals
   */
  public getUserGoals(userId: string): MasteryGoal[] {
    return this.goals.get(userId) || [];
  }

  /**
   * Generate progress report
   */
  public generateProgressReport(
    userId: string,
    period: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): ProgressReport {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const userEvents = this.events.get(userId) || [];
    const periodEvents = userEvents.filter(
      e => e.timestamp >= startDate && e.timestamp <= now
    );

    // Calculate dimension changes
    const userSnapshots = this.snapshots.get(userId) || [];
    const startSnapshot = userSnapshots.find(s => s.timestamp >= startDate);
    const endSnapshot = userSnapshots[userSnapshots.length - 1];

    const dimensionChanges: Record<ComprehensionDimension, number> = {
      memory: 0, understanding: 0, application: 0,
      analysis: 0, synthesis: 0, creation: 0
    };

    if (startSnapshot && endSnapshot) {
      for (const dim of Object.keys(dimensionChanges) as ComprehensionDimension[]) {
        dimensionChanges[dim] = endSnapshot.dimensions[dim].score - startSnapshot.dimensions[dim].score;
      }
    }

    // Generate insights
    const insights: string[] = [];
    const areasForImprovement: string[] = [];
    const achievements: string[] = [];

    for (const [dim, change] of Object.entries(dimensionChanges)) {
      if (change > 10) {
        insights.push(`Your ${dim} improved by ${change}% this ${period}`);
        achievements.push(`${dim} growth champion`);
      } else if (change < -10) {
        areasForImprovement.push(`${dim} decreased by ${Math.abs(change)}%`);
      }
    }

    if (periodEvents.length > 20) {
      achievements.push('Active learner badge');
    }

    return {
      userId,
      period,
      startDate,
      endDate: now,
      studyTimeMinutes: periodEvents.length * 5, // Estimate 5 min per event
      eventsCount: periodEvents.length,
      dimensionChanges,
      achievements,
      insights,
      areasForImprovement
    };
  }

  /**
   * Get comprehension history
   */
  public getComprehensionHistory(
    userId: string,
    limit: number = 30
  ): ComprehensionSnapshot[] {
    const userSnapshots = this.snapshots.get(userId) || [];
    return userSnapshots.slice(-limit);
  }

  // Utility methods
  private generateId(): string {
    return `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveData(): void {
    try {
      const snapshotsData = Array.from(this.snapshots.entries());
      const eventsData = Array.from(this.events.entries());
      const goalsData = Array.from(this.goals.entries());

      localStorage.setItem('polymath_comprehension_snapshots', JSON.stringify(snapshotsData));
      localStorage.setItem('polymath_learning_events', JSON.stringify(eventsData));
      localStorage.setItem('polymath_mastery_goals', JSON.stringify(goalsData));
    } catch (error) {
      console.error('Error saving comprehension data:', error);
    }
  }

  private loadData(): void {
    try {
      const snapshotsData = localStorage.getItem('polymath_comprehension_snapshots');
      const eventsData = localStorage.getItem('polymath_learning_events');
      const goalsData = localStorage.getItem('polymath_mastery_goals');

      if (snapshotsData) {
        const parsed = JSON.parse(snapshotsData);
        for (const [userId, snapshots] of parsed) {
          const restored = snapshots.map((s: any) => ({
            ...s,
            timestamp: new Date(s.timestamp),
            dimensions: Object.fromEntries(
              Object.entries(s.dimensions).map(([k, v]: [string, any]) => [
                k,
                { ...v, lastUpdated: new Date(v.lastUpdated) }
              ])
            )
          }));
          this.snapshots.set(userId, restored);
        }
      }

      if (eventsData) {
        const parsed = JSON.parse(eventsData);
        for (const [userId, events] of parsed) {
          const restored = events.map((e: any) => ({
            ...e,
            timestamp: new Date(e.timestamp)
          }));
          this.events.set(userId, restored);
        }
      }

      if (goalsData) {
        const parsed = JSON.parse(goalsData);
        for (const [userId, goals] of parsed) {
          const restored = goals.map((g: any) => ({
            ...g,
            createdAt: new Date(g.createdAt),
            deadline: g.deadline ? new Date(g.deadline) : undefined
          }));
          this.goals.set(userId, restored);
        }
      }
    } catch (error) {
      console.error('Error loading comprehension data:', error);
    }
  }
}

