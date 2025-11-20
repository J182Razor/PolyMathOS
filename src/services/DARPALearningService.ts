/**
 * DARPA-Style Problem-First Learning Service
 * Implements DARPA Digital Tutor principles for accelerated learning
 * 
 * Research Basis: Project 144 Section 5.1
 * - DARPA Digital Tutor achieved 2.81 sigma improvement
 * - Problem-first approach (not lecture-first)
 * - Knowledge tracing to identify misconceptions
 * - Spiral curriculum with reiterative elaboration
 * - Just-in-time scaffolding
 * 
 * Protocol:
 * 1. Problem First: Attempt real-world problem before reading
 * 2. Failure Analysis: Identify precise knowledge gap
 * 3. Targeted Acquisition: Fill specific gap
 * 4. Simulation: Teach concept (Feynman Technique)
 */

export interface DARPAProblem {
  id: string;
  domain: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  solution?: string;
  hints: string[];
  scaffolding: ScaffoldingLevel[];
}

export interface ScaffoldingLevel {
  level: number;
  hint: string;
  resource?: string;
  concept?: string;
}

export interface DARPASession {
  id: string;
  problemId: string;
  startTime: Date;
  endTime?: Date;
  attempts: ProblemAttempt[];
  knowledgeGaps: KnowledgeGap[];
  conceptsLearned: string[];
  feynmanExplanation?: string;
  status: 'attempting' | 'analyzing' | 'learning' | 'teaching' | 'completed';
}

export interface ProblemAttempt {
  id: string;
  timestamp: Date;
  approach: string;
  result: 'success' | 'partial' | 'failure';
  identifiedGaps: string[];
  usedScaffolding: number;
}

export interface KnowledgeGap {
  id: string;
  concept: string;
  identifiedAt: Date;
  resolvedAt?: Date;
  resourcesUsed: string[];
  understandingLevel: number; // 0-100%
}

export class DARPALearningService {
  private static instance: DARPALearningService;
  private storageKey = 'polymathos_darpa_sessions';
  private currentSession: DARPASession | null = null;

  private problems: DARPAProblem[] = [
    {
      id: 'translate_paragraph',
      domain: 'Language Learning',
      title: 'Translate a Paragraph',
      description: 'Translate the following paragraph from Spanish to English: "El sistema de aprendizaje basado en problemas es más efectivo que la memorización pasiva."',
      difficulty: 'beginner',
      prerequisites: ['Basic Spanish vocabulary', 'Grammar rules'],
      hints: [
        'Break down the sentence into parts',
        'Identify verb conjugations',
        'Look for cognates (similar words)',
      ],
      scaffolding: [
        {
          level: 1,
          hint: 'Start by identifying the subject: "El sistema"',
          concept: 'Subject identification',
        },
        {
          level: 2,
          hint: 'The verb "es" means "is" in English',
          concept: 'Verb "ser" (to be)',
        },
        {
          level: 3,
          hint: '"basado en" means "based on"',
          concept: 'Past participles',
        },
      ],
    },
    {
      id: 'debug_code',
      domain: 'Programming',
      title: 'Debug a Function',
      description: 'This function should calculate the factorial of a number, but it has a bug. Find and fix it:\n\nfunction factorial(n) {\n  if (n === 0) return 1;\n  return n * factorial(n - 1);\n}',
      difficulty: 'intermediate',
      prerequisites: ['Recursion', 'Base cases'],
      hints: [
        'What happens with negative numbers?',
        'Check the base case',
        'Consider edge cases',
      ],
      scaffolding: [
        {
          level: 1,
          hint: 'Test the function with n = -1',
          concept: 'Input validation',
        },
        {
          level: 2,
          hint: 'The function needs to handle negative inputs',
          concept: 'Edge case handling',
        },
      ],
    },
    {
      id: 'solve_equation',
      domain: 'Mathematics',
      title: 'Solve Quadratic Equation',
      description: 'Solve for x: 2x² + 5x - 3 = 0',
      difficulty: 'beginner',
      prerequisites: ['Quadratic formula', 'Factoring'],
      hints: [
        'Use the quadratic formula: x = (-b ± √(b²-4ac)) / 2a',
        'Identify a, b, and c',
        'Calculate the discriminant first',
      ],
      scaffolding: [
        {
          level: 1,
          hint: 'a = 2, b = 5, c = -3',
          concept: 'Coefficient identification',
        },
        {
          level: 2,
          hint: 'Discriminant = b² - 4ac = 25 - 4(2)(-3) = 49',
          concept: 'Discriminant calculation',
        },
        {
          level: 3,
          hint: 'x = (-5 ± 7) / 4',
          concept: 'Quadratic formula application',
        },
      ],
    },
  ];

