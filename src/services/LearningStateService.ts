/**
 * Learning State Service
 * Manages optimal learning states (Alpha/Theta) and neurofeedback
 * Based on Project 144 research on state-dependent learning
 * 
 * Alpha Waves (8-12 Hz): Calm, receptive mind - "Superlearning" state
 * Theta Waves (4-8 Hz): Hypnagogic state, deep meditation, memory consolidation
 */

export interface LearningState {
  currentState: 'beta' | 'alpha' | 'theta' | 'transition';
  stateStartTime: Date;
  duration: number; // seconds
  quality: number; // 0-100% (how well user is in the state)
}

export interface StateTransition {
  from: string;
  to: string;
  timestamp: Date;
  method: 'binaural' | 'breathing' | 'meditation' | 'natural';
}

export interface StateSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  targetState: 'alpha' | 'theta';
  achievedState?: 'alpha' | 'theta';
  duration: number;
  activities: string[];
  quality: number;
}

export class LearningStateService {
  private static instance: LearningStateService;
  private storageKey = 'polymathos_learning_states';
  private currentState: LearningState | null = null;
  private stateHistory: StateTransition[] = [];

  private constructor() {}

  public static getInstance(): LearningStateService {
    if (!LearningStateService.instance) {
      LearningStateService.instance = new LearningStateService();
    }
    return LearningStateService.instance;
  }

  /**
   * Initialize Alpha state for reading/data intake
   * Alpha (8-12 Hz) is optimal for receptive learning
   */
  public initiateAlphaState(activity: string = 'reading'): LearningState {
    const state: LearningState = {
      currentState: 'alpha',
      stateStartTime: new Date(),
      duration: 0,
      quality: 75, // Default quality, will be adjusted
    };

    this.currentState = state;
    this.recordTransition('beta', 'alpha', 'natural');
    
    return state;
  }

  /**
   * Initialize Theta state for visualization/memory work
   * Theta (4-8 Hz) is optimal for Image Streaming and Memory Palace construction
   */
  public initiateThetaState(activity: string = 'visualization'): LearningState {
    const state: LearningState = {
      currentState: 'theta',
      stateStartTime: new Date(),
      duration: 0,
      quality: 75,
    };

    this.currentState = state;
    this.recordTransition(this.currentState?.currentState || 'beta', 'theta', 'natural');
    
    return state;
  }

  /**
   * Use binaural beats to transition to target state
   */
  public useBinauralBeats(targetState: 'alpha' | 'theta'): {
    frequency: number;
    duration: number;
    instructions: string;
  } {
    const frequency = targetState === 'alpha' ? 10 : 6; // Hz
    const duration = targetState === 'alpha' ? 300 : 600; // seconds

    const instructions = targetState === 'alpha'
      ? 'Listen to 10Hz binaural beats for 5 minutes. This will help you enter a calm, receptive learning state.'
      : 'Listen to 6Hz binaural beats for 10 minutes. This will help you enter a deep, creative state for visualization.';

    this.recordTransition(this.currentState?.currentState || 'beta', targetState, 'binaural');

    return {
      frequency,
      duration,
      instructions,
    };
  }

  /**
   * Use PhotoReading's "Soft Focus" technique
   * Diverging eyes to engage peripheral vision triggers parasympathetic response
   */
  public initiateSoftFocus(): {
    instructions: string;
    duration: number;
  } {
    this.recordTransition(this.currentState?.currentState || 'beta', 'alpha', 'breathing');

    return {
      instructions: 'Gently diverge your eyes to engage peripheral vision. Let your focus soften. This triggers a natural Alpha state.',
      duration: 120, // 2 minutes
    };
  }

  /**
   * Update state quality based on user feedback or metrics
   */
  public updateStateQuality(quality: number): void {
    if (this.currentState) {
      this.currentState.quality = Math.max(0, Math.min(100, quality));
    }
  }

  /**
   * Get current state
   */
  public getCurrentState(): LearningState | null {
    if (this.currentState) {
      const now = new Date();
      this.currentState.duration = Math.floor(
        (now.getTime() - this.currentState.stateStartTime.getTime()) / 1000
      );
    }
    return this.currentState;
  }

