/**
 * Feynman Technique Engine Service
 * Based on ptah23/feynman-ai - https://github.com/ptah23/feynman-ai
 * 
 * Implements Richard Feynman's learning technique:
 * 1. Choose a concept
 * 2. Explain it as if teaching to a child
 * 3. Identify gaps and return to source material
 * 4. Simplify and use analogies
 * 
 * Features:
 * - AI acts as different types of "novices" asking questions
 * - Grades explanations on clarity, simplicity, and accuracy
 * - Identifies knowledge gaps for targeted learning
 * - Tracks explanation improvement over iterations
 */

import { LLMService } from './LLMService';

export type TargetAudience = 'child' | 'teenager' | 'adult_novice' | 'expert_other_field';
export type GapSeverity = 'minor' | 'moderate' | 'critical';

export interface FeynmanSession {
  id: string;
  concept: string;
  topic: string;
  targetAudience: TargetAudience;
  iterations: FeynmanIteration[];
  finalAnalysis?: FeynmanAnalysis;
  startedAt: Date;
  completedAt?: Date;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface FeynmanIteration {
  id: string;
  iterationNumber: number;
  explanation: string;
  analysis: FeynmanAnalysis;
  noviceQuestions: NoviceQuestion[];
  userResponses: { questionId: string; response: string }[];
  timestamp: Date;
}

export interface FeynmanAnalysis {
  clarityScore: number;          // 0-100 - How clear is the explanation?
  simplicityScore: number;       // 0-100 - How simple is the language?
  accuracyScore: number;         // 0-100 - How accurate is the information?
  completenessScore: number;     // 0-100 - How complete is the explanation?
  overallScore: number;          // 0-100 - Weighted average
  gapsIdentified: KnowledgeGap[];
  jargonUsed: JargonItem[];
  analogiesUsed: Analogy[];
  strengths: string[];
  suggestions: string[];
  audienceAppropriate: boolean;
}

export interface KnowledgeGap {
  id: string;
  area: string;
  description: string;
  severity: GapSeverity;
  suggestedResources: string[];
  relatedConcepts: string[];
}

export interface JargonItem {
  term: string;
  context: string;
  simpleAlternative?: string;
  necessary: boolean;  // Some jargon is necessary, some should be simplified
}

export interface Analogy {
  concept: string;
  analogy: string;
  effectiveness: 'weak' | 'moderate' | 'strong';
  explanation: string;
}

export interface NoviceQuestion {
  id: string;
  question: string;
  type: 'clarification' | 'deeper' | 'practical' | 'challenge' | 'connection';
  urgency: 'low' | 'medium' | 'high';
  targetedGap?: string; // Links to KnowledgeGap ID
}

// Audience personas for the AI novice
const AUDIENCE_PERSONAS: Record<TargetAudience, {
  name: string;
  description: string;
  vocabulary: string;
  questionStyle: string;
  expectations: string;
}> = {
  child: {
    name: "Curious 10-year-old",
    description: "A bright, curious child with no prior knowledge of the subject",
    vocabulary: "Use only common everyday words. Avoid any technical terms.",
    questionStyle: "Asks 'why' a lot, wants concrete examples, thinks literally",
    expectations: "Explanations should be visual, concrete, and relate to their world (school, family, games)"
  },
  teenager: {
    name: "Curious 15-year-old",
    description: "An intelligent teenager who is genuinely interested but unfamiliar",
    vocabulary: "Can handle moderate complexity but needs jargon explained",
    questionStyle: "Asks about relevance, wants to know 'so what', looks for practical applications",
    expectations: "Explanations should be engaging, relevant to their life, and not condescending"
  },
  adult_novice: {
    name: "Intelligent adult from different field",
    description: "A smart adult professional with no background in this specific area",
    vocabulary: "Can handle sophisticated language but domain-specific terms need explanation",
    questionStyle: "Asks about fundamentals, comparisons to other fields, practical implications",
    expectations: "Explanations should be thorough, logical, and respect their intelligence"
  },
  expert_other_field: {
    name: "Expert from a different domain",
    description: "A domain expert (e.g., biologist learning physics) who wants to understand deeply",
    vocabulary: "Comfortable with complex ideas but unfamiliar with domain-specific terminology",
    questionStyle: "Asks about underlying principles, edge cases, and connections to their field",
    expectations: "Explanations should be precise, discuss limitations, and allow for cross-domain insights"
  }
};

export class FeynmanEngineService {
  private static instance: FeynmanEngineService;
  private llmService: LLMService;
  private sessions: Map<string, FeynmanSession> = new Map();
  private sessionHistory: FeynmanSession[] = [];