  private constructor() {}

  public static getInstance(): DARPALearningService {
    if (!DARPALearningService.instance) {
      DARPALearningService.instance = new DARPALearningService();
    }
    return DARPALearningService.instance;
  }

  /**
   * Get available problems for a domain
   */
  public getProblems(domain?: string, difficulty?: string): DARPAProblem[] {
    let filtered = this.problems;

    if (domain) {
      filtered = filtered.filter(p => p.domain === domain);
    }

    if (difficulty) {
      filtered = filtered.filter(p => p.difficulty === difficulty);
    }

    return filtered;
  }

  /**
   * Start a problem-first learning session
   * Step 1: Problem First - Attempt before reading
   */
  public startProblemSession(problemId: string): DARPASession {
    const problem = this.problems.find(p => p.id === problemId);
    if (!problem) {
      throw new Error('Problem not found');
    }

    const session: DARPASession = {
      id: `darpa_${Date.now()}`,
      problemId,
      startTime: new Date(),
      attempts: [],
      knowledgeGaps: [],
      conceptsLearned: [],
      status: 'attempting',
    };

    this.currentSession = session;
    this.saveSession(session);

    return session;
  }

  /**
   * Record an attempt at solving the problem
   */
  public recordAttempt(
    approach: string,
    result: 'success' | 'partial' | 'failure',
    identifiedGaps: string[],
    usedScaffolding: number = 0
  ): ProblemAttempt {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    const attempt: ProblemAttempt = {
      id: `attempt_${Date.now()}`,
      timestamp: new Date(),
      approach,
      result,
      identifiedGaps,
      usedScaffolding,
    };

    this.currentSession.attempts.push(attempt);

    // If failure, move to analysis phase
    if (result === 'failure' || result === 'partial') {
      this.currentSession.status = 'analyzing';
      identifiedGaps.forEach(gap => this.addKnowledgeGap(gap));
    } else if (result === 'success') {
      this.currentSession.status = 'teaching';
    }

    this.saveSession(this.currentSession);
    return attempt;
  }

  /**
   * Step 2: Failure Analysis - Identify precise gap
   */
  public addKnowledgeGap(concept: string): KnowledgeGap {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    const gap: KnowledgeGap = {
      id: `gap_${Date.now()}`,
      concept,
      identifiedAt: new Date(),
      resourcesUsed: [],
      understandingLevel: 0,
    };

    this.currentSession.knowledgeGaps.push(gap);
    this.saveSession(this.currentSession);

    return gap;
  }

  /**
   * Step 3: Targeted Acquisition - Fill specific gap
   */
  public resolveKnowledgeGap(
    gapId: string,
    resourcesUsed: string[],
    understandingLevel: number
  ): void {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    const gap = this.currentSession.knowledgeGaps.find(g => g.id === gapId);
    if (!gap) {
      throw new Error('Knowledge gap not found');
    }

    gap.resolvedAt = new Date();
    gap.resourcesUsed = resourcesUsed;
    gap.understandingLevel = understandingLevel;

    if (!this.currentSession.conceptsLearned.includes(gap.concept)) {
      this.currentSession.conceptsLearned.push(gap.concept);
    }

    this.currentSession.status = 'learning';
    this.saveSession(this.currentSession);
  }

