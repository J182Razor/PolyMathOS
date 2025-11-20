/**
 * Interleaving Practice Service
 * Implements research-based interleaving for superior long-term retention
 * 
 * Research Basis:
 * - Mixing different topics/problems improves discrimination and retention
 * - While interleaving feels harder, it enhances long-term learning
 * - Prevents mental autopilot and forces cognitive flexibility
 * 
 * Based on Project 144 Section 10.3 and Polymath OS Section 4
 */

export interface InterleavingSession {
  id: string;
  domains: string[];
  topics: string[];
  startTime: Date;
  endTime?: Date;
  itemsCompleted: number;
  itemsCorrect: number;
  switchingCount: number;
}

export interface InterleavingItem {
  id: string;
  domain: string;
  topic: string;
  type: 'flashcard' | 'problem' | 'recall' | 'application';
  content: string;
  answer?: string;
  completed: boolean;
  correct?: boolean;
  timeSpent: number; // seconds
}

export interface InterleavingPlan {
  sessionId: string;
  totalDuration: number; // minutes
  segments: InterleavingSegment[];
  estimatedItems: number;
}

export interface InterleavingSegment {
  domain: string;
  topic: string;
  duration: number; // minutes
  itemCount: number;
  type: 'flashcard' | 'problem' | 'recall' | 'application';
}

export class InterleavingService {
  private static instance: InterleavingService;
  private storageKey = 'polymathos_interleaving_sessions';
  private currentSession: InterleavingSession | null = null;
  private currentItems: InterleavingItem[] = [];

  private constructor() {}

  public static getInstance(): InterleavingService {
    if (!InterleavingService.instance) {
      InterleavingService.instance = new InterleavingService();
    }
    return InterleavingService.instance;
  }

  /**
   * Create an interleaving plan for 3×3 daily loop
   * Based on Polymath OS Section 4 - The "Polymath 3×3" Daily Loop
   */
  public create3x3Plan(
    primaryDomain: string,
    secondaryDomainA: string,
    secondaryDomainB: string,
    totalDuration: number = 60 // minutes
  ): InterleavingPlan {
    const segmentDuration = Math.floor(totalDuration / 5); // 5 segments: warmup, 3 main, cooldown

    const segments: InterleavingSegment[] = [
      {
        domain: secondaryDomainA,
        topic: 'Review',
        duration: 5, // Warm-up
        itemCount: 5,
        type: 'recall',
      },
      {
        domain: primaryDomain,
        topic: 'Deep Practice',
        duration: segmentDuration,
        itemCount: 10,
        type: 'problem',
      },
      {
        domain: secondaryDomainA,
        topic: 'Encoding & Review',
        duration: segmentDuration,
        itemCount: 8,
        type: 'flashcard',
      },
      {
        domain: secondaryDomainB,
        topic: 'Synthesis',
        duration: segmentDuration,
        itemCount: 6,
        type: 'application',
      },
      {
        domain: 'Meta-Learning',
        topic: 'Reflection',
        duration: 5, // Cool-down
        itemCount: 2,
        type: 'recall',
      },
    ];

    const estimatedItems = segments.reduce((sum, seg) => sum + seg.itemCount, 0);

    return {
      sessionId: `interleave_${Date.now()}`,
      totalDuration,
      segments,
      estimatedItems,
    };
  }

  /**
   * Start an interleaving session
   */
  public startSession(plan: InterleavingPlan): InterleavingSession {
    const session: InterleavingSession = {
      id: plan.sessionId,
      domains: [...new Set(plan.segments.map(s => s.domain))],
      topics: [...new Set(plan.segments.map(s => s.topic))],
      startTime: new Date(),
      itemsCompleted: 0,
      itemsCorrect: 0,
      switchingCount: 0,
    };

    this.currentSession = session;
    this.currentItems = [];

    // Generate items for each segment
    plan.segments.forEach((segment, segmentIndex) => {
      for (let i = 0; i < segment.itemCount; i++) {
        const item: InterleavingItem = {
          id: `${segment.domain}_${segment.topic}_${i}`,
          domain: segment.domain,
          topic: segment.topic,
          type: segment.type,
          content: `Item ${i + 1} from ${segment.domain} - ${segment.topic}`,
          completed: false,
          timeSpent: 0,
        };
        this.currentItems.push(item);
      }
    });

    // Shuffle items to create interleaving effect
    this.shuffleItems();

    this.saveSession(session);
    return session;
  }

  /**
   * Get next item in interleaved sequence
   */
  public getNextItem(): InterleavingItem | null {
    return this.currentItems.find(item => !item.completed) || null;
  }