  private constructor() {
    this.llmService = LLMService.getInstance();
    this.loadData();
  }

  public static getInstance(): FeynmanEngineService {
    if (!FeynmanEngineService.instance) {
      FeynmanEngineService.instance = new FeynmanEngineService();
    }
    return FeynmanEngineService.instance;
  }

  /**
   * Start a new Feynman session
   */
  public async startSession(
    concept: string,
    topic: string,
    targetAudience: TargetAudience = 'child'
  ): Promise<FeynmanSession> {
    const session: FeynmanSession = {
      id: this.generateId(),
      concept,
      topic,
      targetAudience,
      iterations: [],
      startedAt: new Date(),
      status: 'in_progress'
    };

    this.sessions.set(session.id, session);
    this.saveData();
    return session;
  }

  /**
   * Submit an explanation for analysis
   */
  public async submitExplanation(
    sessionId: string,
    explanation: string
  ): Promise<FeynmanIteration> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    // Analyze the explanation
    const analysis = await this.analyzeExplanation(
      explanation,
      session.concept,
      session.targetAudience
    );

    // Generate novice questions based on analysis
    const noviceQuestions = await this.generateNoviceQuestions(
      explanation,
      analysis,
      session.targetAudience
    );

    const iteration: FeynmanIteration = {
      id: this.generateId(),
      iterationNumber: session.iterations.length + 1,
      explanation,
      analysis,
      noviceQuestions,
      userResponses: [],
      timestamp: new Date()
    };

    session.iterations.push(iteration);
    this.saveData();
    return iteration;
  }

  /**
   * Analyze an explanation using AI
   */
  public async analyzeExplanation(
    explanation: string,
    concept: string,
    audience: TargetAudience
  ): Promise<FeynmanAnalysis> {
    const persona = AUDIENCE_PERSONAS[audience];

    try {
      const prompt = `You are an expert educator analyzing an explanation using the Feynman Technique.

The user is trying to explain "${concept}" to: ${persona.name}
Audience description: ${persona.description}
Vocabulary expectation: ${persona.vocabulary}

EXPLANATION TO ANALYZE:
${explanation}

Analyze this explanation and provide:
1. CLARITY SCORE (0-100): How clear and understandable is it?
2. SIMPLICITY SCORE (0-100): How simple is the language used?
3. ACCURACY SCORE (0-100): How factually correct is it?
4. COMPLETENESS SCORE (0-100): How complete is the explanation?
5. KNOWLEDGE GAPS: What important aspects are missing or unclear?
6. JARGON USED: What technical terms might confuse the audience?
7. ANALOGIES: What analogies were used and how effective are they?
8. STRENGTHS: What did the explainer do well?
9. SUGGESTIONS: How can the explanation be improved?

Respond in JSON format:
{
  "clarityScore": 75,
  "simplicityScore": 60,
  "accuracyScore": 85,
  "completenessScore": 70,
  "gapsIdentified": [
    {
      "area": "Area name",
      "description": "What's missing",
      "severity": "minor|moderate|critical",
      "suggestedResources": ["Resource 1"],
      "relatedConcepts": ["Concept 1"]
    }
  ],
  "jargonUsed": [
    {
      "term": "Technical term",
      "context": "How it was used",
      "simpleAlternative": "Simpler way to say it",
      "necessary": false
    }
  ],
  "analogiesUsed": [
    {
      "concept": "What was being explained",
      "analogy": "The analogy used",
      "effectiveness": "weak|moderate|strong",
      "explanation": "Why it works or doesn't"
    }
  ],
  "strengths": ["Strength 1", "Strength 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "audienceAppropriate": true
}`;

      const response = await this.llmService.generateQuickResponse(prompt);
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Calculate overall score (weighted average)
        const overallScore = Math.round(
          parsed.clarityScore * 0.3 +
          parsed.simplicityScore * 0.25 +
          parsed.accuracyScore * 0.25 +
          parsed.completenessScore * 0.2
        );

        return {
          clarityScore: parsed.clarityScore || 50,
          simplicityScore: parsed.simplicityScore || 50,
          accuracyScore: parsed.accuracyScore || 50,
          completenessScore: parsed.completenessScore || 50,
          overallScore,
          gapsIdentified: (parsed.gapsIdentified || []).map((g: any) => ({
            id: this.generateId(),
            ...g
          })),
          jargonUsed: parsed.jargonUsed || [],
          analogiesUsed: parsed.analogiesUsed || [],
          strengths: parsed.strengths || [],
          suggestions: parsed.suggestions || [],
          audienceAppropriate: parsed.audienceAppropriate ?? true
        };
      }
    } catch (error) {
      console.warn('AI analysis failed:', error);
    }