  /**
   * Step 4: Simulation - Feynman Technique (teach the concept)
   */
  public submitFeynmanExplanation(explanation: string): {
    quality: number;
    feedback: string[];
  } {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    this.currentSession.feynmanExplanation = explanation;
    this.currentSession.status = 'completed';
    this.currentSession.endTime = new Date();

    // Analyze explanation quality
    const wordCount = explanation.split(' ').length;
    const hasSimpleLanguage = !explanation.match(/\b(complex|sophisticated|intricate)\b/i);
    const hasAnalogies = explanation.match(/\b(like|similar to|as if|imagine)\b/i);
    const hasExamples = explanation.match(/\b(for example|such as|instance)\b/i);

    let quality = 50; // Base score
    if (wordCount > 50) quality += 20;
    if (hasSimpleLanguage) quality += 15;
    if (hasAnalogies) quality += 10;
    if (hasExamples) quality += 5;

    quality = Math.min(100, quality);

    const feedback: string[] = [];
    if (wordCount < 30) {
      feedback.push('Try to explain in more detail (aim for 50+ words)');
    }
    if (!hasSimpleLanguage) {
      feedback.push('Use simpler language - explain as if teaching a 12-year-old');
    }
    if (!hasAnalogies) {
      feedback.push('Add analogies to make concepts more relatable');
    }
    if (!hasExamples) {
      feedback.push('Include concrete examples to illustrate the concept');
    }

    if (quality >= 80) {
      feedback.push('Excellent explanation! You truly understand the concept.');
    }

    this.saveSession(this.currentSession);
    return { quality, feedback };
  }

  /**
   * Get scaffolding hint for current problem
   */
  public getScaffolding(level: number): ScaffoldingLevel | null {
    if (!this.currentSession) {
      return null;
    }

    const problem = this.problems.find(p => p.id === this.currentSession!.problemId);
    if (!problem) {
      return null;
    }

    return problem.scaffolding.find(s => s.level === level) || null;
  }

  /**
   * Get current session
   */
  public getCurrentSession(): DARPASession | null {
    return this.currentSession;
  }

  /**
   * Get session statistics
   */
  public getStatistics(days: number = 7): {
    totalSessions: number;
    problemsAttempted: number;
    problemsSolved: number;
    averageAttempts: number;
    conceptsLearned: number;
    knowledgeGapsIdentified: number;
    feynmanQuality: number;
  } {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const sessions = this.getSessions().filter(s => s.startTime >= cutoff);

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        problemsAttempted: 0,
        problemsSolved: 0,
        averageAttempts: 0,
        conceptsLearned: 0,
        knowledgeGapsIdentified: 0,
        feynmanQuality: 0,
      };
    }

    const problemsSolved = sessions.filter(s => s.status === 'completed').length;
    const totalAttempts = sessions.reduce((sum, s) => sum + s.attempts.length, 0);
    const totalConcepts = sessions.reduce((sum, s) => sum + s.conceptsLearned.length, 0);
    const totalGaps = sessions.reduce((sum, s) => sum + s.knowledgeGaps.length, 0);

    // Calculate average Feynman quality (simplified)
    const completedSessions = sessions.filter(s => s.feynmanExplanation);
    const feynmanQuality =
      completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => {
            const explanation = s.feynmanExplanation || '';
            const wordCount = explanation.split(' ').length;
            return sum + Math.min(100, 50 + wordCount);
          }, 0) / completedSessions.length
        : 0;

    return {
      totalSessions: sessions.length,
      problemsAttempted: sessions.length,
      problemsSolved,
      averageAttempts: Math.round(totalAttempts / sessions.length),
      conceptsLearned: totalConcepts,
      knowledgeGapsIdentified: totalGaps,
      feynmanQuality: Math.round(feynmanQuality),
    };
  }

  private getSessions(): DARPASession[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];

      const sessions = JSON.parse(stored);
      return sessions.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: s.endTime ? new Date(s.endTime) : undefined,
        attempts: s.attempts.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp),
        })),
        knowledgeGaps: s.knowledgeGaps.map((g: any) => ({
          ...g,
          identifiedAt: new Date(g.identifiedAt),
          resolvedAt: g.resolvedAt ? new Date(g.resolvedAt) : undefined,
        })),
      }));
    } catch (error) {
      console.error('Error loading DARPA sessions:', error);
      return [];
    }
  }

  private saveSession(session: DARPASession): void {
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
      console.error('Error saving DARPA session:', error);
    }
  }
}