  /**
   * Complete an item and switch context
   */
  public completeItem(
    itemId: string,
    correct: boolean,
    timeSpent: number
  ): {
    item: InterleavingItem;
    switchedDomain: boolean;
    sessionComplete: boolean;
  } {
    const item = this.currentItems.find(i => i.id === itemId);
    if (!item || !this.currentSession) {
      throw new Error('Item or session not found');
    }

    item.completed = true;
    item.correct = correct;
    item.timeSpent = timeSpent;

    this.currentSession.itemsCompleted++;
    if (correct) {
      this.currentSession.itemsCorrect++;
    }

    // Check if we're switching domains
    const nextItem = this.getNextItem();
    const switchedDomain = nextItem && nextItem.domain !== item.domain;

    if (switchedDomain) {
      this.currentSession.switchingCount++;
    }

    const sessionComplete = !nextItem;

    if (sessionComplete) {
      this.endSession();
    } else {
      this.saveSession(this.currentSession);
    }

    return {
      item,
      switchedDomain: switchedDomain || false,
      sessionComplete,
    };
  }

  /**
   * End current session
   */
  public endSession(): InterleavingSession | null {
    if (!this.currentSession) return null;

    this.currentSession.endTime = new Date();
    const duration = Math.floor(
      (this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime()) / 1000 / 60
    );

    this.saveSession(this.currentSession);
    this.currentSession = null;
    this.currentItems = [];

    return this.currentSession;
  }

  /**
   * Get interleaving statistics
   */
  public getStatistics(days: number = 7): {
    totalSessions: number;
    averageAccuracy: number;
    averageSwitchingCount: number;
    domainsPracticed: string[];
    totalItemsCompleted: number;
    interleavingEffectiveness: number; // Higher switching = more effective
  } {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const sessions = this.getSessions().filter(s => s.startTime >= cutoff);

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageAccuracy: 0,
        averageSwitchingCount: 0,
        domainsPracticed: [],
        totalItemsCompleted: 0,
        interleavingEffectiveness: 0,
      };
    }

    const totalItems = sessions.reduce((sum, s) => sum + s.itemsCompleted, 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + s.itemsCorrect, 0);
    const averageAccuracy = (totalCorrect / totalItems) * 100;
    const averageSwitchingCount =
      sessions.reduce((sum, s) => sum + s.switchingCount, 0) / sessions.length;

    const domainsSet = new Set<string>();
    sessions.forEach(s => s.domains.forEach(d => domainsSet.add(d)));

    // Interleaving effectiveness: ratio of switches to items
    // Higher ratio = more interleaving = better long-term retention
    const totalSwitches = sessions.reduce((sum, s) => sum + s.switchingCount, 0);
    const interleavingEffectiveness = totalItems > 0 ? (totalSwitches / totalItems) * 100 : 0;

    return {
      totalSessions: sessions.length,
      averageAccuracy: Math.round(averageAccuracy),
      averageSwitchingCount: Math.round(averageSwitchingCount),
      domainsPracticed: Array.from(domainsSet),
      totalItemsCompleted: totalItems,
      interleavingEffectiveness: Math.round(interleavingEffectiveness),
    };
  }

  /**
   * Get current session progress
   */
  public getCurrentProgress(): {
    completed: number;
    total: number;
    currentDomain: string | null;
    nextDomain: string | null;
    progress: number;
  } | null {
    if (!this.currentSession) return null;

    const completed = this.currentItems.filter(i => i.completed).length;
    const total = this.currentItems.length;
    const currentItem = this.getNextItem();

    const nextItem = this.currentItems.find(
      (item, index) => index > this.currentItems.findIndex(i => i.id === currentItem?.id) && !item.completed
    );

    return {
      completed,
      total,
      currentDomain: currentItem?.domain || null,
      nextDomain: nextItem?.domain || null,
      progress: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  /**
   * Shuffle items to create interleaving effect
   * Maintains some structure while ensuring domain switching
   */
  private shuffleItems(): void {
    // Group by domain
    const byDomain = new Map<string, InterleavingItem[]>();
    this.currentItems.forEach(item => {
      if (!byDomain.has(item.domain)) {
        byDomain.set(item.domain, []);
      }
      byDomain.get(item.domain)!.push(item);
    });

    // Interleave: take one from each domain in rotation
    const shuffled: InterleavingItem[] = [];
    const domainArrays = Array.from(byDomain.values());
    const maxLength = Math.max(...domainArrays.map(arr => arr.length));

    for (let i = 0; i < maxLength; i++) {
      domainArrays.forEach(domainItems => {
        if (i < domainItems.length) {
          shuffled.push(domainItems[i]);
        }
      });
    }

    this.currentItems = shuffled;
  }

  private getSessions(): InterleavingSession[] {
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
      console.error('Error loading interleaving sessions:', error);
      return [];
    }
  }

  private saveSession(session: InterleavingSession): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === session.id);

    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }

    // Keep only last 100 sessions
    if (sessions.length > 100) {
      sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
      sessions.splice(100);
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving interleaving session:', error);
    }
  }
}