  /**
   * End current state and return to beta (normal waking state)
   */
  public endState(): void {
    if (this.currentState) {
      this.recordTransition(this.currentState.currentState, 'beta', 'natural');
      this.currentState = null;
    }
  }

  /**
   * Get state recommendations for activity type
   */
  public getStateRecommendation(activity: string): {
    recommendedState: 'alpha' | 'theta' | 'beta';
    reason: string;
    method: string;
  } {
    const activityLower = activity.toLowerCase();

    if (activityLower.includes('read') || activityLower.includes('study') || activityLower.includes('intake')) {
      return {
        recommendedState: 'alpha',
        reason: 'Alpha state (8-12 Hz) is optimal for receptive learning and information intake',
        method: 'Use 10Hz binaural beats or Soft Focus technique',
      };
    }

    if (activityLower.includes('visual') || activityLower.includes('memory') || activityLower.includes('palace') || activityLower.includes('stream')) {
      return {
        recommendedState: 'theta',
        reason: 'Theta state (4-8 Hz) is optimal for visualization, Image Streaming, and Memory Palace construction',
        method: 'Use 6Hz binaural beats or meditation',
      };
    }

    if (activityLower.includes('problem') || activityLower.includes('solve') || activityLower.includes('practice')) {
      return {
        recommendedState: 'beta',
        reason: 'Beta state (normal waking) is optimal for active problem-solving and practice',
        method: 'No state change needed',
      };
    }

    return {
      recommendedState: 'alpha',
      reason: 'Alpha state provides a good balance for most learning activities',
      method: 'Use 10Hz binaural beats',
    };
  }

  /**
   * Track state session for analytics
   */
  public startStateSession(targetState: 'alpha' | 'theta', activity: string): StateSession {
    const session: StateSession = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      targetState,
      duration: 0,
      activities: [activity],
      quality: 0,
    };

    this.saveSession(session);
    return session;
  }

  public endStateSession(sessionId: string, achievedState?: 'alpha' | 'theta', quality?: number): void {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.id === sessionId);
    
    if (session) {
      session.endTime = new Date();
      session.duration = Math.floor(
        (session.endTime.getTime() - session.startTime.getTime()) / 1000
      );
      session.achievedState = achievedState;
      if (quality !== undefined) {
        session.quality = quality;
      }
      this.saveSession(session);
    }
  }

  /**
   * Get state statistics
   */
  public getStateStatistics(days: number = 7): {
    totalSessions: number;
    averageDuration: number;
    alphaSessions: number;
    thetaSessions: number;
    averageQuality: number;
    preferredState: 'alpha' | 'theta';
  } {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const sessions = this.getSessions().filter(s => s.startTime >= cutoff);

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageDuration: 0,
        alphaSessions: 0,
        thetaSessions: 0,
        averageQuality: 0,
        preferredState: 'alpha',
      };
    }

    const alphaSessions = sessions.filter(s => s.targetState === 'alpha').length;
    const thetaSessions = sessions.filter(s => s.targetState === 'theta').length;
    const averageDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
    const averageQuality = sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length;

    return {
      totalSessions: sessions.length,
      averageDuration: Math.round(averageDuration),
      alphaSessions,
      thetaSessions,
      averageQuality: Math.round(averageQuality),
      preferredState: alphaSessions >= thetaSessions ? 'alpha' : 'theta',
    };
  }

  private recordTransition(from: string, to: string, method: string): void {
    const transition: StateTransition = {
      from,
      to,
      timestamp: new Date(),
      method: method as any,
    };

    this.stateHistory.push(transition);
    
    // Keep only last 100 transitions
    if (this.stateHistory.length > 100) {
      this.stateHistory = this.stateHistory.slice(-100);
    }
  }

  private getSessions(): StateSession[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored);
      return sessions.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: s.endTime ? new Date(s.endTime) : undefined,
      }));
    } catch (error) {
      console.error('Error loading learning state sessions:', error);
      return [];
    }
  }

  private saveSession(session: StateSession): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving learning state session:', error);
    }
  }
}