    // Fallback analysis
    return this.generateFallbackAnalysis(explanation);
  }

  /**
   * Generate novice questions as if the audience is asking
   */
  private async generateNoviceQuestions(
    explanation: string,
    analysis: FeynmanAnalysis,
    audience: TargetAudience
  ): Promise<NoviceQuestion[]> {
    const persona = AUDIENCE_PERSONAS[audience];

    try {
      const gapDescriptions = analysis.gapsIdentified
        .map(g => `- ${g.area}: ${g.description}`)
        .join('\n');

      const prompt = `You are ${persona.name}. ${persona.description}

You just heard this explanation:
${explanation}

Question style: ${persona.questionStyle}

Knowledge gaps to address:
${gapDescriptions || 'None identified'}

Jargon that confused you:
${analysis.jargonUsed.map(j => j.term).join(', ') || 'None'}

Generate 3-5 questions that someone like you would naturally ask.
These should feel authentic to your persona and help the explainer improve.

Question types:
- CLARIFICATION: "What do you mean by...?"
- DEEPER: "But why does...?"
- PRACTICAL: "How would this work in...?"
- CHALLENGE: "But what about...?"
- CONNECTION: "Is this similar to...?"

Respond in JSON:
{
  "questions": [
    {
      "question": "Your question here",
      "type": "clarification|deeper|practical|challenge|connection",
      "urgency": "low|medium|high"
    }
  ]
}`;

      const response = await this.llmService.generateQuickResponse(prompt);
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return (parsed.questions || []).map((q: any) => ({
          id: this.generateId(),
          ...q
        }));
      }
    } catch (error) {
      console.warn('AI question generation failed:', error);
    }

    // Fallback questions
    return this.generateFallbackQuestions(analysis);
  }

  /**
   * Submit a response to a novice question
   */
  public async submitQuestionResponse(
    sessionId: string,
    iterationId: string,
    questionId: string,
    response: string
  ): Promise<{
    feedback: string;
    addressedGap: boolean;
    followUpQuestion?: NoviceQuestion;
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const iteration = session.iterations.find(i => i.id === iterationId);
    if (!iteration) throw new Error(`Iteration ${iterationId} not found`);

    const question = iteration.noviceQuestions.find(q => q.id === questionId);
    if (!question) throw new Error(`Question ${questionId} not found`);

    // Record the response
    iteration.userResponses.push({ questionId, response });

    // Analyze the response
    try {
      const prompt = `A learner is practicing the Feynman Technique.

Original question: ${question.question}
Their response: ${response}

Evaluate:
1. Did they answer the question clearly?
2. Did they successfully simplify the concept?
3. Should there be a follow-up question?

Respond in JSON:
{
  "feedback": "Brief feedback on their answer",
  "addressedGap": true/false,
  "needsFollowUp": true/false,
  "followUpQuestion": "Optional follow-up question if needed"
}`;

      const llmResponse = await this.llmService.generateQuickResponse(prompt);
      const jsonMatch = llmResponse.content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        let followUpQuestion: NoviceQuestion | undefined;
        if (parsed.needsFollowUp && parsed.followUpQuestion) {
          followUpQuestion = {
            id: this.generateId(),
            question: parsed.followUpQuestion,
            type: 'deeper',
            urgency: 'medium'
          };
          iteration.noviceQuestions.push(followUpQuestion);
        }

        this.saveData();
        return {
          feedback: parsed.feedback || 'Response recorded.',
          addressedGap: parsed.addressedGap ?? true,
          followUpQuestion
        };
      }
    } catch (error) {
      console.warn('AI response analysis failed:', error);
    }

    this.saveData();
    return {
      feedback: 'Response recorded. Consider if your explanation would satisfy a curious learner.',
      addressedGap: true
    };
  }

  /**
   * Complete a Feynman session
   */
  public completeSession(sessionId: string): FeynmanSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (session.iterations.length === 0) {
      session.status = 'abandoned';
    } else {
      session.status = 'completed';
      
      // Calculate final analysis as average of all iterations
      const allAnalyses = session.iterations.map(i => i.analysis);
      session.finalAnalysis = {
        clarityScore: Math.round(allAnalyses.reduce((s, a) => s + a.clarityScore, 0) / allAnalyses.length),
        simplicityScore: Math.round(allAnalyses.reduce((s, a) => s + a.simplicityScore, 0) / allAnalyses.length),
        accuracyScore: Math.round(allAnalyses.reduce((s, a) => s + a.accuracyScore, 0) / allAnalyses.length),
        completenessScore: Math.round(allAnalyses.reduce((s, a) => s + a.completenessScore, 0) / allAnalyses.length),
        overallScore: Math.round(allAnalyses.reduce((s, a) => s + a.overallScore, 0) / allAnalyses.length),
        gapsIdentified: this.consolidateGaps(allAnalyses),
        jargonUsed: this.consolidateJargon(allAnalyses),
        analogiesUsed: this.consolidateAnalogies(allAnalyses),
        strengths: [...new Set(allAnalyses.flatMap(a => a.strengths))],
        suggestions: [...new Set(allAnalyses.flatMap(a => a.suggestions))],
        audienceAppropriate: allAnalyses.every(a => a.audienceAppropriate)
      };
    }

    session.completedAt = new Date();
    
    // Move to history
    this.sessionHistory.push(session);
    this.sessions.delete(sessionId);
    
    this.saveData();
    return session;
  }

  /**
   * Get improvement over iterations
   */
  public getSessionProgress(sessionId: string): {
    iterations: number;
    scoreProgress: { iteration: number; score: number }[];
    improvement: number;
    remainingGaps: KnowledgeGap[];
  } | null {
    const session = this.sessions.get(sessionId) || 
                   this.sessionHistory.find(s => s.id === sessionId);
    if (!session) return null;

    const scoreProgress = session.iterations.map((iter, idx) => ({
      iteration: idx + 1,
      score: iter.analysis.overallScore
    }));

    const improvement = session.iterations.length >= 2
      ? session.iterations[session.iterations.length - 1].analysis.overallScore -
        session.iterations[0].analysis.overallScore
      : 0;

    // Get gaps that still exist in the latest iteration
    const remainingGaps = session.iterations.length > 0
      ? session.iterations[session.iterations.length - 1].analysis.gapsIdentified
          .filter(g => g.severity !== 'minor')
      : [];

    return {
      iterations: session.iterations.length,
      scoreProgress,
      improvement,
      remainingGaps
    };
  }

  /**
   * Get all sessions for a user
   */
  public getAllSessions(): { active: FeynmanSession[]; completed: FeynmanSession[] } {
    return {
      active: Array.from(this.sessions.values()),
      completed: this.sessionHistory
    };
  }

  /**
   * Get a specific session
   */
  public getSession(sessionId: string): FeynmanSession | undefined {
    return this.sessions.get(sessionId) || 
           this.sessionHistory.find(s => s.id === sessionId);
  }

  /**
   * Get audience personas
   */
  public getAudiencePersonas() {
    return AUDIENCE_PERSONAS;
  }

  /**
   * Get statistics about Feynman practice
   */
  public getStatistics(): {
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
    averageImprovement: number;
    mostCommonGaps: string[];
    topConcepts: string[];
  } {
    const allSessions = [...Array.from(this.sessions.values()), ...this.sessionHistory];
    const completed = allSessions.filter(s => s.status === 'completed');

    // Calculate average scores
    let totalScore = 0;
    let totalImprovement = 0;
    const gapCounts: Record<string, number> = {};
    const conceptCounts: Record<string, number> = {};

    for (const session of completed) {
      if (session.finalAnalysis) {
        totalScore += session.finalAnalysis.overallScore;
      }
      
      const progress = this.getSessionProgress(session.id);
      if (progress) {
        totalImprovement += progress.improvement;
      }

      // Count gaps
      for (const iter of session.iterations) {
        for (const gap of iter.analysis.gapsIdentified) {
          gapCounts[gap.area] = (gapCounts[gap.area] || 0) + 1;
        }
      }

      // Count concepts
      conceptCounts[session.concept] = (conceptCounts[session.concept] || 0) + 1;
    }

    // Sort gaps and concepts by frequency
    const mostCommonGaps = Object.entries(gapCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([gap]) => gap);

    const topConcepts = Object.entries(conceptCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([concept]) => concept);

    return {
      totalSessions: allSessions.length,
      completedSessions: completed.length,
      averageScore: completed.length > 0 ? Math.round(totalScore / completed.length) : 0,
      averageImprovement: completed.length > 0 ? Math.round(totalImprovement / completed.length) : 0,
      mostCommonGaps,
      topConcepts
    };
  }

  // Helper methods
  private generateFallbackAnalysis(explanation: string): FeynmanAnalysis {
    const wordCount = explanation.split(/\s+/).length;
    const hasExamples = explanation.toLowerCase().includes('example') || 
                       explanation.toLowerCase().includes('for instance');
    const hasAnalogies = explanation.toLowerCase().includes('like') ||
                        explanation.toLowerCase().includes('similar to');

    const clarityScore = Math.min(wordCount > 50 ? 60 : 40, 70);
    const simplicityScore = wordCount < 200 ? 70 : 50;
    const accuracyScore = 60; // Can't verify without more context
    const completenessScore = hasExamples ? 65 : 50;

    return {
      clarityScore,
      simplicityScore,
      accuracyScore,
      completenessScore,
      overallScore: Math.round((clarityScore + simplicityScore + accuracyScore + completenessScore) / 4),
      gapsIdentified: [{
        id: this.generateId(),
        area: 'General',
        description: 'Consider adding more concrete examples',
        severity: 'minor',
        suggestedResources: [],
        relatedConcepts: []
      }],
      jargonUsed: [],
      analogiesUsed: hasAnalogies ? [{
        concept: 'General',
        analogy: 'Detected analogy usage',
        effectiveness: 'moderate',
        explanation: 'Analogies help understanding'
      }] : [],
      strengths: hasExamples ? ['Uses examples'] : ['Attempted explanation'],
      suggestions: ['Add more concrete examples', 'Try explaining to someone out loud'],
      audienceAppropriate: true
    };
  }

  private generateFallbackQuestions(analysis: FeynmanAnalysis): NoviceQuestion[] {
    const questions: NoviceQuestion[] = [
      {
        id: this.generateId(),
        question: "Can you give me a real-world example of this?",
        type: 'practical',
        urgency: 'high'
      },
      {
        id: this.generateId(),
        question: "Why is this important? What problem does it solve?",
        type: 'deeper',
        urgency: 'medium'
      },
      {
        id: this.generateId(),
        question: "What would happen if this didn't exist or worked differently?",
        type: 'challenge',
        urgency: 'medium'
      }
    ];

    // Add questions for identified gaps
    for (const gap of analysis.gapsIdentified.slice(0, 2)) {
      questions.push({
        id: this.generateId(),
        question: `Can you explain more about ${gap.area}?`,
        type: 'clarification',
        urgency: gap.severity === 'critical' ? 'high' : 'medium',
        targetedGap: gap.id
      });
    }

    return questions;
  }

  private consolidateGaps(analyses: FeynmanAnalysis[]): KnowledgeGap[] {
    // Get unique gaps, keeping the most severe version
    const gapMap = new Map<string, KnowledgeGap>();
    
    for (const analysis of analyses) {
      for (const gap of analysis.gapsIdentified) {
        const existing = gapMap.get(gap.area);
        if (!existing || this.severityRank(gap.severity) > this.severityRank(existing.severity)) {
          gapMap.set(gap.area, gap);
        }
      }
    }
    
    return Array.from(gapMap.values());
  }

  private consolidateJargon(analyses: FeynmanAnalysis[]): JargonItem[] {
    const jargonMap = new Map<string, JargonItem>();
    for (const analysis of analyses) {
      for (const jargon of analysis.jargonUsed) {
        if (!jargonMap.has(jargon.term)) {
          jargonMap.set(jargon.term, jargon);
        }
      }
    }
    return Array.from(jargonMap.values());
  }

  private consolidateAnalogies(analyses: FeynmanAnalysis[]): Analogy[] {
    const analogyMap = new Map<string, Analogy>();
    for (const analysis of analyses) {
      for (const analogy of analysis.analogiesUsed) {
        const key = `${analogy.concept}-${analogy.analogy}`;
        if (!analogyMap.has(key)) {
          analogyMap.set(key, analogy);
        }
      }
    }
    return Array.from(analogyMap.values());
  }

  private severityRank(severity: GapSeverity): number {
    return { minor: 1, moderate: 2, critical: 3 }[severity];
  }

  private generateId(): string {
    return `feyn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Persistence
  private saveData(): void {
    try {
      const sessionsData = Array.from(this.sessions.entries());
      const historyData = this.sessionHistory;
      
      localStorage.setItem('polymath_feynman_sessions', JSON.stringify(sessionsData));
      localStorage.setItem('polymath_feynman_history', JSON.stringify(historyData));
    } catch (error) {
      console.error('Error saving Feynman data:', error);
    }
  }

  private loadData(): void {
    try {
      const sessionsData = localStorage.getItem('polymath_feynman_sessions');
      const historyData = localStorage.getItem('polymath_feynman_history');

      if (sessionsData) {
        const parsed = JSON.parse(sessionsData);
        for (const [id, session] of parsed) {
          session.startedAt = new Date(session.startedAt);
          if (session.completedAt) session.completedAt = new Date(session.completedAt);
          for (const iter of session.iterations) {
            iter.timestamp = new Date(iter.timestamp);
          }
          this.sessions.set(id, session);
        }
      }

      if (historyData) {
        const parsed = JSON.parse(historyData);
        for (const session of parsed) {
          session.startedAt = new Date(session.startedAt);
          if (session.completedAt) session.completedAt = new Date(session.completedAt);
          for (const iter of session.iterations) {
            iter.timestamp = new Date(iter.timestamp);
          }
          this.sessionHistory.push(session);
        }
      }
    } catch (error) {
      console.error('Error loading Feynman data:', error);
    }
  }
}

